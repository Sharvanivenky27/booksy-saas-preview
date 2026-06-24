import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TopBar } from "@/components/layout/TopBar";
import { LocationsClient } from "./LocationsClient";

export default async function LocationsPage() {
  const session = await getSession();
  if (!session?.businessId) redirect("/login");

  const locations = await prisma.location.findMany({
    where: { businessId: session.businessId, isActive: true },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      province: true,
      postalCode: true,
      phone: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <TopBar title="Locations" subtitle="Manage your business locations" />
      <LocationsClient locations={locations} />
    </>
  );
}
