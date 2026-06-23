import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CalendarDays,
  Users,
  Scissors,
  Clock,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    PENDING: "warning",
    CONFIRMED: "default",
    COMPLETED: "success",
    CANCELLED: "destructive",
    NO_SHOW: "secondary",
  };
  return <Badge variant={map[status] ?? "secondary"}>{status}</Badge>;
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
    },
    {
      label: "Total Customers",
      value: totalCustomers,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Services",
      value: totalServices,
      icon: Scissors,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Staff Members",
      value: totalStaff,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle={`Welcome back, ${session.name}`}
      />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
            <Card key={m.label} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{m.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">
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
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
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
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 text-center w-12">
                      <p className="text-xs text-gray-400 uppercase">
                        {format(appt.startTime, "MMM")}
                      </p>
                      <p className="text-lg font-bold text-gray-900 leading-none">
                        {format(appt.startTime, "d")}
                      </p>
                    </div>
                    <div className="flex-shrink-0 hidden sm:block">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appt.customer.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {appt.service.name} ·{" "}
                        {format(appt.startTime, "h:mm a")}
                        {appt.staff &&
                          ` · ${appt.staff.user.name}`}
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
