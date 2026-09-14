// Single source of truth for sample/demo data shared by the admin,
// clinician and client portals so every number matches across the app.
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const MOCK_CLINICIANS = [
  { id: "mock-clin-1", full_name: "Dr. Sarah Chen", email: "s.chen@slptec-clinic.com", role: "trainer" },
  { id: "mock-clin-2", full_name: "Dr. Omar Haddad", email: "o.haddad@slptec-clinic.com", role: "trainer" },
  { id: "mock-clin-3", full_name: "Dr. Elena Reyes", email: "e.reyes@slptec-clinic.com", role: "trainer" },
];

// status: active | waitlist | on_hold
export const MOCK_CLIENTS = [
  { id: "mock-cli-1", full_name: "Jalal Abdelrahim", email: "family.abdelrahim@example.com", age: 9, therapy_focus: "Articulation · /r/ /s/", clinical_category: "articulation", status: "active", clinician_id: "mock-clin-1", compliance: 86 },
  { id: "mock-cli-2", full_name: "Mia Chen", email: "chen.family@example.com", age: 7, therapy_focus: "Language · sentence building", clinical_category: "language", status: "active", clinician_id: "mock-clin-1", compliance: 82 },
  { id: "mock-cli-3", full_name: "Noah Patel", email: "patel.home@example.com", age: 8, therapy_focus: "Fluency · easy onset", clinical_category: "fluency", status: "active", clinician_id: "mock-clin-1", compliance: 76 },
  { id: "mock-cli-4", full_name: "Sophia Reyes", email: "reyes.family@example.com", age: 10, therapy_focus: "Articulation · /th/", clinical_category: "articulation", status: "active", clinician_id: "mock-clin-1", compliance: 68 },
  { id: "mock-cli-5", full_name: "Olivia Brooks", email: "brooks.parent@example.com", age: 6, therapy_focus: "Language · vocabulary", clinical_category: "language", status: "active", clinician_id: "mock-clin-1", compliance: 32 },
  { id: "mock-cli-6", full_name: "Liam Garcia", email: "garcia.family@example.com", age: 11, therapy_focus: "Articulation · /l/", clinical_category: "articulation", status: "active", clinician_id: "mock-clin-1", compliance: 0 },
  { id: "mock-cli-7", full_name: "Emma Novak", email: "novak.home@example.com", age: 5, therapy_focus: "Phonology", clinical_category: "articulation", status: "active", clinician_id: "mock-clin-2", compliance: 74 },
  { id: "mock-cli-8", full_name: "Ethan Moore", email: "moore.family@example.com", age: 12, therapy_focus: "Fluency", clinical_category: "fluency", status: "active", clinician_id: "mock-clin-2", compliance: 61 },
  { id: "mock-cli-9", full_name: "Isabella Rossi", email: "rossi.home@example.com", age: 8, therapy_focus: "Voice", clinical_category: "voice", status: "active", clinician_id: "mock-clin-3", compliance: 79 },
  { id: "mock-cli-10", full_name: "Ava Silva", email: "silva.family@example.com", age: 6, therapy_focus: "Language", clinical_category: "language", status: "waitlist", clinician_id: null, compliance: 40 },
  { id: "mock-cli-11", full_name: "Lucas Kim", email: "kim.home@example.com", age: 9, therapy_focus: "Articulation", clinical_category: "articulation", status: "waitlist", clinician_id: null, compliance: 55 },
  { id: "mock-cli-12", full_name: "Zoe Martin", email: "martin.family@example.com", age: 7, therapy_focus: "Voice", clinical_category: "voice", status: "waitlist", clinician_id: null, compliance: 0 },
  { id: "mock-cli-13", full_name: "Henry Osei", email: "osei.home@example.com", age: 8, therapy_focus: "Articulation · /k/", clinical_category: "articulation", status: "on_hold", clinician_id: "mock-clin-2", compliance: 0 },
];

export const MOCK_ACTIVE_CLIENTS = MOCK_CLIENTS.filter((c) => c.status === "active");
export const MOCK_WAITLIST_CLIENTS = MOCK_CLIENTS.filter((c) => c.status === "waitlist");
export const MOCK_ON_HOLD_CLIENTS = MOCK_CLIENTS.filter((c) => c.status === "on_hold");

