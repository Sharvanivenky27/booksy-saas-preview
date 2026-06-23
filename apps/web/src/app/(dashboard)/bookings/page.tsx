import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { BookingsClient } from "./BookingsClient";

export default async function BookingsPage() {
  const session = await getSession();
  if (!session?.businessId) redirect("/login");

  const businessId = session.businessId;

  const [appointments, customers, services, staff] = await Promise.all([
    prisma.appointment.findMany({
      where: { businessId },
      include: {
        customer: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
        staff: { include: { user: { select: { id: true, name: true } } } },
        location: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "desc" },
      take: 100,
    }),
    prisma.customer.findMany({
      where: { businessId, isActive: true },
      select: { id: true, name: true, phone: true },
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      where: { businessId, isActive: true },
      select: { id: true, name: true, duration: true, price: true },
      orderBy: { name: "asc" },
    }),
    prisma.staff.findMany({
      where: { businessId, isActive: true },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  return (
    <>
      <TopBar title="Bookings" subtitle="Manage all appointments" />
      <BookingsClient
        appointments={JSON.parse(JSON.stringify(appointments))}
        customers={customers}
        services={JSON.parse(JSON.stringify(services))}
        staff={staff.map((s: (typeof staff)[number]) => ({ id: s.id, name: s.user.name }))}
      />
    </>
  );
}
