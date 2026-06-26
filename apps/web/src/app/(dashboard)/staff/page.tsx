import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Staff" };
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { StaffClient } from "./StaffClient";

export default async function StaffPage() {
  const session = await getSession();
  if (!session?.businessId) redirect("/login");

  const [staff, locations] = await Promise.all([
    prisma.staff.findMany({
      where: { businessId: session.businessId },
      select: {
        id: true,
        isActive: true,
        bio: true,
        locationId: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.location.findMany({
      where: { businessId: session.businessId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <>
      <TopBar title="Staff" subtitle="Manage your team" />
      <StaffClient staff={staff} locations={locations} />
    </>
  );
}
