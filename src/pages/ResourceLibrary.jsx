import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Library } from "lucide-react";
import ResourceCard from "@/components/library/ResourceCard";
import ResourceFormDialog from "@/components/library/ResourceFormDialog";

const CATEGORIES = ["All", "articulation", "language", "fluency", "voice", "listening", "social", "cognitive", "tutorial", "education"];

export default function ResourceLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["therapyActivities"],
    queryFn: () => base44.entities.TherapyActivity.list("-created_date"),
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => base44.entities.TherapyActivity.create(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["therapyActivities"] }); setDialogOpen(false); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.TherapyActivity.update(id, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["therapyActivities"] }); setDialogOpen(false); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TherapyActivity.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["therapyActivities"] }); setDialogOpen(false); },
  });

  const filtered = materials.filter((m) => {
    const haystack = `${m.title || ""} ${m.description || ""} ${(m.tags || []).join(" ")}`.toLowerCase();
    const ms = haystack.includes(search.toLowerCase());
    const mc = category === "All" || m.category === category;
    return ms && mc;
  });

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing) await updateMutation.mutateAsync({ id: editing.id, payload });
      else await createMutation.mutateAsync(payload);
    } catch (e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (material) => {
    if (!confirm(`Delete "${material.title}"?`)) return;
    setSaving(true);
    try {
      await deleteMutation.mutateAsync(material.id);
    } catch (e) {
      alert("Delete failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (m) => { setEditing(m); setDialogOpen(true); };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Library className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource library</h1>
            <p className="text-sm text-gray-500">Curate and create therapy materials your team can assign</p>
          </div>
        </div>
        <Button onClick={openNew} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" /> New material
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by title, description, or tag…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border capitalize transition-colors ${
              category === c ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="h-56 rounded-xl" />))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((m) => (<ResourceCard key={m.id} material={m} onOpen={openEdit} />))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Library className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">No materials yet</h3>
          <p className="text-sm text-gray-500 mb-3">
            {search || category !== "All" ? "Try adjusting your filters" : "Create your first therapy material — it'll be assignable from the homework builder."}
          </p>
          {!search && category === "All" && (
            <Button onClick={openNew} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4" /> New material
            </Button>
          )}
        </div>
      )}

      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        material={editing}
        user={user}
        onSave={handleSave}
        onDelete={handleDelete}
        saving={saving}
      />
    </div>
  );
}