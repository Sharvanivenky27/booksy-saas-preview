"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Scissors, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ServiceFormDialog, type ServiceRecord } from "@/components/forms/ServiceFormDialog";
import { toast } from "@/hooks/use-toast";

interface ServicesClientProps {
  services: ServiceRecord[];
}

function formatPrice(price: number | string, currency: string) {
  const amount = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(amount);
}

export function ServicesClient({ services }: ServicesClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
    );
  }, [services, query]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/services/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ variant: "destructive", title: "Couldn't delete service" });
        return;
      }
      toast({ variant: "success", title: "Service deleted" });
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (services.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add your first service so customers and staff have something to book."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          }
        />
        <ServiceFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Service
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No services match &quot;{query}&quot;.
                  </td>
                </tr>
              )}
              {filtered.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-3 text-gray-900">{service.name}</td>
                  <td className="px-4 py-3 text-gray-700">{service.category ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatPrice(service.price, service.currency)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{service.duration} min</td>
                  <td className="px-4 py-3">
                    <Badge variant={service.isActive ? "success" : "secondary"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget(service)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(service)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ServiceFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ServiceFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        service={editTarget}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete service?"
        description={`This will mark "${deleteTarget?.name}" as inactive. It will no longer be bookable.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
