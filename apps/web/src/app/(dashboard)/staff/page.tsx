import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { StaffClient } from "./StaffClient";

export default async function StaffPage() {
  const session = await getSession();
  if (!session?.businessId) redirect("/login");

  const staff = await prisma.staff.findMany({
    where: { businessId: session.businessId },
    select: {
      id: true,
      isActive: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <>
      <TopBar title="Staff" subtitle="Manage your team" />
      <StaffClient staff={staff} />
    </>
  );
}
