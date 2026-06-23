import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appointmentSchema } from "@/lib/validations";
import { addMinutes } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");
  const staffId = searchParams.get("staffId");

  const where: Record<string, unknown> = { businessId: session.businessId };
  if (status) where.status = status;
  if (staffId) where.staffId = staffId;
  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    where.startTime = { gte: start, lt: end };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      service: { select: { id: true, name: true, duration: true, price: true } },
      staff: { include: { user: { select: { id: true, name: true } } } },
      location: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { customerId, serviceId, staffId, locationId, startTime, notes } =
    parsed.data;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId: session.businessId },
  });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const start = new Date(startTime);
  const end = addMinutes(start, service.duration);

  const appointment = await prisma.appointment.create({
    data: {
      businessId: session.businessId,
      customerId,
      serviceId,
      staffId: staffId || null,
      locationId: locationId || null,
      startTime: start,
      endTime: end,
      notes,
      status: "CONFIRMED",
    },
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