// The client whose detail / client-portal screens are previewed
export const PRIMARY_CLIENT = {
  ...MOCK_CLIENTS[0],
  diagnosis: "Articulation disorder · /r/ and /s/",
  session_schedule: "2× / week, Tue + Fri",
  clinician_name: MOCK_CLINICIANS[0].full_name,
};

export const PRIMARY_GOALS = [
  {
    id: "demo-goal-1",
    assigned_to_client_id: PRIMARY_CLIENT.id,
    goal_title: "Produce /r/ in words at 90% accuracy",
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
    assigned_to_client_id: PRIMARY_CLIENT.id,
    goal_title: "Produce /s/ blends in sentences",
    metric_label: "/s/ blends — sentence-level accuracy",
    metric_type: "s_blend_accuracy",
    target_value: "85% accuracy",
    current_value: "76%",
    baseline_value: 38,
    target_metric_value: 85,
    unit: "%",
    progress_percentage: 68,
    is_active: true,
  },
];

// [goal_id, metric_type, exercise_name, modality, days ago, metric_value]
const SERIES = [
  ["demo-goal-1", "articulation_accuracy", "Baseline probe — /r/", "audio", 34, 42],
  ["demo-goal-2", "s_blend_accuracy", "Baseline probe — /s/ blends", "audio", 31, 38],
  ["demo-goal-1", "articulation_accuracy", "red, rabbit, run", "audio", 29, 51],
  ["demo-goal-2", "s_blend_accuracy", "/s/ blend sentences", "video", 25, 54],
  ["demo-goal-1", "articulation_accuracy", "carrot, arrow, berry", "audio", 22, 58],
  ["demo-goal-1", "articulation_accuracy", "star, car, four", "audio", 18, 62],
  ["demo-goal-2", "s_blend_accuracy", "Mirror practice photo", "photo", 15, 61],
  ["demo-goal-1", "articulation_accuracy", "rocket, rainbow", "video", 12, 68],
  ["demo-goal-2", "s_blend_accuracy", "Home routine check-in", "caregiver_note", 9, 66],
  ["demo-goal-1", "articulation_accuracy", "story reading — /r/ words", "audio", 6, 73],
  ["demo-goal-2", "s_blend_accuracy", "/s/ blend sentences", "video", 4, 71],
  ["demo-goal-1", "articulation_accuracy", "Sound drill — /r/ words", "audio", 2, 76],
  ["demo-goal-2", "s_blend_accuracy", "Show-and-tell recording", "video", 1, 76],
  ["demo-goal-1", "articulation_accuracy", "Sentence practice — /r/", "audio", 0, 78],
];

export const PRIMARY_LOGS = SERIES.map(([goal_id, metric_type, exercise_name, modality, ago, metric_value], i) => ({
  id: `demo-log-${i}`,
  logged_by_client_id: PRIMARY_CLIENT.id,
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

export const MOCK_TODAY_SESSIONS = [
  { time: "09:00", clientName: "Jalal Abdelrahim", sessionType: "Articulation · /r/ /s/", tag: "In 1h", tagType: "soon" },
  { time: "10:30", clientName: "Mia Chen", sessionType: "Language · sentence building", tag: "Prep needed", tagType: "prep" },
  { time: "13:00", clientName: "Noah Patel", sessionType: "Fluency · easy onset", tag: "Afternoon", tagType: "afternoon" },
  { time: "14:30", clientName: "Sophia Reyes", sessionType: "Reassessment", tag: "Afternoon", tagType: "afternoon" },
];

export const MOCK_WEEKLY_TREND = [
  { label: "W1", value: 64 },
  { label: "W2", value: 70 },
  { label: "W3", value: 73 },
  { label: "W4", value: 75 },
  { label: "Now", value: 78 },
];

export const MOCK_AVG_COMPLIANCE = Math.round(
  MOCK_ACTIVE_CLIENTS.reduce((s, c) => s + c.compliance, 0) / MOCK_ACTIVE_CLIENTS.length
);