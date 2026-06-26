import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  let businessName = "My Business";
  if (session.businessId) {
    const business = await prisma.business.findUnique({
      where: { id: session.businessId },
      select: { name: true },
    });
    businessName = business?.name ?? businessName;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          businessName={businessName}
          userName={session.name}
          userRole={session.businessRole}
        />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</main>
      </div>
    </SidebarProvider>
  );
}
