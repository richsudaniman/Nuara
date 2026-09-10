// Curated minimal-pairs dataset. Contrast phoneme is marked with {braces} in each IPA string.
import { ALL_PHONEMES, PHONEME_TABS, countSyllables, matchesStructure } from "@/lib/wordBank";

const VOWEL_IDS = PHONEME_TABS.find((t) => t.id === "vowels").rows.flatMap((r) => r.phonemes.map((p) => p.id));
export const isVowelSound = (id) => VOWEL_IDS.includes(id);
export const soundIpa = (id) => ALL_PHONEMES.find((p) => p.id === id)?.ipa || "";

const pr = (position, word1, ipa1, word2, ipa2) => ({ position, word1, ipa1, word2, ipa2 });

// Keyed as "sound1|sound2" — lookups match either order.
const PAIRS = {
  "p|b": [
    pr("initial", "pig", "{p}ɪg", "big", "{b}ɪg"),
    pr("initial", "pat", "{p}æt", "bat", "{b}æt"),
    pr("initial", "pear", "{p}ɛr", "bear", "{b}ɛr"),
    pr("final", "cup", "kʌ{p}", "cub", "kʌ{b}"),
    pr("final", "mop", "mɑ{p}", "mob", "mɑ{b}"),
  ],
  "t|d": [
    pr("initial", "tie", "{t}aɪ", "die", "{d}aɪ"),
    pr("initial", "ten", "{t}ɛn", "den", "{d}ɛn"),
    pr("final", "hat", "hæ{t}", "had", "hæ{d}"),
    pr("final", "mat", "mæ{t}", "mad", "mæ{d}"),
    pr("medial", "writing", "raɪ{t}ɪŋ", "riding", "raɪ{d}ɪŋ"),
  ],
  "k|g": [
    pr("initial", "coat", "{k}oʊt", "goat", "{g}oʊt"),
    pr("initial", "cave", "{k}eɪv", "gave", "{g}eɪv"),
    pr("final", "back", "bæ{k}", "bag", "bæ{g}"),
    pr("final", "pick", "pɪ{k}", "pig", "pɪ{g}"),
  ],
  "k|t": [
    pr("initial", "key", "{k}i", "tea", "{t}i"),
    pr("initial", "cot", "{k}ɑt", "tot", "{t}ɑt"),
    pr("final", "back", "bæ{k}", "bat", "bæ{t}"),
    pr("final", "rock", "rɑ{k}", "rot", "rɑ{t}"),
  ],
  "s|sh": [
    pr("initial", "sip", "{s}ɪp", "ship", "{ʃ}ɪp"),
    pr("initial", "sea", "{s}i", "she", "{ʃ}i"),
    pr("final", "mass", "mæ{s}", "mash", "mæ{ʃ}"),
    pr("final", "gas", "gæ{s}", "gash", "gæ{ʃ}"),
  ],
  "s|t": [
    pr("initial", "sick", "{s}ɪk", "tick", "{t}ɪk"),
    pr("initial", "sew", "{s}oʊ", "toe", "{t}oʊ"),
    pr("final", "bus", "bʌ{s}", "but", "bʌ{t}"),
    pr("final", "mess", "mɛ{s}", "met", "mɛ{t}"),
  ],
  "f|v": [
    pr("initial", "fan", "{f}æn", "van", "{v}æn"),
    pr("initial", "fine", "{f}aɪn", "vine", "{v}aɪn"),
    pr("final", "leaf", "li{f}", "leave", "li{v}"),
    pr("final", "safe", "seɪ{f}", "save", "seɪ{v}"),
  ],
  "th|f": [
    pr("initial", "thin", "{θ}ɪn", "fin", "{f}ɪn"),
    pr("initial", "three", "{θ}ri", "free", "{f}ri"),
    pr("final", "with", "wɪ{θ}", "wif", "wɪ{f}"),
  ],
  "r|l": [
    pr("initial", "rake", "{r}eɪk", "lake", "{l}eɪk"),
    pr("initial", "road", "{r}oʊd", "load", "{l}oʊd"),
    pr("initial", "rock", "{r}ɑk", "lock", "{l}ɑk"),
    pr("medial", "pirate", "paɪ{r}ət", "pilot", "paɪ{l}ət"),
  ],
  "r|w": [
    pr("initial", "ring", "{r}ɪŋ", "wing", "{w}ɪŋ"),
    pr("initial", "rake", "{r}eɪk", "wake", "{w}eɪk"),
    pr("initial", "red", "{r}ɛd", "wed", "{w}ɛd"),
  ],
  "ch|sh": [
    pr("initial", "chip", "{tʃ}ɪp", "ship", "{ʃ}ɪp"),
    pr("initial", "chair", "{tʃ}ɛr", "share", "{ʃ}ɛr"),
    pr("final", "watch", "wɑ{tʃ}", "wash", "wɑ{ʃ}"),
  ],
  "st|s": [
    pr("initial", "stick", "{st}ɪk", "sick", "{s}ɪk"),
    pr("initial", "stop", "{st}ɑp", "sop", "{s}ɑp"),
    pr("initial", "sting", "{st}ɪŋ", "sing", "{s}ɪŋ"),
    pr("medial", "pestering", "pɛ{st}ərɪŋ", "sistering", "sɪ{s}tərɪŋ"),
  ],
  "sp|p": [
    pr("initial", "spin", "{sp}ɪn", "pin", "{p}ɪn"),
    pr("initial", "spot", "{sp}ɑt", "pot", "{p}ɑt"),
    pr("initial", "spill", "{sp}ɪl", "pill", "{p}ɪl"),
  ],
  "ee|ih": [
    pr("medial", "sheep", "ʃ{i}p", "ship", "ʃ{ɪ}p"),
    pr("medial", "feet", "f{i}t", "fit", "f{ɪ}t"),
    pr("medial", "beat", "b{i}t", "bit", "b{ɪ}t"),
  ],
  "ae|eh": [
    pr("medial", "bat", "b{æ}t", "bet", "b{ɛ}t"),
    pr("medial", "pan", "p{æ}n", "pen", "p{ɛ}n"),
    pr("medial", "sad", "s{æ}d", "said", "s{ɛ}d"),
  ],
  "oo|uu": [
    pr("medial", "pool", "p{u}l", "pull", "p{ʊ}l"),
    pr("medial", "Luke", "l{u}k", "look", "l{ʊ}k"),
    pr("medial", "fool", "f{u}l", "full", "f{ʊ}l"),
  ],
};

