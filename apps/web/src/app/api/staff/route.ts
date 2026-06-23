import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { staffSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.staff.findMany({
    where: { businessId: session.businessId, isActive: true },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      location: { select: { id: true, name: true } },
      workingHours: { orderBy: { day: "asc" } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = staffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password, bio, specializations, locationId } =
    parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const hashed = await hashPassword(password ?? "changeme123");

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, password: hashed },
    });

    await tx.businessMember.create({
      data: { userId: user.id, businessId: session.businessId!, role: "STAFF" },
    });

    const staff = await tx.staff.create({
      data: {
        userId: user.id,
        businessId: session.businessId!,
        locationId: locationId || null,
        bio: bio || null,
        specializations: specializations ?? [],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return staff;
  });

  return NextResponse.json(result, { status: 201 });
}
