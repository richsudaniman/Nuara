import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, FileText, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ClientNotes({ clientId, trainerId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ['clientNotes', clientId],
    queryFn: () => base44.entities.ClinicalNote.filter({ client_id: clientId }, '-created_date'),
    initialData: [],
    enabled: !!clientId,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data) => {
      const noteData = {
        ...data,
        client_id: clientId,
        trainer_id: trainerId,
      };

      if (editingNote?.id) {
        return base44.entities.ClinicalNote.update(editingNote.id, noteData);
      } else {
        return base44.entities.ClinicalNote.create(noteData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientNotes'] });
      setShowForm(false);
      setEditingNote(null);
      setFormData({ title: "", content: "" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => base44.entities.ClinicalNote.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientNotes'] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveNoteMutation.mutateAsync(formData);
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setShowForm(true);
  };

  const handleDelete = async (noteId) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNoteMutation.mutateAsync(noteId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNote(null);
    setFormData({ title: "", content: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-black italic text-[#1a1a1a] text-lg">CLIENT NOTES</h3>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic glow-blue"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white border-2 border-[#0ea5e9] glow-blue">
          <CardContent className="p-5">
            <h4 className="font-black italic text-[#1a1a1a] mb-4">
              {editingNote ? 'EDIT NOTE' : 'NEW NOTE'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Title</label>
                <Input
                  placeholder="Note title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white border-gray-300"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Notes</label>
                <Textarea
                  placeholder="Write your notes about this client..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-white border-gray-300 h-32"
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveNoteMutation.isPending}
                  className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold italic glow-blue"
                >
                  {saveNoteMutation.isPending ? 'Saving...' : (editingNote ? 'Update Note' : 'Save Note')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-gray-100" />)}
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map(note => (
            <Card key={note.id} className="bg-white border-2 border-gray-200 hover:border-[#0ea5e9] transition-colors">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-[#0ea5e9]" />
                      <h4 className="font-black italic text-[#1a1a1a] text-lg">{note.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap mb-2">{note.content}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(note.created_date), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(note)}
                      className="text-gray-600 hover:text-[#0ea5e9]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 italic">
          No notes yet. Click "Add Note" to create one.
        </div>
      )}
    </div>
  );
}