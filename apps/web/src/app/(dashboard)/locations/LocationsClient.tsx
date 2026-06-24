"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LocationFormDialog, type LocationRecord } from "@/components/forms/LocationFormDialog";
import { toast } from "@/hooks/use-toast";

interface LocationsClientProps {
  locations: LocationRecord[];
}

export function LocationsClient({ locations }: LocationsClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LocationRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocationRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.address?.toLowerCase().includes(q)
    );
  }, [locations, query]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/locations/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ variant: "destructive", title: "Couldn't delete location" });
        return;
      }
      toast({ variant: "success", title: "Location deleted" });
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (locations.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={MapPin}
          title="No locations yet"
          description="Add your first location so you can start assigning staff and bookings to it."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          }
        />
        <LocationFormDialog open={createOpen} onOpenChange={setCreateOpen} />
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
            placeholder="Search locations..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Location
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Province</th>
                <th className="px-4 py-3 font-medium">Postal Code</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No locations match &quot;{query}&quot;.
                  </td>
                </tr>
              )}
              {filtered.map((location) => (
                <tr key={location.id}>
                  <td className="px-4 py-3 text-gray-900">{location.name}</td>
                  <td className="px-4 py-3 text-gray-700">{location.address ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{location.city ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{location.province ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{location.postalCode ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{location.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget(location)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(location)}
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

      <LocationFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <LocationFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        location={editTarget}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete location?"
        description={`This will remove "${deleteTarget?.name}" from your active locations. This can't be undone from the UI.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
