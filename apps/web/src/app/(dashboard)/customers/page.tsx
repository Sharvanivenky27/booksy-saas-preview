import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Customers" };
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { CustomersClient } from "./CustomersClient";

export default async function CustomersPage() {
  const session = await getSession();
  if (!session?.businessId) redirect("/login");

  const customers = await prisma.customer.findMany({
    where: { businessId: session.businessId, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      notes: true,
      _count: { select: { appointments: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <TopBar title="Customers" subtitle={`${customers.length} customer${customers.length !== 1 ? "s" : ""}`} />
      <CustomersClient customers={JSON.parse(JSON.stringify(customers))} />
    </>
  );
}
