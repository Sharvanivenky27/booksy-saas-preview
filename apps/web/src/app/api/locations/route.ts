import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { locationSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    where: { businessId: session.businessId, isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = locationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const location = await prisma.location.create({
    data: {
      businessId: session.businessId,
      ...parsed.data,
      email: parsed.data.email || null,
    },
  });

  return NextResponse.json(location, { status: 201 });
}
