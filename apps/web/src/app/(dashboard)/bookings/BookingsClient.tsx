"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarX2, Plus, XCircle } from "lucide-react";
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

interface Customer { id: string; name: string; phone: string | null }
interface Service { id: string; name: string; duration: number; price: number }
interface StaffMember { id: string; name: string }
interface Location { id: string; name: string }

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

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

const STATUS_VARIANT: Record<AppointmentStatus, "warning" | "success" | "secondary" | "destructive" | "default"> = {
  PENDING: "warning",
  CONFIRMED: "default",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "secondary",
};

const AVATAR_COLORS = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];

function CustomerAvatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

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
        toast({ variant: "destructive", title: "Couldn't update status", description: "Please try again." });
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ variant: "success", title: `Booking marked as ${STATUS_LABELS[status]}` });
    } catch {
      toast({ variant: "destructive", title: "Couldn't update status", description: "Check your connection and try again." });
    } finally {
      setUpdatingId(null);
    }
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
        <BookingFormDialog open={createOpen} onOpenChange={setCreateOpen} customers={customers} services={services} staff={staff} locations={locations} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Staff</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Date &amp; Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <CustomerAvatar name={appt.customer.name} />
                      <span className="font-medium text-gray-900">{appt.customer.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{appt.service.name}</td>
                  <td className="px-4 py-3.5">
                    {appt.staff ? (
                      <span className="text-gray-600">{appt.staff.user.name}</span>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {format(new Date(appt.startTime), "MMM d, yyyy")}
                    <span className="text-gray-400 ml-1.5">{format(new Date(appt.startTime), "h:mm a")}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={STATUS_VARIANT[appt.status]}>{STATUS_LABELS[appt.status]}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={appt.status}
                        onValueChange={(value) => updateStatus(appt.id, value as AppointmentStatus)}
                        disabled={updatingId === appt.id}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        title="Cancel booking"
                        disabled={appt.status === "CANCELLED" || updatingId === appt.id}
                        onClick={() => updateStatus(appt.id, "CANCELLED")}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <BookingFormDialog open={createOpen} onOpenChange={setCreateOpen} customers={customers} services={services} staff={staff} locations={locations} />
    </div>
  );
}
