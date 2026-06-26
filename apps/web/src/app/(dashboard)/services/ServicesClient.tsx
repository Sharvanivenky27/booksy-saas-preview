"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Plus, Scissors, Search } from "lucide-react";
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
  return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(amount);
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
    <div className="p-4 sm:p-6 space-y-5">
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

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          No services match &quot;{query}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-brand-100 hover:shadow-md transition-all"
            >
              {/* Top: name + status badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
                  {service.category && (
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                      {service.category}
                    </span>
                  )}
                </div>
                <Badge variant={service.isActive ? "success" : "secondary"} className="flex-shrink-0 mt-0.5">
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Bottom: price + duration + actions */}
              <div className="flex items-end justify-between pt-3 mt-3 border-t border-gray-50">
                <div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">
                    {formatPrice(service.price, service.currency)}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3" />
                    {service.duration} min
                  </p>
                </div>
                <div className="flex gap-1">
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
              </div>
            </div>
          ))}
        </div>
      )}

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
