import React, { useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SoundPickerDialog from "@/components/homework/SoundPickerDialog";
import { ERROR_PATTERNS, soundIpa } from "@/lib/minimalPairsBank";

export default function ContrastSoundsStep({ sound1, sound2, onSoundChange, pattern, onPatternChange, error }) {
  const [openPicker, setOpenPicker] = useState(null);

  const pickPattern = (id) => {
    const p = ERROR_PATTERNS.find((x) => x.id === id);
    onPatternChange(id);
    onSoundChange(p.sound1, p.sound2);
  };

  const Selector = ({ slot, value, accent }) => (
    <button
      onClick={() => setOpenPicker(slot)}
      className={`flex-1 min-h-[56px] px-6 rounded-full border-2 bg-white text-left flex items-center justify-between gap-3 transition-colors ${
        accent === "gold" ? "border-amber-500 hover:bg-amber-50/50" : "border-purple-600 hover:bg-purple-50/50"
      }`}
    >
      <span className="text-base font-bold text-gray-800">{value ? `/${soundIpa(value)}/` : `Select sound ${slot}`}</span>
      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
    </button>
  );

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-purple-500 text-white">STEP 1</span>
        <span className="text-lg font-bold text-gray-900">Select Contrast Sounds</span>
      </div>

      <div className="pb-5 space-y-4">
        <div className="flex items-center gap-3">
          <Selector slot={1} value={sound1} accent="gold" />
          <span className="text-sm font-semibold text-gray-500">vs</span>
          <Selector slot={2} value={sound2} accent="purple" />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-sm font-medium text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-2">OR choose an error pattern:</p>
          <Select value={pattern} onValueChange={pickPattern}>
            <SelectTrigger className="h-12 rounded-xl border-gray-200 text-sm">
              <SelectValue placeholder="Example: Velar Fronting (k → t)" />
            </SelectTrigger>
            <SelectContent>
              {ERROR_PATTERNS.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SoundPickerDialog
        open={openPicker !== null}
        onOpenChange={(o) => !o && setOpenPicker(null)}
        value={openPicker === 1 ? sound1 : sound2}
        accent={openPicker === 1 ? "gold" : "purple"}
        onSelect={(id) => {
          onPatternChange("");
          onSoundChange(openPicker === 1 ? id : sound1, openPicker === 1 ? sound2 : id);
        }}
      />
    </div>
  );
}