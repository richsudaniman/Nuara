import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { getWordCards, selectionKey, ALL_PHONEMES } from "@/lib/wordBank";
import TargetSoundsPanel from "@/components/homework/TargetSoundsPanel";
import PhonemeSelectorDialog from "@/components/homework/PhonemeSelectorDialog";
import WordCardGrid from "@/components/homework/WordCardGrid";
import PublishPanel from "@/components/homework/PublishPanel";

const DAY_NAMES = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const DAY_ORDER = Object.keys(DAY_NAMES);

export default function HomeworkBuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patientId");

  const [selections, setSelections] = useState([]);
  const [filters, setFilters] = useState({ syllables: "any", maxPerSound: null });
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [cards, setCards] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [clientId, setClientId] = useState(patientId || "");
  const [days, setDays] = useState(["Tue", "Wed", "Fri"]);
  const [note, setNote] = useState("Practice each word card 5 times. Go slowly and listen for the target sound.");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: therapist } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["trainerAssignments", therapist?.id],
    queryFn: () => base44.entities.PractitionerPatientAssignment.filter({ trainer_id: therapist.id, is_active: true }),
    enabled: !!therapist?.id,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
    enabled: !!therapist?.id,
  });

  const caseloadIds = assignments.map((a) => a.client_id);
  const clients = allUsers.filter((u) => caseloadIds.includes(u.id));
  const lockedClient = patientId ? allUsers.find((u) => u.id === patientId) : null;

  const handleCreate = () => {
    const generated = getWordCards(selections, filters);
    setCards(generated);
    setSelectedIds(generated.map((c) => c.id));
    setSaved(false);
  };

  const handleClear = () => {
    setSelections([]);
    setFilters({ syllables: "any", maxPerSound: null });
    setCards(null);
    setSelectedIds([]);
  };

  const toggleCard = (id) => {
    setSaved(false);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleDay = (d) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const handlePublish = async () => {
    const chosen = cards.filter((c) => selectedIds.includes(c.id));
    const soundLabels = selections
      .map((s) => `/${ALL_PHONEMES.find((p) => p.id === s.phonemeId)?.ipa}/ ${s.position[0].toUpperCase()}`)
      .join(", ");
    setSaving(true);
    try {
      await base44.entities.TherapyPlan.bulkCreate(
        DAY_ORDER.filter((d) => days.includes(d)).map((d) => ({
          assigned_to_client_id: clientId,
          created_by_trainer_id: therapist?.id,
          day_of_week: DAY_NAMES[d],
          workout_type: `Target sounds: ${soundLabels}`,
          order: DAY_ORDER.indexOf(d) + 1,
          exercises: chosen.map((c) => ({
            name: c.word,
            reps: 5,
            sets: 1,
            modality: "audio",
            metric_type: "articulation_accuracy",
            phoneme: c.phonemeIpa,
            position: c.position,
            ipa: c.ipa.replace(/[{}]/g, ""),
            notes: note,
          })),
        }))
      );
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-orange-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Homework builder</h1>
          {lockedClient ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              <User className="w-3.5 h-3.5" /> {lockedClient.full_name}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Build word cards by target sound</span>
          )}
        </div>

        <TargetSoundsPanel
          selections={selections}
          onOpenSelector={() => setSelectorOpen(true)}
          onRemoveSelection={(s) => setSelections((prev) => prev.filter((x) => selectionKey(x) !== selectionKey(s)))}
          filters={filters}
          onFiltersChange={setFilters}
          onClear={handleClear}
          onCreate={handleCreate}
        />

        <PhonemeSelectorDialog open={selectorOpen} onOpenChange={setSelectorOpen} selections={selections} onChange={setSelections} />

        {cards && (
          <>
            <WordCardGrid
              cards={cards}
              selectedIds={selectedIds}
              onToggle={toggleCard}
              onSelectAll={() => setSelectedIds(cards.map((c) => c.id))}
              onClearSelection={() => setSelectedIds([])}
            />
            {cards.length > 0 && (
              <PublishPanel
                clients={clients}
                clientId={clientId}
                onClientChange={setClientId}
                lockedClient={lockedClient}
                days={days}
                onToggleDay={toggleDay}
                note={note}
                onNoteChange={setNote}
                selectedCount={selectedIds.length}
                saving={saving}
                saved={saved}
                onPublish={handlePublish}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}