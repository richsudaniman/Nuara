import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { getWordCards, selectionKey, ALL_PHONEMES } from "@/lib/wordBank";
import HomeworkTypeStep, { HOMEWORK_TYPES } from "@/components/homework/HomeworkTypeStep";
import TargetSoundsPanel from "@/components/homework/TargetSoundsPanel";
import PhonemeSelectorDialog from "@/components/homework/PhonemeSelectorDialog";
import WordCardGrid from "@/components/homework/WordCardGrid";
import PassageBuilder, { STRATEGIES, splitSentences } from "@/components/homework/PassageBuilder";
import MinimalPairsPanel from "@/components/homework/MinimalPairsPanel";
import MinimalPairsGrid from "@/components/homework/MinimalPairsGrid";
import { getMinimalPairs, soundIpa, ERROR_PATTERNS } from "@/lib/minimalPairsBank";
import { generateMinimalPairsWithAI } from "@/lib/aiMinimalPairs";
import PublishPanel from "@/components/homework/PublishPanel";

const DAY_NAMES = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const DAY_ORDER = Object.keys(DAY_NAMES);
const DEFAULT_NOTES = {
  articulation: "Practice each word card the number of times shown. Go slowly and listen for the target sound.",
  minimal_pairs: "Say both words in each pair clearly so they sound different. Listen carefully to the contrast.",
  fluency: "Read each sentence using the strategy we practiced. Take your time and breathe before each one.",
  reading: "Read each sentence aloud clearly. It's okay to pause and try again.",
};

