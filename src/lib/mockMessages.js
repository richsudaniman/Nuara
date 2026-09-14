// Sample clinic conversations, used when a clinician has no live message threads yet.

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const MOCK_MESSAGE_CLIENTS = [
  { id: "mock-client-1", full_name: "Maya Thompson", email: "maya.parent@example.com" },
  { id: "mock-client-2", full_name: "Liam Chen", email: "chen.family@example.com" },
  { id: "mock-client-3", full_name: "Sofia Alvarez", email: "alvarez.home@example.com" },
  { id: "mock-client-4", full_name: "Noah Patel", email: "patel.n@example.com" },
];

export const MOCK_MESSAGE_THREADS = {
  "mock-client-1": [
    { id: "m1-1", sender_id: "me", message: "Hi! Maya's /r/ homework for this week is posted — 3 short sets a day.", message_type: "text", is_read: true, created_date: hoursAgo(52) },
    { id: "m1-2", sender_id: "mock-client-1", message: "Got it, thank you! She did two sets last night and sounded much clearer.", message_type: "text", is_read: true, created_date: hoursAgo(49) },
    { id: "m1-3", sender_id: "me", message: "That's great progress. Try holding the sound a little longer on the final-position words.", message_type: "text", is_read: true, created_date: hoursAgo(47) },
    { id: "m1-4", sender_id: "mock-client-1", message: "Will do. Quick question — should we practise before or after school?", message_type: "text", is_read: false, created_date: hoursAgo(4) },
  ],
  "mock-client-2": [
    { id: "m2-1", sender_id: "me", message: "Reminder: Liam's reassessment is Thursday at 4:00pm.", message_type: "notification", is_read: true, created_date: hoursAgo(30) },
    { id: "m2-2", sender_id: "mock-client-2", message: "Thanks for the reminder, we'll be there.", message_type: "text", is_read: true, created_date: hoursAgo(28) },
    { id: "m2-3", sender_id: "mock-client-2", message: "He's been recording his sentences on his own now — really proud of him.", message_type: "text", is_read: false, created_date: hoursAgo(9) },
  ],
  "mock-client-3": [
    { id: "m3-1", sender_id: "mock-client-3", message: "Sofia found the minimal pairs set tricky yesterday. Any tips?", message_type: "text", is_read: true, created_date: hoursAgo(76) },
    { id: "m3-2", sender_id: "me", message: "Totally normal at this stage. Slow the pace down and model each pair once before she repeats it.", message_type: "text", is_read: true, created_date: hoursAgo(74) },
    { id: "m3-3", sender_id: "mock-client-3", message: "That helped a lot — she got 8 of 10 today!", message_type: "text", is_read: true, created_date: hoursAgo(20) },
  ],
  "mock-client-4": [
    { id: "m4-1", sender_id: "me", message: "Welcome aboard! I've assigned Noah's first fluency practice set for this week.", message_type: "text", is_read: true, created_date: hoursAgo(120) },
    { id: "m4-2", sender_id: "mock-client-4", message: "Thank you! We uploaded the first recording this morning.", message_type: "text", is_read: true, created_date: hoursAgo(96) },
  ],
};