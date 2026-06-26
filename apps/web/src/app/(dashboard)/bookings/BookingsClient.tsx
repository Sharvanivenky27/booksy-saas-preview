"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
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
import { cn } from "@/lib/cn";

type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
type FilterId = "all" | "today" | "pending" | "confirmed" | "completed" | "cancelled";

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
  "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW",
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

function Avatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const time = format(date, "h:mm a");
  if (isToday(date)) return { label: `Today · ${time}`, highlight: true };
  if (isTomorrow(date)) return { label: `Tomorrow · ${time}`, highlight: false };
  if (isYesterday(date)) return { label: `Yesterday · ${time}`, highlight: false };
  return { label: format(date, "MMM d · h:mm a"), highlight: false };
}

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

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
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  useEffect(() => {
    setRows(appointments);
  }, [appointments]);

  const filtered = useMemo(() => {
    return rows.filter((appt) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "today") return isToday(new Date(appt.startTime));
      return appt.status.toLowerCase() === activeFilter;
    });
  }, [rows, activeFilter]);

  // Count per filter for badge display
  const counts = useMemo<Record<FilterId, number>>(() => ({
    all: rows.length,
    today: rows.filter((r) => isToday(new Date(r.startTime))).length,
    pending: rows.filter((r) => r.status === "PENDING").length,
    confirmed: rows.filter((r) => r.status === "CONFIRMED").length,
    completed: rows.filter((r) => r.status === "COMPLETED").length,
    cancelled: rows.filter((r) => r.status === "CANCELLED").length,
  }), [rows]);

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
          description="New bookings will appear here as you create them or customers schedule appointments."
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
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {FILTERS.map((f) => {
            const count = counts[f.id];
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                      active ? "bg-brand-100 text-brand-700" : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Button onClick={() => setCreateOpen(true)} className="flex-shrink-0">
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-400">
        Showing <span className="font-medium text-gray-600">{filtered.length}</span> of{" "}
        <span className="font-medium text-gray-600">{rows.length}</span> bookings
      </p>

      {/* Table or empty filter state */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 py-12 text-center bg-white">
          <p className="text-sm font-medium text-gray-500">No bookings match this filter</p>
          <button
            onClick={() => setActiveFilter("all")}
            className="mt-2 text-sm text-brand-600 hover:underline"
          >
            Clear filter
          </button>
        </div>
      ) : (
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
                {filtered.map((appt) => {
                  const { label: dateLabel, highlight } = formatRelativeDate(appt.startTime);
                  return (
                    <tr key={appt.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={appt.customer.name} />
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
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={highlight ? "text-brand-600 font-medium" : "text-gray-600"}>
                          {dateLabel}
                        </span>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <BookingFormDialog open={createOpen} onOpenChange={setCreateOpen} customers={customers} services={services} staff={staff} locations={locations} />
    </div>
  );
}
