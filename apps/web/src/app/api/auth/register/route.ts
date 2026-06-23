import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, hashPassword, type SessionPayload } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, businessName, businessType } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const slug = generateSlug(businessName);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashed,
          platformRole: "USER",
        },
      });

      const business = await tx.business.create({
        data: {
          name: businessName,
          slug,
          type: businessType,
        },
      });

      await tx.businessMember.create({
        data: {
          userId: user.id,
          businessId: business.id,
          role: "OWNER",
        },
      });

      // Default location
      await tx.location.create({
        data: {
          businessId: business.id,
          name: "Main Location",
        },
      });

      return { user, business };
    });

    const sessionPayload: SessionPayload = {
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      platformRole: result.user.platformRole,
      businessId: result.business.id,
      businessRole: "OWNER",
    };

    await createSession(sessionPayload);

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          businessId: result.business.id,
          businessName: result.business.name,
          businessRole: "OWNER",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
