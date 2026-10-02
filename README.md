# Nuara

Home-practice platform for speech-language pathology (SLP) clinics. White-labelled, so each clinic sets it up with its own name and settings.

[Demo video](https://youtu.be/J8V_Hfshahs)

Most speech therapy progress happens at home between sessions, and clinicians basically have no visibility into it. Nuara lets clinicians assign structured homework, lets patients/caregivers submit their practice, and gives the clinic some data on how treatment is going outside the room.

## what's in it

There are three portals:

**Clinicians**
- caseload dashboard - compliance, adherence, alerts for patients who aren't practicing, today's sessions, quick nudges
- homework builder - pick the homework type, target/contrast sounds, word position and reps, build reading passages, attach library resources, publish to specific days
- patient detail page with practice habits, trends, goal progress and practice-game analytics
- review submitted photos, videos and caregiver notes
- progress reports per goal (baseline -> latest, change, sessions), downloadable as PDF
- resource library + messaging

**Patients / caregivers**
- weekly homework grouped by day, with instructions and target sounds
- submit practice as photo, video, caregiver note, or audio (audio is still a prototype)
- see goal status and session history

**Admins**
- practice settings (the white-label stuff: name, contact info, timezone, session length/frequency, compliance target, alert + parent email preferences, which clinical categories they offer)
- users and clinician assignments
- analytics, announcements, content
- a developer export that dumps the whole database as a PostgreSQL `.sql` file

## how it's built

React 18 + Vite on the frontend, TanStack Query for data, Tailwind/shadcn for UI, Recharts for charts and jsPDF for the reports. Auth, database, hosting and serverless functions are on Base44.

- data is split into care team (`User`, `PractitionerPatientAssignment`), homework (`TherapyPlan`, `TherapyLog`, `TherapyActivity`), outcomes (`TherapyGoal`, `ProgressMetric`, `ClinicalNote`) and `PracticeSettings`
- 8 Deno serverless functions handle anything privileged: adding clients, inviting users, announcements, admin dashboard metrics, progress reports, syncing clinician assignments, and the Postgres export

A few decisions I'd point out:

- **homework is structured data, not free text.** each item has a type (articulation, minimal pairs, fluency, reading, library activity), target sounds, word positions and a rep count. that's what makes it possible to chart progress against goals at all
- **curated word bank first, AI only as a fallback.** minimal pairs come from a hand-curated bank. if a search finds nothing, `InvokeLLM` generates new ones with a strict prompt (real, kid-friendly words, differ by exactly one sound, IPA with the contrast marked) and a JSON schema. AI-made cards are flagged `ai: true` so clinicians can tell
- **demo-friendly empty states.** a brand new clinic has no data, so every portal falls back to the same shared sample clinic. makes demos consistent across patient/clinician/admin views
- **Postgres export** mostly so the app isn't stuck on Base44 forever

## things that were annoying

**Reusing a codebase across domains.** Nuara started as a fitness coaching app, went through a chiropractic version, and then became SLP. I renamed everything in the UI (trainer -> clinician, workouts -> homework), but the data layer still has legacy fields like `trainer_id` and `workout_type` plus some old entities. Instead of migrating live schemas I mapped the old fields to SLP concepts in an adapter (`homeworkDelivery.js`). Not pretty but it works.

**Demo data colliding with real data.** Demo plans don't have a database ID, so completion tracking couldn't tell sample tasks from real ones. Fixed by putting demo completion keys in a `demo` namespace and merging all the demo data into one shared clinic roster.

**IDs in the Postgres export.** Base44 uses 24-char hex IDs and a normal Postgres schema wants UUIDs. The export converts them deterministically so foreign keys still match across tables. It also maps entity names to snake_case tables, stores nested arrays as `JSONB`, and escapes values.

**LLM making up words.** Generated minimal pairs sometimes had fake words or pairs that differed by more than one sound. Tightened the prompt, added a strict schema with a fixed set of allowed word positions, and asked for IPA with the contrast phoneme marked so the UI can highlight it.

## running it

Needs Node 18+ and a Base44 account/app for auth, database and functions.

```bash
git clone https://github.com/richsudaniman/Nuara.git
cd Nuara
npm install
npm run dev
```

Also `npm run build`, `npm run preview`, `npm run lint`, `npm run typecheck`.

Code layout: `base44/` has the entities and functions, `src/components/homework` is the homework builder, `src/components/slp` is the clinician dashboard, `src/lib` has the minimal pairs bank, AI fallback, report builder and demo data.
