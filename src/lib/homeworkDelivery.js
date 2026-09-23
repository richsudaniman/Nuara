export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const HOMEWORK_META = {
  articulation: { label: "Articulation", emoji: "🗣️", tint: "bg-[#F5F3FF]" },
  minimal_pairs: { label: "Minimal pairs", emoji: "⚖️", tint: "bg-[#ECFDF5]" },
  fluency: { label: "Fluency", emoji: "🌊", tint: "bg-[#ECFEFF]" },
  reading: { label: "Reading", emoji: "📖", tint: "bg-[#EFF6FF]" },
  resource: { label: "Library activity", emoji: "🧩", tint: "bg-[#FEF3C7]" },
  practice: { label: "Practice", emoji: "⭐", tint: "bg-[#F5F3FF]" },
};

export const metaFor = (type) => HOMEWORK_META[type] || HOMEWORK_META.practice;

// Demo plans have no id — their logs are stored without a workout_plan_id.
export const completionKey = (planId, name, date) => `${planId || "demo"}|${name}|${date}`;

// Groups TherapyPlan records by day, flattening each plan's exercises with the
// plan context the client portal needs (plan id, homework type, strategy).
export function buildWeek(plans) {
  const week = {};
  [...plans]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((plan, pIdx) => {
      const day = plan.day_of_week;
      if (!day) return;
      const type = plan.homework_type || plan.program_hint || "practice";
      const meta = metaFor(type);
      const entry = {
        id: plan.id || null,
        key: plan.id || `demo-${day}-${pIdx}`,
        day,
        title: plan.workout_type,
        homeworkType: type,
        strategyTarget: plan.strategy_target,
        emoji: plan.emoji || meta.emoji,
        tint: plan.tint || meta.tint,
        exercises: (plan.exercises || []).map((ex, i) => ({
          ...ex,
          planId: plan.id || null,
          homeworkType: type,
          strategyTarget: plan.strategy_target,
          key: `${plan.id || `demo-${day}`}-${i}-${ex.name}`,
        })),
      };
      (week[day] = week[day] || []).push(entry);
    });
  return week;
}

export const splitPair = (str) => (str || "").split(" / ").map((s) => s.trim());