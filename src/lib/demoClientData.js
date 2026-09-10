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
    id: "demo-goal-1",
    goal_title: "Produce /r/ in words at 90% accuracy",
    metric_label: "/r/ — word-level accuracy",
    metric_type: "articulation_accuracy",
    homework_type: "articulation",
    target_value: "90% accuracy",
    target_metric_value: 90,
    baseline_value: 42,
    unit: "%",
    is_active: true,
  },
  {
    id: "demo-goal-2",
    goal_title: "Read passages using easy onset at 85% accuracy",
    metric_label: "Fluency — easy onset in connected speech",
    metric_type: "fluency_rate",
    homework_type: "fluency",
    target_value: "85% accuracy",
    target_metric_value: 85,
    baseline_value: 38,
    unit: "%",
    is_active: true,
  },
];

export const DEMO_SESSIONS = [
  { id: "d1", exercise_name: "Sound drill — /r/ words", completed_date: d(0), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 84, submission_url: AUDIO, notes: "Great carryover today" },
  { id: "d2", exercise_name: "Easy onset passage read", completed_date: d(0), modality: "video", goal_id: "demo-goal-2", metric_type: "fluency_rate", metric_value: 76, submission_url: VIDEO },
  { id: "d3", exercise_name: "Story retelling", completed_date: d(1), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 79, submission_url: AUDIO },
  { id: "d4", exercise_name: "Mirror practice photo", completed_date: d(2), modality: "photo", goal_id: "demo-goal-2", metric_type: "fluency_rate", metric_value: 71, submission_url: PHOTO },
  { id: "d5", exercise_name: "Sound drill — /r/ words", completed_date: d(3), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 74, submission_url: AUDIO },
  { id: "d6", exercise_name: "Home routine check-in", completed_date: d(4), modality: "caregiver_note", goal_id: "demo-goal-2", metric_type: "fluency_rate", metric_value: 66, notes: "Practised at dinner, needed 2 cues" },
  { id: "d7", exercise_name: "/r/ word list read", completed_date: d(6), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 68, submission_url: AUDIO },
  { id: "d8", exercise_name: "Easy onset passage read", completed_date: d(8), modality: "video", goal_id: "demo-goal-2", metric_type: "fluency_rate", metric_value: 61, submission_url: VIDEO },
  { id: "d9", exercise_name: "Sound drill — /r/ words", completed_date: d(10), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 62, submission_url: AUDIO },
  { id: "d10", exercise_name: "Mirror practice photo", completed_date: d(13), modality: "photo", goal_id: "demo-goal-2", metric_type: "fluency_rate", metric_value: 54, submission_url: PHOTO },
  { id: "d11", exercise_name: "/r/ word list read", completed_date: d(15), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 55, submission_url: AUDIO },
  { id: "d12", exercise_name: "Baseline probe — easy onset", completed_date: d(20), modality: "audio", goal_id: "demo-goal-2", metric_type: "fluency_rate", metric_value: 38, submission_url: AUDIO },
  { id: "d13", exercise_name: "Baseline probe — /r/", completed_date: d(22), modality: "audio", goal_id: "demo-goal-1", metric_type: "articulation_accuracy", metric_value: 42, submission_url: AUDIO },
];