import { format, subDays } from "date-fns";

const d = (daysAgo) => format(subDays(new Date(), daysAgo), "yyyy-MM-dd");

const AUDIO = "https://www.w3schools.com/html/horse.mp3";
const VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";
const PHOTO = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80";

export const DEMO_CLIENT = {
  full_name: "Jalal Abdelrahim",
  age: 9,
  email: "family.abdelrahim@example.com",
  diagnosis: "Articulation disorder · /r/ and /s/",
  therapy_focus: "Articulation",
  session_schedule: "2× / week, Tue + Fri",
};

export const DEMO_GOALS = [
  {
    id: "demo-goal-artic",
    homework_type: "articulation",
    goal_title: "Produce /r/ in words at 90% accuracy",
    metric_label: "/r/ — word-level accuracy",
    metric_type: "articulation_accuracy",
    target_value: "90% accuracy",
    target_metric_value: 90,
    baseline_value: 42,
    unit: "%",
    is_active: true,
  },
  {
    id: "demo-goal-pairs",
    homework_type: "minimal_pairs",
    goal_title: "Contrast /k/ vs /t/ in minimal pairs at 85%",
    metric_label: "/k/ vs /t/ — contrast accuracy",
    metric_type: "contrast_accuracy",
    target_value: "85% accuracy",
    target_metric_value: 85,
    baseline_value: 40,
    unit: "%",
    is_active: true,
  },
  {
    id: "demo-goal-fluency",
    homework_type: "fluency",
    goal_title: "Read aloud at 120 wpm using easy onset",
    metric_label: "Easy onset — speech rate",
    metric_type: "fluency_rate",
    target_value: "120 wpm",
    target_metric_value: 120,
    baseline_value: 68,
    unit: "wpm",
    is_active: true,
  },
  {
    id: "demo-goal-reading",
    homework_type: "reading",
    goal_title: "Read grade-level passages at 92% accuracy",
    metric_label: "Passage reading accuracy",
    metric_type: "reading_accuracy",
    target_value: "92% accuracy",
    target_metric_value: 92,
    baseline_value: 55,
    unit: "%",
    is_active: true,
  },
];

export const DEMO_SESSIONS = [
  // Articulation
  { id: "a1", exercise_name: "Sound drill — /r/ words", completed_date: d(0), modality: "audio", goal_id: "demo-goal-artic", metric_type: "articulation_accuracy", metric_value: 84, submission_url: AUDIO, notes: "Great carryover today" },
  { id: "a2", exercise_name: "/r/ word cards", completed_date: d(3), modality: "audio", goal_id: "demo-goal-artic", metric_type: "articulation_accuracy", metric_value: 76, submission_url: AUDIO },
  { id: "a3", exercise_name: "Mirror practice — /r/ shape", completed_date: d(7), modality: "photo", goal_id: "demo-goal-artic", metric_type: "articulation_accuracy", metric_value: 68, submission_url: PHOTO },
  { id: "a4", exercise_name: "Baseline probe — /r/", completed_date: d(21), modality: "audio", goal_id: "demo-goal-artic", metric_type: "articulation_accuracy", metric_value: 42, submission_url: AUDIO },

  // Minimal pairs
  { id: "p1", exercise_name: "Minimal pairs — key / tea", completed_date: d(1), modality: "audio", goal_id: "demo-goal-pairs", metric_type: "contrast_accuracy", metric_value: 78, submission_url: AUDIO },
  { id: "p2", exercise_name: "Minimal pairs — cap / tap", completed_date: d(4), modality: "video", goal_id: "demo-goal-pairs", metric_type: "contrast_accuracy", metric_value: 70, submission_url: VIDEO },
  { id: "p3", exercise_name: "Minimal pairs — coat / tote", completed_date: d(9), modality: "audio", goal_id: "demo-goal-pairs", metric_type: "contrast_accuracy", metric_value: 58, submission_url: AUDIO },
  { id: "p4", exercise_name: "Baseline probe — /k/ vs /t/", completed_date: d(20), modality: "audio", goal_id: "demo-goal-pairs", metric_type: "contrast_accuracy", metric_value: 40, submission_url: AUDIO },

  // Fluency
  { id: "f1", exercise_name: "Easy onset passage read", completed_date: d(0), modality: "video", goal_id: "demo-goal-fluency", metric_type: "fluency_rate", metric_value: 112, submission_url: VIDEO, notes: "Smooth starts on most sentences" },
  { id: "f2", exercise_name: "Easy onset sentences", completed_date: d(5), modality: "audio", goal_id: "demo-goal-fluency", metric_type: "fluency_rate", metric_value: 98, submission_url: AUDIO },
  { id: "f3", exercise_name: "Home routine check-in", completed_date: d(11), modality: "caregiver_note", goal_id: "demo-goal-fluency", metric_type: "fluency_rate", metric_value: 84, notes: "Practised at dinner, needed 2 cues" },
  { id: "f4", exercise_name: "Baseline read — rate probe", completed_date: d(22), modality: "audio", goal_id: "demo-goal-fluency", metric_type: "fluency_rate", metric_value: 68, submission_url: AUDIO },

  // Reading
  { id: "r1", exercise_name: "Passage read — The Lost Kite", completed_date: d(2), modality: "audio", goal_id: "demo-goal-reading", metric_type: "reading_accuracy", metric_value: 88, submission_url: AUDIO },
  { id: "r2", exercise_name: "Passage read — Rainy Day", completed_date: d(6), modality: "video", goal_id: "demo-goal-reading", metric_type: "reading_accuracy", metric_value: 79, submission_url: VIDEO },
  { id: "r3", exercise_name: "Reading log photo", completed_date: d(13), modality: "photo", goal_id: "demo-goal-reading", metric_type: "reading_accuracy", metric_value: 66, submission_url: PHOTO },
  { id: "r4", exercise_name: "Baseline passage probe", completed_date: d(23), modality: "audio", goal_id: "demo-goal-reading", metric_type: "reading_accuracy", metric_value: 55, submission_url: AUDIO },
];