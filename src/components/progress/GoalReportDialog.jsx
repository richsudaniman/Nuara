import React, { useMemo } from "react";
import { jsPDF } from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download } from "lucide-react";

// Builds a note-ready progress report from goal + session data, copyable to clipboard.
export default function GoalReportDialog({ open, onOpenChange, clientName, goals = [], sessions = [] }) {
  const [copied, setCopied] = React.useState(false);

  const reportText = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const lines = [];
    lines.push(`PROGRESS REPORT — ${clientName || "Patient"}`);
    lines.push(`Generated: ${today}`);
    lines.push("");

    if (goals.length === 0) {
      lines.push("No active goals on file.");
    } else {
      goals.forEach((g, i) => {
        const goalSessions = sessions
          .filter((s) => s.metric_value != null && (s.goal_id === g.id || s.metric_type === g.metric_type || s.metric_type === g.linked_metric_type))
          .sort((a, b) => (a.completed_date < b.completed_date ? -1 : 1));
        const vals = goalSessions.map((s) => s.metric_value);
        const latest = vals[vals.length - 1];
        const first = vals[0];
        lines.push(`${i + 1}. ${g.goal_title}`);
        if (g.metric_label) lines.push(`   Metric: ${g.metric_label}`);
        if (g.target_value) lines.push(`   Target: ${g.target_value}`);
        if (vals.length) lines.push(`   Sessions: ${vals.join(" → ")}`);
        if (latest != null && first != null) lines.push(`   Change: ${first} → ${latest} (${latest - first >= 0 ? "+" : ""}${latest - first})`);
        lines.push("");
      });
    }

    const submittedCount = sessions.length;
    const days = new Set(sessions.map((s) => s.completed_date)).size;
    lines.push(`Summary: ${submittedCount} submissions across ${days} practice day${days === 1 ? "" : "s"}.`);
    return lines.join("\n");
  }, [clientName, goals, sessions]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // ignore
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    let y = margin;
    doc.setFontSize(11);
    doc.setTextColor(40);
    reportText.split("\n").forEach((ln) => {
      const wrapped = doc.splitTextToSize(ln || " ", width);
      wrapped.forEach((w) => {
        if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
        doc.text(w, margin, y);
        y += 15;
      });
    });
    doc.save(`${(clientName || "patient").replace(/\s+/g, "_")}_progress_report.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">Progress report</DialogTitle>
        </DialogHeader>
        <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4 font-sans">
{reportText}
        </pre>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> PDF
          </Button>
          <Button onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}