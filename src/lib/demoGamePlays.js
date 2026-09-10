// Demo game-play history for the SLP practice games (Learn page).
// Each play: game, date, duration_seconds (time to complete), accuracy (%).
const GAMES = [
  { id: 1, title: "Sound Match Challenge", emoji: "🎯" },
  { id: 6, title: "Tongue Twister Race", emoji: "👅" },
  { id: 7, title: "Speed Naming", emoji: "⚡" },
];

// Deterministic improving-times series over the last ~6 weeks
const RAW = [
  // Sound Match Challenge — steady improvement
  [1, 40, 96, 68], [1, 36, 92, 72], [1, 33, 88, 70], [1, 30, 84, 76],
  [1, 26, 79, 78], [1, 22, 75, 81], [1, 18, 71, 84], [1, 13, 68, 86],
  [1, 9, 66, 88], [1, 4, 63, 90], [1, 1, 61, 91],
  // Tongue Twister Race — plateauing
  [6, 38, 54, 62], [6, 31, 50, 66], [6, 24, 47, 70], [6, 17, 46, 71],
  [6, 11, 46, 72], [6, 5, 45, 72], [6, 2, 45, 73],
  // Speed Naming — slightly slower lately
  [7, 35, 40, 74], [7, 27, 38, 77], [7, 20, 37, 79], [7, 12, 41, 75],
  [7, 6, 43, 72],
];

const dateFromOffset = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

export const DEMO_GAMES = GAMES;

export const demoGamePlays = RAW.map(([gameId, daysAgo, duration_seconds, accuracy], i) => ({
  id: `gp-${i}`,
  game_id: gameId,
  game_title: GAMES.find((g) => g.id === gameId).title,
  emoji: GAMES.find((g) => g.id === gameId).emoji,
  played_date: dateFromOffset(daysAgo),
  duration_seconds,
  accuracy,
})).sort((a, b) => (a.played_date < b.played_date ? -1 : 1));