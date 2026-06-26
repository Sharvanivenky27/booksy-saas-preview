"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomerFormDialog, type CustomerRecord } from "@/components/forms/CustomerFormDialog";
import { toast } from "@/hooks/use-toast";

const AVATAR_COLORS = [
  "bg-brand-100 text-brand-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];

function CustomerAvatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-xs font-semibold flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

interface CustomerRow extends CustomerRecord {
  _count?: { appointments: number };
}

interface CustomersClientProps {
  customers: CustomerRow[];
}

export function CustomersClient({ customers }: CustomersClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [customers, query]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ variant: "destructive", title: "Couldn't delete customer" });
        return;
      }
      toast({ variant: "success", title: "Customer deleted" });
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (customers.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start booking appointments for them."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          }
        />
        <CustomerFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Customer
        </Button>
      </div>

      {query && (
        <p className="text-xs text-gray-400">
          Showing <span className="font-medium text-gray-600">{filtered.length}</span> of{" "}
          <span className="font-medium text-gray-600">{customers.length}</span> customers
        </p>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">Notes</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    No customers match &quot;{query}&quot;.
                  </td>
                </tr>
              )}
              {filtered.map((customer) => {
                const bookingCount = customer._count?.appointments ?? 0;
                return (
                  <tr key={customer.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <CustomerAvatar name={customer.name} />
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{customer.email ?? "—"}</td>
                    <td className="px-4 py-3.5 text-gray-500">{customer.phone ?? "—"}</td>
                    <td className="px-4 py-3.5">
                      {bookingCount > 0 ? (
                        <Badge variant="secondary" className="font-semibold">
                          {bookingCount}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-300">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      {customer.notes ? (
                        <span className="text-gray-500 text-sm truncate block" title={customer.notes}>
                          {customer.notes}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditTarget(customer)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(customer)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <CustomerFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CustomerFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        customer={editTarget}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete customer?"
        description={`This will remove "${deleteTarget?.name}" from your active customers.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
