import { base44 } from "@/api/base44Client";
import { soundIpa } from "@/lib/minimalPairsBank";

/**
 * AI fallback: generate minimal pairs when the curated bank has no match.
 * Returns cards shaped like getMinimalPairs() output, with ai: true.
 */
export async function generateMinimalPairsWithAI(sound1, sound2, { positions = [], syllables = [], structures = [] } = {}) {
  const ipa1 = soundIpa(sound1);
  const ipa2 = soundIpa(sound2);

  const constraints = [
    positions.length ? `Only these word positions for the contrast sound: ${positions.join(", ")}.` : "Any word position (initial, medial or final).",
    syllables.length ? `Each word must have one of these syllable counts: ${syllables.join(", ")}.` : null,
    structures.length ? `Prefer words matching these consonant-vowel structures: ${structures.join(", ")}.` : null,
  ].filter(Boolean).join(" ");

  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `You are a speech-language pathologist creating minimal pair homework for a child.
Generate 6 to 8 real English minimal pairs contrasting /${ipa1}/ and /${ipa2}/.
Each pair must be two real, common English words that differ ONLY by that single contrasting sound, in the same word position.
${constraints}
For each pair: word1 contains /${ipa1}/, word2 contains /${ipa2}/.
Give a broad IPA transcription of each word WITHOUT slashes, and wrap ONLY the contrasting phoneme in curly braces, e.g. "{p}ɪg" or "bæ{k}".
Use child-friendly vocabulary. Never invent non-words.`,
    response_json_schema: {
      type: "object",
      properties: {
        pairs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              position: { type: "string", enum: ["initial", "medial", "final"] },
              word1: { type: "string" },
              ipa1: { type: "string" },
              word2: { type: "string" },
              ipa2: { type: "string" },
            },
            required: ["position", "word1", "ipa1", "word2", "ipa2"],
          },
        },
      },
      required: ["pairs"],
    },
  });

  return (result?.pairs || []).map((p) => ({
    id: `ai-${p.word1}-${p.word2}-${p.position}`,
    position: p.position,
    word1: p.word1,
    ipa1: p.ipa1,
    word2: p.word2,
    ipa2: p.ipa2,
    ai: true,
  }));
}