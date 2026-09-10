import { jsPDF } from "jspdf";

// Matches a TherapyLog to a goal by explicit link or metric type.
export function sessionsForGoal(goal, sessions = []) {
  return sessions
    .filter(
      (s) =>
        s.goal_id === goal.id ||
        (s.metric_type && (s.metric_type === goal.metric_type || s.metric_type === goal.linked_metric_type))
    )
    .sort((a, b) => (a.completed_date < b.completed_date ? -1 : 1));
}

// Builds the note-ready progress report text from goal + session data.
export function buildReportText({ clientName, goals = [], sessions = [] }) {
  const lines = [];
  lines.push(`PROGRESS REPORT — ${clientName || "Patient"}`);
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push("");

  if (goals.length === 0) {
    lines.push("No active goals on file.");
  } else {
    goals.forEach((g, i) => {
      const vals = sessionsForGoal(g, sessions)
        .filter((s) => s.metric_value != null)
        .map((s) => s.metric_value);
      const first = vals[0];
      const latest = vals[vals.length - 1];

      lines.push(`${i + 1}. ${g.goal_title}`);
      if (g.metric_label) lines.push(`   Metric: ${g.metric_label}`);
      if (g.target_value) lines.push(`   Target: ${g.target_value}`);
      if (vals.length) lines.push(`   Sessions: ${vals.join(" -> ")}`);
      if (first != null && latest != null) {
        const d = latest - first;
        lines.push(`   Change: ${first} -> ${latest} (${d >= 0 ? "+" : ""}${d})`);
      }
      lines.push("");
    });
  }

  const days = new Set(sessions.map((s) => s.completed_date)).size;
  lines.push(`Summary: ${sessions.length} submissions across ${days} practice day${days === 1 ? "" : "s"}.`);
  return lines.join("\n");
}

// Renders the report text to a downloaded PDF.
export function downloadReportPdf({ clientName, goals = [], sessions = [] }) {
  const text = buildReportText({ clientName, goals, sessions });
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const bottom = doc.internal.pageSize.getHeight() - margin;
  let y = margin;

  doc.setFontSize(11);
  doc.setTextColor(40);

  text.split("\n").forEach((line) => {
    doc.splitTextToSize(line || " ", width).forEach((wrapped) => {
      if (y > bottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(wrapped, margin, y);
      y += 15;
    });
  });

  doc.save(`${(clientName || "patient").replace(/[^a-z0-9]+/gi, "_")}_progress_report.pdf`);
}