export default function HomeworkBuilder() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("patientId");

  const [type, setType] = useState(null);
  // articulation
  const [selections, setSelections] = useState([]);
  const [filters, setFilters] = useState({ syllables: [], structures: [], maxPerSound: null });
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [cards, setCards] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [cardReps, setCardReps] = useState({});
  // minimal pairs
  const [sound1, setSound1] = useState("");
  const [sound2, setSound2] = useState("");
  const [pattern, setPattern] = useState("");
  const [positions, setPositions] = useState(["initial"]);
  const [excluded, setExcluded] = useState([]);
  const [pairs, setPairs] = useState(null);
  const [generating, setGenerating] = useState(false);
  // fluency / reading
  const [passage, setPassage] = useState("");
  const [sentences, setSentences] = useState([]);
  const [strategy, setStrategy] = useState("");
  const [targetRate, setTargetRate] = useState("");
  // publish
  const [clientId, setClientId] = useState(patientId || "");
  const [days, setDays] = useState(["Tue", "Wed", "Fri"]);
  const [note, setNote] = useState("");
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
  const typeMeta = HOMEWORK_TYPES.find((t) => t.id === type);
  const isPassage = type === "fluency" || type === "reading";

  const handleTypeChange = (t) => {
    setType(t);
    setNote(DEFAULT_NOTES[t]);
    setStrategy(STRATEGIES[t]?.[0] || "");
    setSaved(false);
  };

  const handleCreate = () => {
    const generated = getWordCards(selections, filters);
    setCards(generated);
    setSelectedIds(generated.map((c) => c.id));
    setCardReps({});
    setSaved(false);
  };

  const handleClear = () => {
    setSelections([]);
    setFilters({ syllables: [], structures: [], maxPerSound: null });
    setCards(null);
    setSelectedIds([]);
    setCardReps({});
  };

  const handleClearPairs = () => {
    setFilters({ syllables: [], structures: [], maxPerSound: null });
    setPositions([]);
    setExcluded([]);
    setPairs(null);
    setSelectedIds([]);
    setCardReps({});
  };

  const handleCreatePairs = async () => {
    setSaved(false);
    setCardReps({});
    let found = getMinimalPairs(sound1, sound2, { positions, excluded, ...filters });
    if (found.length === 0) {
      setGenerating(true);
      try {
        found = await generateMinimalPairsWithAI(sound1, sound2, { positions, ...filters });
      } finally {
        setGenerating(false);
      }
    }
    setPairs(found);
    setSelectedIds(found.map((p) => p.id));
  };

  const toggleCard = (id) => {
    setSaved(false);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handlePassageChange = (text) => {
    setPassage(text);
    setSentences(splitSentences(text).map((s, i) => ({ id: `${i}-${s}`, text: s, reps: 1 })));
    setSaved(false);
  };

  const toggleDay = (d) => setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const buildExercises = () => {
    if (type === "articulation") {
      return cards
        .filter((c) => selectedIds.includes(c.id))
        .map((c) => ({
          name: c.word,
          reps: cardReps[c.id] ?? 5,
          sets: 1,
          modality: "audio",
          metric_type: typeMeta.metric,
          phoneme: c.phonemeIpa,
          position: c.position,
          ipa: c.ipa.replace(/[{}]/g, ""),
          notes: note,
        }));
    }
    if (type === "minimal_pairs") {
      return pairs
        .filter((p) => selectedIds.includes(p.id))
        .map((p) => ({
          name: `${p.word1} / ${p.word2}`,
          reps: cardReps[p.id] ?? 5,
          sets: 1,
          modality: "audio",
          metric_type: typeMeta.metric,
          phoneme: `${soundIpa(sound1)} vs ${soundIpa(sound2)}`,
          position: p.position,
          ipa: `${p.ipa1.replace(/[{}]/g, "")} / ${p.ipa2.replace(/[{}]/g, "")}`,
          notes: note,
        }));
    }
    return sentences.map((s) => ({
      name: s.text,
      reps: s.reps,
      sets: 1,
      modality: "audio",
      metric_type: typeMeta.metric,
      notes: note,
    }));
  };

  const patternLabel = ERROR_PATTERNS.find((p) => p.id === pattern)?.label;
  const strategyTarget = isPassage
    ? [strategy, targetRate ? `${targetRate} wpm` : null].filter(Boolean).join(" · ")
    : type === "minimal_pairs"
    ? [`/${soundIpa(sound1)}/ vs /${soundIpa(sound2)}/`, patternLabel].filter(Boolean).join(" · ")
    : undefined;
  const workoutType =
    type === "articulation"
      ? `Target sounds: ${selections.map((s) => `/${ALL_PHONEMES.find((p) => p.id === s.phonemeId)?.ipa}/ ${s.position[0].toUpperCase()}`).join(", ")}`
      : type === "minimal_pairs"
      ? `Minimal pairs: /${soundIpa(sound1)}/ vs /${soundIpa(sound2)}/`
      : `${typeMeta?.label}: ${strategy}`;

  const handlePublish = async () => {
    const exercises = buildExercises();
    setSaving(true);
    try {
      await base44.entities.TherapyPlan.bulkCreate(
        DAY_ORDER.filter((d) => days.includes(d)).map((d) => ({
          assigned_to_client_id: clientId,
          created_by_trainer_id: therapist?.id,
          day_of_week: DAY_NAMES[d],
          workout_type: workoutType,
          homework_type: type,
          strategy_target: strategyTarget,
          order: DAY_ORDER.indexOf(d) + 1,
          exercises,
        }))
      );
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const exerciseCount = type === "articulation" || type === "minimal_pairs" ? selectedIds.length : sentences.length;
  const showPublish =
    type === "articulation"
      ? cards && cards.length > 0
      : type === "minimal_pairs"
      ? pairs && pairs.length > 0
      : isPassage && sentences.length > 0;
  const itemLabel = type === "articulation" ? "word cards" : type === "minimal_pairs" ? "pairs" : "sentences";

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
            <span className="text-sm text-gray-400">Assign articulation, fluency or reading homework</span>
          )}
        </div>

        <HomeworkTypeStep value={type} onChange={handleTypeChange} />

        {type === "articulation" && (
          <>
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
              <WordCardGrid
                cards={cards}
                selectedIds={selectedIds}
                onToggle={toggleCard}
                onSelectAll={() => setSelectedIds(cards.map((c) => c.id))}
                onClearSelection={() => setSelectedIds([])}
                reps={cardReps}
                onRepsChange={(id, n) => setCardReps((prev) => ({ ...prev, [id]: n }))}
              />
            )}
          </>
        )}

        {type === "minimal_pairs" && (
          <>
            <MinimalPairsPanel
              sound1={sound1}
              sound2={sound2}
              onSoundChange={(a, b) => {
                setSound1(a);
                setSound2(b);
                setPairs(null);
              }}
              pattern={pattern}
              onPatternChange={setPattern}
              positions={positions}
              onTogglePosition={(p) => setPositions((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))}
              excluded={excluded}
              onToggleExcluded={(p) => setExcluded((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))}
              filters={filters}
              onFiltersChange={setFilters}
              onClear={handleClearPairs}
              onCreate={handleCreatePairs}
              generating={generating}
            />
            {generating && (
              <p className="text-center text-sm font-medium text-purple-600">Generating minimal pairs with AI…</p>
            )}
            {pairs && !generating && (
              <MinimalPairsGrid
                pairs={pairs}
                sound1={sound1}
                sound2={sound2}
                selectedIds={selectedIds}
                onToggle={toggleCard}
                onSelectAll={() => setSelectedIds(pairs.map((p) => p.id))}
                onClearSelection={() => setSelectedIds([])}
                reps={cardReps}
                onRepsChange={(id, n) => setCardReps((prev) => ({ ...prev, [id]: n }))}
              />
            )}
          </>
        )}

        {isPassage && (
          <PassageBuilder
            type={type}
            passage={passage}
            onPassageChange={handlePassageChange}
            strategy={strategy}
            onStrategyChange={setStrategy}
            targetRate={targetRate}
            onTargetRateChange={setTargetRate}
            sentences={sentences}
            onRepsChange={(id, n) => setSentences((prev) => prev.map((s) => (s.id === id ? { ...s, reps: n } : s)))}
            onRemove={(id) => setSentences((prev) => prev.filter((s) => s.id !== id))}
          />
        )}

        {showPublish && (
          <PublishPanel
            clients={clients}
            clientId={clientId}
            onClientChange={setClientId}
            lockedClient={lockedClient}
            days={days}
            onToggleDay={toggleDay}
            note={note}
            onNoteChange={setNote}
            selectedCount={exerciseCount}
            itemLabel={itemLabel}
            saving={saving}
            saved={saved}
            onPublish={handlePublish}
          />
        )}
      </div>
    </div>
  );
}