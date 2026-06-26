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
} from "lucide-react";
import { format } from "date-fns";

type UpcomingAppointment = Prisma.AppointmentGetPayload<{
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

function CustomerAvatar({ name }: { name: string }) {
  const colors = [
    "bg-brand-100 text-brand-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-sky-100 text-sky-700",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <div
      className={`h-9 w-9 rounded-full ${colors[colorIndex]} flex items-center justify-center text-sm font-semibold flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.businessId) redirect("/login");

  const businessId = session.businessId;
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [
    todayAppointments,
    totalCustomers,
    totalServices,
    totalStaff,
    totalLocations,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        businessId,
        startTime: { gte: startOfDay, lt: endOfDay },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.customer.count({ where: { businessId, isActive: true } }),
    prisma.service.count({ where: { businessId, isActive: true } }),
    prisma.staff.count({ where: { businessId, isActive: true } }),
    prisma.location.count({ where: { businessId, isActive: true } }),
    prisma.appointment.findMany({
      where: {
        businessId,
        startTime: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        customer: { select: { name: true } },
        service: { select: { name: true, duration: true } },
        staff: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startTime: "asc" },
      take: 8,
    }),
  ]);

  const metrics = [
    {
      label: "Today's Appointments",
      value: todayAppointments,
      icon: CalendarDays,
      color: "text-brand-600",
      bg: "bg-brand-50",
      border: "border-t-brand-500",
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-t-emerald-500",
    },
    {
      label: "Active Services",
      value: totalServices,
      icon: Scissors,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-t-purple-500",
    },
    {
      label: "Staff Members",
      value: totalStaff,
      icon: Users2,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-t-amber-500",
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
        title="Dashboard"
        subtitle={`Welcome back, ${session.name}`}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Getting started checklist */}
        {isSetupIncomplete && (
          <Card className="mb-6 border-brand-100 bg-brand-50/40">
            <CardHeader>
              <CardTitle>Finish setting up your business</CardTitle>
              <p className="text-sm text-gray-500">
                Complete these steps so customers can start booking with you.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {setupSteps.map((step) => (
                <Link
                  key={step.href}
                  href={step.href}
                  className="flex items-center gap-3 rounded-lg p-2.5 -mx-2.5 hover:bg-white transition-colors group"
                >
                  {step.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
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
                    <ArrowRight className="h-4 w-4 text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  )}
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
            <Card
              key={m.label}
              className={`border-t-4 ${m.border} transition-shadow hover:shadow-md`}
            >
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
          ))}
        </div>

        {/* Upcoming appointments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle>Upcoming Appointments</CardTitle>
            <Link
              href="/bookings"
              className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming appointments"
                description="New bookings will show up here as customers schedule them."
              />
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map((appt: UpcomingAppointment) => (
                  <div
                    key={appt.id}
                    className="flex items-center gap-3 sm:gap-4 p-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <CustomerAvatar name={appt.customer.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {appt.customer.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {appt.service.name} ·{" "}
                        {format(appt.startTime, "MMM d, h:mm a")}
                        {appt.staff && ` · ${appt.staff.user.name}`}
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
    </>
  );
}
