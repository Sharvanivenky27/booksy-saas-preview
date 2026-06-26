import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Services" };
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { ServicesClient } from "./ServicesClient";

export default async function ServicesPage() {
  const session = await getSession();
  if (!session?.businessId) redirect("/login");

  const services = await prisma.service.findMany({
    where: { businessId: session.businessId },
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      duration: true,
      price: true,
      currency: true,
      isActive: true,
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <TopBar title="Services" subtitle="Manage your service catalog" />
      <ServicesClient services={JSON.parse(JSON.stringify(services))} />
    </>
  );
}
