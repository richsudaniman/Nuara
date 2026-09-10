import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download } from "lucide-react";
import { buildReportText, downloadReportPdf } from "@/lib/progressReport";

// Builds a note-ready progress report from goal + session data, copyable or downloadable as PDF.
export default function GoalReportDialog({ open, onOpenChange, clientName, goals = [], sessions = [] }) {
  const [copied, setCopied] = React.useState(false);

  const reportText = useMemo(
    () => buildReportText({ clientName, goals, sessions }),
    [clientName, goals, sessions]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // ignore
    }
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
          <Button
            variant="outline"
            onClick={() => downloadReportPdf({ clientName, goals, sessions })}
            className="gap-2"
          >
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