export const ERROR_PATTERNS = [
  { id: "fronting", label: "Velar Fronting (k → t)", sound1: "k", sound2: "t" },
  { id: "stopping", label: "Stopping (s → t)", sound1: "s", sound2: "t" },
  { id: "gliding", label: "Gliding (r → w)", sound1: "r", sound2: "w" },
  { id: "cluster_reduction", label: "Cluster Reduction (st → s)", sound1: "st", sound2: "s" },
  { id: "deaffrication", label: "Deaffrication (ch → sh)", sound1: "ch", sound2: "sh" },
  { id: "prevocalic_voicing", label: "Prevocalic Voicing (p → b)", sound1: "p", sound2: "b" },
  { id: "vowel_tensing", label: "Vowel Contrast (ee → ih)", sound1: "ee", sound2: "ih" },
];

export function contrastError(sound1, sound2) {
  if (!sound1 || !sound2) return null;
  if (sound1 === sound2) return "Pick two different sounds — a minimal pair needs a contrast.";
  if (isVowelSound(sound1) !== isVowelSound(sound2))
    return "A vowel and a consonant can't form a minimal pair. Choose two consonants or two vowels.";
  return null;
}

/**
 * filters: { positions: string[], syllables: string[], structures: string[], excluded: string[] }
 * Returns pair cards ordered so word1 always carries sound1.
 */
export function getMinimalPairs(sound1, sound2, filters = {}) {
  const { positions = [], syllables = [], structures = [], excluded = [] } = filters;
  if (contrastError(sound1, sound2)) return [];
  if (excluded.includes(sound1) || excluded.includes(sound2)) return [];

  const forward = PAIRS[`${sound1}|${sound2}`];
  const rows = forward || PAIRS[`${sound2}|${sound1}`] || [];
  const flip = !forward;

  return rows
    .map((p) =>
      flip
        ? { position: p.position, word1: p.word2, ipa1: p.ipa2, word2: p.word1, ipa2: p.ipa1 }
        : { ...p }
    )
    .filter((p) => (positions.length ? positions.includes(p.position) : true))
    .filter((p) => (syllables.length ? syllables.some((s) => (s === "5+" ? countSyllables(p.ipa1) >= 5 : countSyllables(p.ipa1) === Number(s))) : true))
    .filter((p) => (structures.length ? structures.some((t) => matchesStructure(p.ipa1, t)) : true))
    .map((p) => ({ id: `${p.word1}-${p.word2}-${p.position}`, ...p }));
}