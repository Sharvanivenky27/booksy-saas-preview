"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, UserCog } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StaffFormDialog, type StaffRecord } from "@/components/forms/StaffFormDialog";
import { toast } from "@/hooks/use-toast";

interface StaffClientProps {
  staff: StaffRecord[];
  locations: { id: string; name: string }[];
}

export function StaffClient({ staff, locations }: StaffClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.user.name.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q)
    );
  }, [staff, query]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/staff/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({ variant: "destructive", title: "Couldn't delete staff member" });
        return;
      }
      toast({ variant: "success", title: "Staff member deleted" });
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  if (staff.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={UserCog}
          title="No staff yet"
          description="Add your first team member so you can start assigning them to bookings."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          }
        />
        <StaffFormDialog open={createOpen} onOpenChange={setCreateOpen} locations={locations} />
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
            placeholder="Search staff..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Staff
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No staff match &quot;{query}&quot;.
                  </td>
                </tr>
              )}
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td className="px-4 py-3 text-gray-900">{member.user.name}</td>
                  <td className="px-4 py-3 text-gray-700">{member.user.email}</td>
                  <td className="px-4 py-3 text-gray-700">{member.user.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={member.isActive ? "success" : "secondary"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget(member)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(member)}
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

      <StaffFormDialog open={createOpen} onOpenChange={setCreateOpen} locations={locations} />
      <StaffFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        staff={editTarget}
        locations={locations}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete staff member?"
        description={`This will remove "${deleteTarget?.user.name}" from your active staff.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
