// Demo goals + practice submissions for the client "My Progress" page.
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const demoGoals = [
  {
    id: "demo-goal-1",
    goal_title: "/r/ accuracy at word level",
    metric_label: "/r/ — word-level accuracy",
    metric_type: "articulation_accuracy",
    target_value: "90% accuracy",
    current_value: "78%",
    baseline_value: 42,
    target_metric_value: 90,
    unit: "%",
    progress_percentage: 75,
    is_active: true,
  },
  {
    id: "demo-goal-2",
    goal_title: "Smooth speech in sentences",
    metric_label: "Fluency — smooth syllables",
    metric_type: "fluency_rate",
    target_value: "95% smooth",
    current_value: "84%",
    baseline_value: 61,
    target_metric_value: 95,
    unit: "%",
    progress_percentage: 68,
    is_active: true,
  },
];

const SERIES = [
  // [goal_id, metric_type, exercise_name, modality, days ago, metric_value]
  ["demo-goal-1", "articulation_accuracy", "red, rabbit, run", "audio", 34, 44],
  ["demo-goal-1", "articulation_accuracy", "road, rain, ring", "audio", 29, 51],
  ["demo-goal-1", "articulation_accuracy", "carrot, arrow, berry", "audio", 24, 58],
  ["demo-goal-1", "articulation_accuracy", "star, car, four", "audio", 19, 62],
  ["demo-goal-1", "articulation_accuracy", "rocket, rainbow", "video", 14, 69],
  ["demo-goal-1", "articulation_accuracy", "story reading — /r/ words", "audio", 9, 73],
  ["demo-goal-1", "articulation_accuracy", "sentence practice — /r/", "audio", 4, 76],
  ["demo-goal-1", "articulation_accuracy", "sentence practice — /r/", "audio", 1, 78],
  ["demo-goal-2", "fluency_rate", "Easy onset passage", "audio", 31, 63],
  ["demo-goal-2", "fluency_rate", "Bubble breathing + phrases", "audio", 25, 68],
  ["demo-goal-2", "fluency_rate", "Slow, smooth reading", "audio", 18, 72],
  ["demo-goal-2", "fluency_rate", "Conversation turns at home", "caregiver_note", 12, 77],
  ["demo-goal-2", "fluency_rate", "Slow, smooth reading", "audio", 7, 81],
  ["demo-goal-2", "fluency_rate", "Show-and-tell recording", "video", 2, 84],
];

export const demoLogs = SERIES.map(([goal_id, metric_type, exercise_name, modality, ago, metric_value], i) => ({
  id: `demo-log-${i}`,
  goal_id,
  metric_type,
  metric_value,
  exercise_name,
  modality,
  completed_date: daysAgo(ago),
  sets_completed: 1,
  reps_completed: 10,
  session_label: `Session ${i + 1}`,
  submission_url: modality === "caregiver_note" ? undefined : "https://example.com/demo-submission",
  notes: modality === "caregiver_note" ? "Practiced at dinner — much smoother today!" : undefined,
})).sort((a, b) => (a.completed_date < b.completed_date ? 1 : -1));