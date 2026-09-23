// Sample practice shown when a patient has no real homework assigned yet.
export const MOCK_PLANS = [
  {
    day_of_week: "Monday", order: 1, workout_type: "Snake Sounds — /s/", homework_type: "articulation", emoji: "🐍", tint: "bg-[#FEF3C7]",
    exercises: [
      { name: "sun", emoji: "🌞", reps: 10, modality: "audio", metric_type: "articulation_accuracy", phoneme: "s", position: "initial", ipa: "sʌn", notes: "Say the word slowly and listen for a long, smooth snake sound." },
      { name: "basket", emoji: "🎒", reps: 10, modality: "audio", metric_type: "articulation_accuracy", phoneme: "s", position: "medial", ipa: "ˈbæskɪt", notes: "Find the hidden /s/ in the middle of the word." },
      { name: "bus", emoji: "🚌", reps: 8, modality: "caregiver_note", phoneme: "s", position: "final", ipa: "bʌs", notes: "Caregiver: note how clear the final /s/ sounded." },
    ],
  },
  {
    day_of_week: "Tuesday", order: 2, workout_type: "Minimal pairs: /s/ vs /θ/", homework_type: "minimal_pairs", strategy_target: "/s/ vs /θ/ · Fronting", emoji: "⚖️",
    exercises: [
      { name: "sink / think", emoji: "🚰", reps: 5, modality: "audio", metric_type: "contrast_accuracy", phoneme: "s vs θ", position: "initial", ipa: "sɪŋk / θɪŋk", notes: "Say both words so they sound different." },
      { name: "sum / thumb", emoji: "👍", reps: 5, modality: "audio", metric_type: "contrast_accuracy", phoneme: "s vs θ", position: "initial", ipa: "sʌm / θʌm", notes: "Tongue behind teeth for /s/, between teeth for /θ/." },
    ],
  },
  {
    day_of_week: "Wednesday", order: 3, workout_type: "Fluency: Easy onset", homework_type: "fluency", strategy_target: "Easy onset · 110 wpm", emoji: "🌊", tint: "bg-[#CFFAFE]",
    exercises: [
      { name: "I like to play at the park.", emoji: "🐢", reps: 3, modality: "audio", metric_type: "fluency_rate", notes: "Take a breath, then start the first word gently." },
      { name: "Apples are my favourite snack.", emoji: "🍎", reps: 3, modality: "audio", metric_type: "fluency_rate", notes: "Keep your voice smooth like a slow river." },
    ],
  },
  {
    day_of_week: "Thursday", order: 4, workout_type: "Roaring /r/ Sounds", homework_type: "articulation", emoji: "🦁", tint: "bg-[#FED7AA]",
    exercises: [
      { name: "rabbit", emoji: "🐰", reps: 12, modality: "audio", phoneme: "r", position: "initial", ipa: "ˈræbɪt", notes: "Pull your tongue back and roar the /r/." },
      { name: "carrot", emoji: "🥕", reps: 8, modality: "photo", phoneme: "r", position: "medial", ipa: "ˈkærət", notes: "Upload a photo of your mouth position while saying it." },
    ],
  },
  {
    day_of_week: "Friday", order: 5, workout_type: "Reading: Story time", homework_type: "reading", strategy_target: "Read aloud clearly", emoji: "📚", tint: "bg-[#EDE9FE]",
    exercises: [
      { name: "The red fox ran into the forest.", emoji: "🦊", reps: 2, modality: "audio", metric_type: "reading_accuracy", notes: "Read each word clearly. It's okay to pause." },
      { name: "It found a shiny stone by the river.", emoji: "💎", reps: 2, modality: "video", notes: "Record a short video reading this sentence." },
    ],
  },
  {
    day_of_week: "Saturday", order: 6, workout_type: "Chat Time", homework_type: "resource", emoji: "💬", tint: "bg-[#FCE7F3]",
    exercises: [
      { name: "Tell me about it!", emoji: "🎤", reps: 1, modality: "audio", notes: "Record 2 minutes talking about your favourite hobby." },
      { name: "Pretend phone call", emoji: "📞", reps: 3, modality: "caregiver_note", notes: "Practice ordering food or asking for directions together." },
    ],
  },
];