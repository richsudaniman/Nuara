import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Mail, Bell, CheckCircle2 } from "lucide-react";

const SEQUENCES = [
  {
    id: "gentle",
    name: "Gentle check-in",
    description: "1 friendly message today",
    audience: "Best for clients 2–4 days inactive",
    steps: [
      { day: "Today", channel: "in-app", text: "Hi! Just checking in — how's practice going this week?" },
    ],
  },
  {
    id: "reengage",
    name: "Re-engagement (3-step)",
    description: "Messages over 5 days",
    audience: "Best for low compliance (under 50%)",
    steps: [
      { day: "Day 1", channel: "in-app", text: "Quick reminder — your homework is waiting! Even 5 minutes helps." },
      { day: "Day 3", channel: "email", text: "Email: tips video + parent guide on building practice routines." },
      { day: "Day 5", channel: "in-app", text: "Encouragement note + offer to adjust the plan." },
    ],
  },
  {
    id: "parent",
    name: "Parent loop-in",
    description: "Notify parent + client",
    audience: "Best for inactive 7+ days",
    steps: [
      { day: "Today", channel: "email", text: "Parent email: status update + simple at-home practice ideas." },
      { day: "Day 2", channel: "in-app", text: "Client message: 'Let's restart together — short and easy plan.'" },
      { day: "Day 4", channel: "in-app", text: "Check-in + offer to schedule a quick call." },
    ],
  },
];

const CHANNEL_ICONS = {
  "in-app": MessageCircle,
  email: Mail,
  push: Bell,
};

export default function NudgeDialog({ open, onOpenChange, clientName }) {
  const [selectedId, setSelectedId] = useState("reengage");
  const [sent, setSent] = useState(false);

  const selected = SEQUENCES.find((s) => s.id === selectedId);

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onOpenChange(false);
      setSent(false);
    }, 1600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {sent ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Nudge sequence scheduled</h3>
            <p className="text-sm text-gray-500 mt-1">
              {selected.name} for {clientName}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg">Send nudge sequence</DialogTitle>
              <DialogDescription>
                Automated outreach for <span className="font-semibold text-gray-700">{clientName}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 mt-2">
              {SEQUENCES.map((seq) => {
                const isActive = selectedId === seq.id;
                return (
                  <button
                    key={seq.id}
                    onClick={() => setSelectedId(seq.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isActive ? "border-purple-400 bg-purple-50/50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{seq.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{seq.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${
                        isActive ? "border-purple-600 bg-purple-600" : "border-gray-300"
                      }`}>
                        {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-0.5" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{seq.audience}</p>
                  </button>
                );
              })}
            </div>

            {/* Preview of selected sequence */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="space-y-2">
                {selected.steps.map((step, idx) => {
                  const Icon = CHANNEL_ICONS[step.channel] || MessageCircle;
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-600">{step.day}</p>
                        <p className="text-xs text-gray-500">{step.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <Send className="w-4 h-4" />
                Send sequence
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}