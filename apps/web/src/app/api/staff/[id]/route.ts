import { NextRequest, NextResponse } from "next/server";
import { DayOfWeek } from "@booksy/db";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { bio, specializations, locationId, workingHours } = body;

  const staff = await prisma.staff.update({
    where: { id },
    data: {
      bio: bio ?? undefined,
      specializations: specializations ?? undefined,
      locationId: locationId ?? undefined,
    },
  });

  // Replace working hours if provided
  if (workingHours && Array.isArray(workingHours)) {
    await prisma.workingHour.deleteMany({ where: { staffId: id } });
    await prisma.workingHour.createMany({
      data: workingHours.map(
        (wh: { day: DayOfWeek; startTime: string; endTime: string; isActive?: boolean }) => ({
          staffId: id,
          day: wh.day,
          startTime: wh.startTime,
          endTime: wh.endTime,
          isActive: wh.isActive ?? true,
        })
      ),
    });
  }

  return NextResponse.json(staff);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.staff.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}
