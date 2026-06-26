import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };
import { prisma } from "@/lib/db";
import type { Prisma } from "@booksy/db";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import {
  CalendarDays,
  Users,
  Users2,
  Scissors,
  CheckCircle2,
  Circle,
  ArrowRight,
  Plus,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";

type ScheduleAppointment = Prisma.AppointmentGetPayload<{
  include: {
    customer: { select: { name: true } };
    service: { select: { name: true; duration: true } };
    staff: { include: { user: { select: { name: true } } } };
  };
}>;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    PENDING: "warning",
    CONFIRMED: "default",
    COMPLETED: "success",
    CANCELLED: "destructive",
    NO_SHOW: "secondary",
  };
  return (
    <Badge variant={map[status] ?? "secondary"}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const STATUS_BORDER: Record<string, string> = {
  PENDING: "border-l-amber-400",
  CONFIRMED: "border-l-brand-500",
  COMPLETED: "border-l-emerald-400",
  NO_SHOW: "border-l-gray-300",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.businessId) redirect("/login");

  const businessId = session.businessId;
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [
    totalCustomers,
    totalServices,
    totalStaff,
    totalLocations,
    todaySchedule,
    comingUp,
  ] = await Promise.all([
    prisma.customer.count({ where: { businessId, isActive: true } }),
    prisma.service.count({ where: { businessId, isActive: true } }),
    prisma.staff.count({ where: { businessId, isActive: true } }),
    prisma.location.count({ where: { businessId, isActive: true } }),
    // All of today's non-cancelled appointments, ordered by time
    prisma.appointment.findMany({
      where: {
        businessId,
        startTime: { gte: startOfDay, lt: endOfDay },
        status: { not: "CANCELLED" },
      },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true, duration: true } },
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startTime: "asc" },
      take: 20,
    }),
    // Upcoming from tomorrow onwards (not today)
    prisma.appointment.findMany({
      where: {
        businessId,
        startTime: { gte: endOfDay },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true, duration: true } },
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startTime: "asc" },
      take: 6,
    }),
  ]);

  // Derived values
  const todayCount = todaySchedule.length;
  const pendingToday = todaySchedule.filter((a) => a.status === "PENDING").length;
  const confirmedToday = todaySchedule.filter((a) => a.status === "CONFIRMED").length;
  const firstName = session.name.split(" ")[0];

  const metrics = [
    {
      label: "Today's Appointments",
      value: todayCount,
      icon: CalendarDays,
      color: "text-brand-600",
      bg: "bg-brand-50",
      border: "border-t-brand-500",
      href: "/bookings",
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-t-emerald-500",
      href: "/customers",
    },
    {
      label: "Active Services",
      value: totalServices,
      icon: Scissors,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-t-purple-500",
      href: "/services",
    },
    {
      label: "Staff Members",
      value: totalStaff,
      icon: Users2,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-t-amber-500",
      href: "/staff",
    },
  ];

  const setupSteps = [
    { label: "Add a location", href: "/locations", done: totalLocations > 0 },
    { label: "Add a service", href: "/services", done: totalServices > 0 },
    { label: "Add a staff member", href: "/staff", done: totalStaff > 0 },
  ];
  const isSetupIncomplete = setupSteps.some((step) => !step.done);

  return (
    <>
      <TopBar
        title={`Welcome back, ${firstName}`}
        subtitle={format(today, "EEEE, MMMM d")}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

        {/* Quick Actions + Day Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">
              {todayCount === 0
                ? "No appointments scheduled for today."
                : `${todayCount} appointment${todayCount !== 1 ? "s" : ""} today${pendingToday > 0 ? ` · ${pendingToday} pending` : ""}${confirmedToday > 0 ? ` · ${confirmedToday} confirmed` : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/bookings"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-600 text-white px-3.5 py-2 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Booking
            </Link>
            <Link
              href="/customers"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-white text-gray-700 border border-gray-200 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add Customer
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-white text-gray-700 border border-gray-200 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Scissors className="h-4 w-4" />
              Add Service
            </Link>
          </div>
        </div>

        {/* Setup checklist */}
        {isSetupIncomplete && (
          <Card className="mb-6 border-brand-100 bg-gradient-to-r from-brand-50/60 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Finish setting up your business</CardTitle>
              <p className="text-sm text-gray-500">
                Complete these steps so customers can start booking with you.
              </p>
            </CardHeader>
            <CardContent className="space-y-1">
              {setupSteps.map((step) => (
                <Link
                  key={step.href}
                  href={step.href}
                  className="flex items-center gap-3 rounded-lg p-2.5 -mx-2.5 hover:bg-white transition-colors group"
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                  )}
                  <span
                    className={`flex-1 text-sm font-medium ${
                      step.done ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {step.label}
                  </span>
                  {!step.done && (
                    <ArrowRight className="h-4 w-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  )}
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
            <Link key={m.label} href={m.href}>
              <Card className={`border-t-4 ${m.border} transition-shadow hover:shadow-md cursor-pointer`}>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        {m.label}
                      </p>
                      <p className="text-4xl font-bold text-gray-900 tracking-tight">
                        {m.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${m.bg}`}>
                      <m.icon className={`h-5 w-5 ${m.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main content: 2-col layout on xl */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <div>
                  <CardTitle>Today&apos;s Schedule</CardTitle>
                  {todayCount > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(today, "EEEE, MMMM d")}
                    </p>
                  )}
                </div>
                <Link
                  href="/bookings"
                  className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1 flex-shrink-0"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                {todaySchedule.length === 0 ? (
                  <div className="py-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                      <CalendarDays className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Nothing scheduled for today</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Bookings you create for today will appear here.
                    </p>
                    <Link
                      href="/bookings"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-600 text-white px-3.5 py-2 rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New Booking
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {todaySchedule.map((appt: ScheduleAppointment) => (
                      <div
                        key={appt.id}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors border-l-4 ${STATUS_BORDER[appt.status] ?? "border-l-gray-200"}`}
                      >
                        <div className="flex-shrink-0 text-right w-[72px]">
                          <p className="text-sm font-bold text-gray-900">
                            {format(new Date(appt.startTime), "h:mm a")}
                          </p>
                          <p className="text-xs text-gray-400">{appt.service.duration} min</p>
                        </div>
                        <div className="w-px h-8 bg-gray-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {appt.customer.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {appt.service.name}
                            {appt.staff ? ` · ${appt.staff.user.name}` : ""}
                          </p>
                        </div>
                        <StatusBadge status={appt.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Coming Up + Business Overview */}
          <div className="xl:col-span-1 space-y-4">
            {/* Coming Up */}
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle>Coming Up</CardTitle>
                <Link
                  href="/bookings"
                  className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1 flex-shrink-0"
                >
                  All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                {comingUp.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="No upcoming bookings"
                    description="Future appointments will appear here."
                    className="py-6"
                  />
                ) : (
                  <div className="space-y-4">
                    {comingUp.map((appt: ScheduleAppointment) => (
                      <div key={appt.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 text-center pt-0.5">
                          <p className="text-sm font-bold text-gray-900 leading-none">
                            {format(new Date(appt.startTime), "d")}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                            {format(new Date(appt.startTime), "MMM")}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {appt.customer.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {appt.service.name} · {format(new Date(appt.startTime), "h:mm a")}
                          </p>
                        </div>
                        <StatusBadge status={appt.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business overview quick links */}
            <Card>
              <CardContent className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Business overview
                </p>
                <div className="divide-y divide-gray-50">
                  {[
                    { label: "Active customers", value: totalCustomers, href: "/customers" },
                    { label: "Active services", value: totalServices, href: "/services" },
                    { label: "Staff members", value: totalStaff, href: "/staff" },
                    { label: "Locations", value: totalLocations, href: "/locations" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between py-2.5 group"
                    >
                      <span className="text-sm text-gray-500 group-hover:text-brand-600 transition-colors">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {item.value}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
