import { format, subDays } from "date-fns";

const d = (daysAgo) => format(subDays(new Date(), daysAgo), "yyyy-MM-dd");

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
    id: "demo-goal-1",
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
    id: "demo-goal-2",
    goal_title: "Produce /s/ blends in sentences",
    metric_label: "/s/ blends — sentence-level accuracy",
    metric_type: "s_blend_accuracy",
    target_value: "85% accuracy",
    target_metric_value: 85,
    baseline_value: 38,
    unit: "%",
    is_active: true,
  },
];

export const DEMO_SESSIONS = [
  { id: "d1", exercise_name: "Sound drill — /r/ words", completed_date: d(0), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 84, submission_url: "#", notes: "Great carryover today" },
  { id: "d2", exercise_name: "/s/ blend sentences", completed_date: d(0), modality: "video", goal_id: "demo-goal-2", metric_type: "s_blend_accuracy", metric_value: 76 },
  { id: "d3", exercise_name: "Story retelling", completed_date: d(1), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 79, submission_url: "#" },
  { id: "d4", exercise_name: "Mirror practice photo", completed_date: d(2), modality: "photo", goal_id: "demo-goal-2", metric_type: "s_blend_accuracy", metric_value: 71 },
  { id: "d5", exercise_name: "Sound drill — /r/ words", completed_date: d(3), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 74 },
  { id: "d6", exercise_name: "Home routine check-in", completed_date: d(4), modality: "caregiver_note", goal_id: "demo-goal-2", metric_type: "s_blend_accuracy", metric_value: 66, notes: "Practised at dinner, needed 2 cues" },
  { id: "d7", exercise_name: "/r/ word list read", completed_date: d(6), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 68 },
  { id: "d8", exercise_name: "/s/ blend sentences", completed_date: d(8), modality: "video", goal_id: "demo-goal-2", metric_type: "s_blend_accuracy", metric_value: 61 },
  { id: "d9", exercise_name: "Sound drill — /r/ words", completed_date: d(10), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 62 },
  { id: "d10", exercise_name: "Mirror practice photo", completed_date: d(13), modality: "photo", goal_id: "demo-goal-2", metric_type: "s_blend_accuracy", metric_value: 54 },
  { id: "d11", exercise_name: "/r/ word list read", completed_date: d(15), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 55 },
  { id: "d12", exercise_name: "Baseline probe — /s/ blends", completed_date: d(20), modality: "audio", goal_id: "demo-goal-2", metric_type: "s_blend_accuracy", metric_value: 38 },
  { id: "d13", exercise_name: "Baseline probe — /r/", completed_date: d(22), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 42 },
];