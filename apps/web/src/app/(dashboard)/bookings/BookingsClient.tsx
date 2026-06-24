"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarX2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BookingFormDialog } from "@/components/forms/BookingFormDialog";
import { toast } from "@/hooks/use-toast";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  customer: { id: string; name: string };
  service: { id: string; name: string; duration: number; price: number };
  staff: { id: string; user: { id: string; name: string } } | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface StaffMember {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

interface BookingsClientProps {
  appointments: Appointment[];
  customers: Customer[];
  services: Service[];
  staff: StaffMember[];
  locations: Location[];
}

const STATUS_OPTIONS: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const STATUS_VARIANT: Record<AppointmentStatus, "warning" | "success" | "secondary" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
};

export function BookingsClient({
  appointments,
  customers,
  services,
  staff,
  locations,
}: BookingsClientProps) {
  const [rows, setRows] = useState(appointments);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Keep local rows in sync with the server-fetched prop (e.g. after
  // router.refresh() following a new booking), without clobbering the
  // optimistic status updates applied directly to `rows` below.
  useEffect(() => {
    setRows(appointments);
  }, [appointments]);

  async function updateStatus(id: string, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Couldn't update status",
          description: "Please try again.",
        });
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ variant: "success", title: `Booking marked as ${status}` });
    } catch {
      toast({
        variant: "destructive",
        title: "Couldn't update status",
        description: "Check your connection and try again.",
      });
    } finally {
      setUpdatingId(null);
    }
  }

  function cancelBooking(id: string) {
    updateStatus(id, "CANCELLED");
  }

  if (rows.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={CalendarX2}
          title="No bookings yet"
          description="New bookings will show up here as customers schedule them."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Booking
            </Button>
          }
        />
        <BookingFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          customers={customers}
          services={services}
          staff={staff}
          locations={locations}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Date / Time</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((appt) => (
                <tr key={appt.id}>
                  <td className="px-4 py-3 text-gray-900">{appt.customer.name}</td>
                  <td className="px-4 py-3 text-gray-700">{appt.service.name}</td>
                  <td className="px-4 py-3 text-gray-700">{appt.staff?.user.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {format(new Date(appt.startTime), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[appt.status]}>{appt.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={appt.status}
                        onValueChange={(value) => updateStatus(appt.id, value as AppointmentStatus)}
                        disabled={updatingId === appt.id}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={appt.status === "CANCELLED" || updatingId === appt.id}
                        onClick={() => cancelBooking(appt.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <BookingFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customers={customers}
        services={services}
        staff={staff}
        locations={locations}
      />
    </div>
  );
}
