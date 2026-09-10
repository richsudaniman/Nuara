import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectionPills from "@/components/homework/SelectionPills";
import RefineFilters from "@/components/homework/RefineFilters";

function StepHeader({ step, title, open, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 py-4 text-left">
      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${open ? "bg-purple-500 text-white" : "bg-purple-100 text-purple-600"}`}>
        STEP {step}
      </span>
      <span className="text-lg font-bold text-gray-900 flex-1">{title}</span>
      {open ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
    </button>
  );
}

export default function TargetSoundsPanel({ selections, onOpenSelector, onRemoveSelection, filters, onFiltersChange, onClear, onCreate }) {
  const [openStep, setOpenStep] = useState(1);
  const hasSelection = selections.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-7 pb-7 divide-y divide-gray-100">
      <div>
        <StepHeader step={1} title="Target Sounds" open={openStep === 1} onClick={() => setOpenStep(openStep === 1 ? 0 : 1)} />
        {openStep === 1 && (
          <div className="pb-5">
            <button
              onClick={onOpenSelector}
              className="w-full min-h-[60px] px-6 py-3 rounded-full border-2 border-purple-400 bg-white text-left flex items-center justify-between gap-3 hover:bg-purple-50/40 transition-colors"
            >
              {hasSelection ? <SelectionPills selections={selections} onRemove={onRemoveSelection} /> : <span className="text-lg font-bold text-gray-800">Select target sounds</span>}
              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </button>
          </div>
        )}
      </div>

      <div>
        <StepHeader step={2} title="Refine Your Filters" open={openStep === 2} onClick={() => setOpenStep(openStep === 2 ? 0 : 2)} />
        {openStep === 2 && <RefineFilters filters={filters} onChange={onFiltersChange} />}
      </div>

      <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={onClear} disabled={!hasSelection} className="h-12 px-6 rounded-xl border-gray-200 text-gray-500 font-semibold">
          Clear Filters
        </Button>
        <Button onClick={onCreate} disabled={!hasSelection} className="h-12 px-6 rounded-xl bg-purple-400 hover:bg-purple-500 text-white text-base font-bold disabled:opacity-60">
          Create Word Cards →
        </Button>
      </div>
    </div>
  );
}