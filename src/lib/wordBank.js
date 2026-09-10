// Curated static word bank for phoneme-based homework.
// IPA strings mark the target sound with {braces}, e.g. "s{p}un".

export const MAX_SELECTIONS = 8;

export const POSITIONS = [
  { id: "initial", label: "Initial", short: "I", chip: "border-sky-700 text-sky-800 bg-sky-50", fill: "bg-sky-700 border-sky-700 text-white", dot: "bg-sky-700" },
  { id: "medial", label: "Medial", short: "M", chip: "border-green-500 text-green-700 bg-green-50", fill: "bg-green-500 border-green-500 text-white", dot: "bg-green-500" },
  { id: "final", label: "Final", short: "F", chip: "border-orange-500 text-orange-700 bg-orange-50", fill: "bg-orange-500 border-orange-500 text-white", dot: "bg-orange-500" },
];

const P = (id, label, ipa) => ({ id, label, ipa });

export const PHONEME_TABS = [
  {
    id: "consonants",
    label: "Consonants",
    rows: [
      { label: "Voiceless", phonemes: [P("p", "P", "p"), P("t", "T", "t"), P("k", "K", "k"), P("f", "F", "f"), P("th", "TH", "θ"), P("s", "S", "s"), P("sh", "SH", "ʃ"), P("h", "H", "h"), P("ch", "CH", "tʃ")] },
      { label: "Voiced", phonemes: [P("b", "B", "b"), P("d", "D", "d"), P("g", "G", "g"), P("v", "V", "v"), P("dh", "TH", "ð"), P("z", "Z", "z"), P("zh", "ZH", "ʒ"), P("j", "J", "dʒ"), P("m", "M", "m"), P("n", "N", "n"), P("ng", "NG", "ŋ"), P("w", "W", "w"), P("y", "Y", "j"), P("l", "L", "l"), P("r", "R", "r"), P("flap", "Flap T", "ɾ")] },
    ],
  },
  {
    id: "clusters",
    label: "Consonant clusters",
    rows: [
      { label: "S-blends", phonemes: [P("sp", "SP", "sp"), P("st", "ST", "st"), P("sk", "SK", "sk"), P("sl", "SL", "sl"), P("sm", "SM", "sm"), P("sn", "SN", "sn"), P("sw", "SW", "sw")] },
      { label: "L-blends", phonemes: [P("bl", "BL", "bl"), P("pl", "PL", "pl"), P("fl", "FL", "fl"), P("gl", "GL", "gl"), P("kl", "CL", "kl")] },
      { label: "R-blends", phonemes: [P("br", "BR", "br"), P("pr", "PR", "pr"), P("tr", "TR", "tr"), P("dr", "DR", "dr"), P("kr", "CR", "kr"), P("gr", "GR", "gr"), P("fr", "FR", "fr")] },
    ],
  },
  {
    id: "vowels",
    label: "Vowels",
    rows: [
      { label: "Monophthongs", phonemes: [P("ee", "sEE", "i"), P("ih", "sIt", "ɪ"), P("oo", "mOOn", "u"), P("uu", "pUt", "ʊ"), P("ay", "sAY", "eɪ"), P("eh", "bEd", "ɛ"), P("oh", "gO", "oʊ"), P("uh", "sofA", "ə"), P("aw", "pOUr", "ɔ"), P("ae", "cAt", "æ"), P("ah", "sAW", "ɑ")] },
      { label: "Diphthongs", phonemes: [P("ai", "mY", "aɪ"), P("ow", "cOW", "aʊ")] },
      { label: "R-coloured", phonemes: [P("ar", "cAR", "ɑr"), P("er", "hER", "ɜr"), P("air", "hAIR", "ɛr"), P("ear", "hEAR", "ɪr"), P("or", "fOR", "ɔr"), P("ire", "fIRE", "aɪr")] },
    ],
  },
];

export const ALL_PHONEMES = PHONEME_TABS.flatMap((t) => t.rows.flatMap((r) => r.phonemes));

const w = (word, ipa, icon) => ({ word, ipa, icon });

const BANK = {
  p: { initial: [w("pig", "{p}ɪg", "🐷"), w("pen", "{p}ɛn", "✒️"), w("pizza", "{p}itsə", "🍕")], medial: [w("happy", "hæ{p}i", "😄"), w("apple", "æ{p}əl", "🍎"), w("puppy", "pʌ{p}i", "🐶")], final: [w("cup", "kʌ{p}", "☕"), w("map", "mæ{p}", "🗺️"), w("sheep", "ʃi{p}", "🐑")] },
  t: { initial: [w("table", "{t}eɪbəl", "🪑"), w("tiger", "{t}aɪgər", "🐯"), w("toe", "{t}oʊ", "🦶")], medial: [w("guitar", "gɪ{t}ɑr", "🎸"), w("kitten", "kɪ{t}ən", "🐱"), w("potato", "pə{t}eɪtoʊ", "🥔")], final: [w("hat", "hæ{t}", "🎩"), w("boat", "boʊ{t}", "⛵"), w("cat", "kæ{t}", "🐱")] },
  k: { initial: [w("cat", "{k}æt", "🐱"), w("key", "{k}i", "🔑"), w("kite", "{k}aɪt", "🪁")], medial: [w("monkey", "mʌŋ{k}i", "🐵"), w("cookie", "kʊ{k}i", "🍪"), w("rocket", "rɑ{k}ɪt", "🚀")], final: [w("book", "bʊ{k}", "📖"), w("duck", "dʌ{k}", "🦆"), w("sock", "sɑ{k}", "🧦")] },
  f: { initial: [w("fish", "{f}ɪʃ", "🐟"), w("fork", "{f}ɔrk", "🍴"), w("feather", "{f}ɛðər", "🪶")], medial: [w("coffee", "kɔ{f}i", "☕"), w("elephant", "ɛlə{f}ənt", "🐘"), w("dolphin", "dɑl{f}ɪn", "🐬")], final: [w("leaf", "li{f}", "🍃"), w("giraffe", "dʒəræ{f}", "🦒"), w("knife", "naɪ{f}", "🔪")] },
  th: { initial: [w("thumb", "{θ}ʌm", "👍"), w("think", "{θ}ɪŋk", "🤔"), w("three", "{θ}ri", "3️⃣")], medial: [w("toothbrush", "tu{θ}brʌʃ", "🪥"), w("bathtub", "bæ{θ}tʌb", "🛁"), w("birthday", "bɜr{θ}deɪ", "🎂")], final: [w("bath", "bæ{θ}", "🛁"), w("tooth", "tu{θ}", "🦷"), w("moth", "mɔ{θ}", "🦋")] },
  s: { initial: [w("sun", "{s}ʌn", "☀️"), w("sock", "{s}ɑk", "🧦"), w("soap", "{s}oʊp", "🧼")], medial: [w("bicycle", "baɪ{s}ɪkəl", "🚲"), w("pencil", "pɛn{s}əl", "✏️"), w("dinosaur", "daɪnə{s}ɔr", "🦕")], final: [w("bus", "bʌ{s}", "🚌"), w("house", "haʊ{s}", "🏠"), w("glass", "glæ{s}", "🥛")] },
  sh: { initial: [w("shoe", "{ʃ}u", "👟"), w("ship", "{ʃ}ɪp", "🚢"), w("shark", "{ʃ}ɑrk", "🦈")], medial: [w("ocean", "oʊ{ʃ}ən", "🌊"), w("tissue", "tɪ{ʃ}u", "🧻"), w("washing", "wɑ{ʃ}ɪŋ", "🧺")], final: [w("fish", "fɪ{ʃ}", "🐟"), w("brush", "brʌ{ʃ}", "🖌️"), w("dish", "dɪ{ʃ}", "🍽️")] },
  h: { initial: [w("hat", "{h}æt", "🎩"), w("horse", "{h}ɔrs", "🐴"), w("house", "{h}aʊs", "🏠")], medial: [w("beehive", "bi{h}aɪv", "🐝"), w("doghouse", "dɔg{h}aʊs", "🏠"), w("behind", "bɪ{h}aɪnd", "👀")], final: [] },
  ch: { initial: [w("chair", "{tʃ}ɛr", "🪑"), w("cheese", "{tʃ}iz", "🧀"), w("chicken", "{tʃ}ɪkən", "🐔")], medial: [w("kitchen", "kɪ{tʃ}ən", "🍳"), w("teacher", "ti{tʃ}ər", "👩‍🏫"), w("ketchup", "kɛ{tʃ}əp", "🍅")], final: [w("watch", "wɑ{tʃ}", "⌚"), w("peach", "pi{tʃ}", "🍑"), w("beach", "bi{tʃ}", "🏖️")] },
  b: { initial: [w("ball", "{b}ɔl", "⚽"), w("bed", "{b}ɛd", "🛏️"), w("banana", "{b}ənænə", "🍌")], medial: [w("rabbit", "ræ{b}ɪt", "🐰"), w("robot", "roʊ{b}ɑt", "🤖"), w("cabbage", "kæ{b}ɪdʒ", "🥬")], final: [w("web", "wɛ{b}", "🕸️"), w("crab", "kræ{b}", "🦀"), w("tub", "tʌ{b}", "🛁")] },
  d: { initial: [w("dog", "{d}ɔg", "🐶"), w("door", "{d}ɔr", "🚪"), w("duck", "{d}ʌk", "🦆")], medial: [w("ladder", "læ{d}ər", "🪜"), w("spider", "spaɪ{d}ər", "🕷️"), w("panda", "pæn{d}ə", "🐼")], final: [w("bed", "bɛ{d}", "🛏️"), w("bread", "brɛ{d}", "🍞"), w("cloud", "klaʊ{d}", "☁️")] },
  g: { initial: [w("goat", "{g}oʊt", "🐐"), w("gift", "{g}ɪft", "🎁"), w("garden", "{g}ɑrdən", "🌷")], medial: [w("tiger", "taɪ{g}ər", "🐯"), w("wagon", "wæ{g}ən", "🛒"), w("dragon", "dræ{g}ən", "🐉")], final: [w("dog", "dɔ{g}", "🐶"), w("frog", "frɔ{g}", "🐸"), w("bag", "bæ{g}", "👜")] },
  v: { initial: [w("van", "{v}æn", "🚐"), w("violin", "{v}aɪəlɪn", "🎻"), w("vest", "{v}ɛst", "🦺")], medial: [w("seven", "sɛ{v}ən", "7️⃣"), w("oven", "ʌ{v}ən", "🔥"), w("river", "rɪ{v}ər", "🏞️")], final: [w("five", "faɪ{v}", "5️⃣"), w("glove", "glʌ{v}", "🧤"), w("wave", "weɪ{v}", "🌊")] },
  dh: { initial: [w("this", "{ð}ɪs", "👇"), w("that", "{ð}æt", "👉"), w("there", "{ð}ɛr", "📍")], medial: [w("feather", "fɛ{ð}ər", "🪶"), w("mother", "mʌ{ð}ər", "👩"), w("weather", "wɛ{ð}ər", "🌦️")], final: [w("bathe", "beɪ{ð}", "🛁"), w("breathe", "bri{ð}", "😮‍💨"), w("smooth", "smu{ð}", "🪨")] },
  z: { initial: [w("zoo", "{z}u", "🦁"), w("zebra", "{z}ibrə", "🦓"), w("zipper", "{z}ɪpər", "🤐")], medial: [w("lizard", "lɪ{z}ərd", "🦎"), w("puzzle", "pʌ{z}əl", "🧩"), w("scissors", "sɪ{z}ərz", "✂️")], final: [w("bees", "bi{z}", "🐝"), w("nose", "noʊ{z}", "👃"), w("cheese", "tʃi{z}", "🧀")] },
  zh: { initial: [], medial: [w("treasure", "trɛ{ʒ}ər", "💰"), w("measure", "mɛ{ʒ}ər", "📏"), w("television", "tɛləvɪ{ʒ}ən", "📺")], final: [w("beige", "beɪ{ʒ}", "🎨"), w("garage", "gərɑ{ʒ}", "🚗"), w("massage", "məsɑ{ʒ}", "💆")] },
  j: { initial: [w("jam", "{dʒ}æm", "🍓"), w("juice", "{dʒ}us", "🧃"), w("jacket", "{dʒ}ækɪt", "🧥")], medial: [w("pajamas", "pə{dʒ}ɑməz", "🩳"), w("magic", "mæ{dʒ}ɪk", "🪄"), w("engine", "ɛn{dʒ}ɪn", "🚂")], final: [w("cage", "keɪ{dʒ}", "🐦"), w("bridge", "brɪ{dʒ}", "🌉"), w("orange", "ɔrɪn{dʒ}", "🍊")] },
  m: { initial: [w("moon", "{m}un", "🌙"), w("mouse", "{m}aʊs", "🐭"), w("milk", "{m}ɪlk", "🥛")], medial: [w("hammer", "hæ{m}ər", "🔨"), w("camel", "kæ{m}əl", "🐫"), w("tomato", "tə{m}eɪtoʊ", "🍅")], final: [w("drum", "drʌ{m}", "🥁"), w("broom", "bru{m}", "🧹"), w("ice cream", "aɪs kri{m}", "🍦")] },
  n: { initial: [w("nose", "{n}oʊz", "👃"), w("nest", "{n}ɛst", "🪺"), w("nurse", "{n}ɜrs", "👩‍⚕️")], medial: [w("banana", "bə{n}ænə", "🍌"), w("penny", "pɛ{n}i", "🪙"), w("honey", "hʌ{n}i", "🍯")], final: [w("sun", "sʌ{n}", "☀️"), w("moon", "mu{n}", "🌙"), w("train", "treɪ{n}", "🚆")] },
  ng: { initial: [], medial: [w("finger", "fɪ{ŋ}gər", "☝️"), w("singer", "sɪ{ŋ}ər", "🎤"), w("hanger", "hæ{ŋ}ər", "🧥")], final: [w("ring", "rɪ{ŋ}", "💍"), w("king", "kɪ{ŋ}", "👑"), w("swing", "swɪ{ŋ}", "🛝")] },
  w: { initial: [w("water", "{w}ɔtər", "💧"), w("wagon", "{w}ægən", "🛒"), w("window", "{w}ɪndoʊ", "🪟")], medial: [w("sandwich", "sæn{w}ɪtʃ", "🥪"), w("kiwi", "ki{w}i", "🥝"), w("highway", "haɪ{w}eɪ", "🛣️")], final: [] },
  y: { initial: [w("yellow", "{j}ɛloʊ", "💛"), w("yo-yo", "{j}oʊjoʊ", "🪀"), w("yarn", "{j}ɑrn", "🧶")], medial: [w("onion", "ʌn{j}ən", "🧅"), w("canyon", "kæn{j}ən", "🏜️"), w("backyard", "bæk{j}ɑrd", "🏡")], final: [] },
  l: { initial: [w("lion", "{l}aɪən", "🦁"), w("leaf", "{l}if", "🍃"), w("lamp", "{l}æmp", "🛋️")], medial: [w("balloon", "bə{l}un", "🎈"), w("jelly", "dʒɛ{l}i", "🍮"), w("yellow", "jɛ{l}oʊ", "💛")], final: [w("ball", "bɔ{l}", "⚽"), w("bell", "bɛ{l}", "🔔"), w("owl", "aʊ{l}", "🦉")] },
  r: { initial: [w("rabbit", "{r}æbɪt", "🐰"), w("rain", "{r}eɪn", "🌧️"), w("rocket", "{r}ɑkɪt", "🚀")], medial: [w("carrot", "kæ{r}ət", "🥕"), w("parrot", "pæ{r}ət", "🦜"), w("arrow", "æ{r}oʊ", "🏹")], final: [w("car", "kɑ{r}", "🚗"), w("bear", "bɛ{r}", "🐻"), w("door", "dɔ{r}", "🚪")] },
  flap: { initial: [], medial: [w("butter", "bʌ{ɾ}ər", "🧈"), w("water", "wɔ{ɾ}ər", "💧"), w("little", "lɪ{ɾ}əl", "🤏")], final: [] },
  sp: { initial: [w("spoon", "{sp}un", "🥄"), w("spider", "{sp}aɪdər", "🕷️"), w("sponge", "{sp}ʌndʒ", "🧽")], medial: [], final: [w("wasp", "wɑ{sp}", "🐝"), w("crisp", "krɪ{sp}", "🍟"), w("grasp", "græ{sp}", "✊")] },
  st: { initial: [w("star", "{st}ɑr", "⭐"), w("stop", "{st}ɑp", "🛑"), w("stairs", "{st}ɛrz", "🪜")], medial: [], final: [w("nest", "nɛ{st}", "🪺"), w("toast", "toʊ{st}", "🍞"), w("ghost", "goʊ{st}", "👻")] },
  sk: { initial: [w("skate", "{sk}eɪt", "⛸️"), w("sky", "{sk}aɪ", "🌌"), w("skunk", "{sk}ʌŋk", "🦨")], medial: [], final: [w("mask", "mæ{sk}", "🎭"), w("desk", "dɛ{sk}", "🪑"), w("disk", "dɪ{sk}", "💿")] },
  sl: { initial: [w("slide", "{sl}aɪd", "🛝"), w("sleep", "{sl}ip", "😴"), w("slipper", "{sl}ɪpər", "🥿")], medial: [], final: [] },
  sm: { initial: [w("smile", "{sm}aɪl", "😊"), w("smoke", "{sm}oʊk", "💨"), w("small", "{sm}ɔl", "🤏")], medial: [], final: [] },
  sn: { initial: [w("snake", "{sn}eɪk", "🐍"), w("snow", "{sn}oʊ", "❄️"), w("snail", "{sn}eɪl", "🐌")], medial: [], final: [] },
  sw: { initial: [w("swim", "{sw}ɪm", "🏊"), w("swing", "{sw}ɪŋ", "🛝"), w("sweater", "{sw}ɛtər", "🧶")], medial: [], final: [] },
  bl: { initial: [w("blue", "{bl}u", "🔵"), w("block", "{bl}ɑk", "🧱"), w("blanket", "{bl}æŋkɪt", "🛏️")], medial: [], final: [] },
  pl: { initial: [w("plate", "{pl}eɪt", "🍽️"), w("plane", "{pl}eɪn", "✈️"), w("plant", "{pl}ænt", "🪴")], medial: [], final: [] },
  fl: { initial: [w("flower", "{fl}aʊər", "🌸"), w("flag", "{fl}æg", "🚩"), w("fly", "{fl}aɪ", "🪰")], medial: [], final: [] },
  gl: { initial: [w("glass", "{gl}æs", "🥛"), w("glove", "{gl}ʌv", "🧤"), w("glue", "{gl}u", "🧴")], medial: [], final: [] },
  kl: { initial: [w("clock", "{kl}ɑk", "🕐"), w("cloud", "{kl}aʊd", "☁️"), w("clown", "{kl}aʊn", "🤡")], medial: [], final: [] },
  br: { initial: [w("bread", "{br}ɛd", "🍞"), w("brush", "{br}ʌʃ", "🖌️"), w("broccoli", "{br}ɑkəli", "🥦")], medial: [], final: [] },
  pr: { initial: [w("present", "{pr}ɛzənt", "🎁"), w("prince", "{pr}ɪns", "🤴"), w("pretzel", "{pr}ɛtsəl", "🥨")], medial: [], final: [] },
  tr: { initial: [w("train", "{tr}eɪn", "🚆"), w("tree", "{tr}i", "🌳"), w("truck", "{tr}ʌk", "🚚")], medial: [], final: [] },
  dr: { initial: [w("drum", "{dr}ʌm", "🥁"), w("dragon", "{dr}ægən", "🐉"), w("dress", "{dr}ɛs", "👗")], medial: [], final: [] },
  kr: { initial: [w("crab", "{kr}æb", "🦀"), w("crayon", "{kr}eɪɑn", "🖍️"), w("crown", "{kr}aʊn", "👑")], medial: [], final: [] },
  gr: { initial: [w("grapes", "{gr}eɪps", "🍇"), w("green", "{gr}in", "🟢"), w("grass", "{gr}æs", "🌱")], medial: [], final: [] },
  fr: { initial: [w("frog", "{fr}ɔg", "🐸"), w("fries", "{fr}aɪz", "🍟"), w("fruit", "{fr}ut", "🍎")], medial: [], final: [] },
  ee: { initial: [w("eagle", "{i}gəl", "🦅"), w("eat", "{i}t", "🍽️")], medial: [w("sheep", "ʃ{i}p", "🐑"), w("feet", "f{i}t", "🦶"), w("leaf", "l{i}f", "🍃")], final: [w("bee", "b{i}", "🐝"), w("key", "k{i}", "🔑"), w("tree", "tr{i}", "🌳")] },
  ih: { initial: [w("igloo", "{ɪ}glu", "🧊"), w("ink", "{ɪ}ŋk", "🖋️")], medial: [w("pig", "p{ɪ}g", "🐷"), w("fish", "f{ɪ}ʃ", "🐟"), w("ship", "ʃ{ɪ}p", "🚢")], final: [] },
  oo: { initial: [], medial: [w("moon", "m{u}n", "🌙"), w("spoon", "sp{u}n", "🥄"), w("boot", "b{u}t", "🥾")], final: [w("shoe", "ʃ{u}", "👟"), w("zoo", "z{u}", "🦁"), w("blue", "bl{u}", "🔵")] },
  uu: { initial: [], medial: [w("book", "b{ʊ}k", "📖"), w("cookie", "k{ʊ}ki", "🍪"), w("wolf", "w{ʊ}lf", "🐺")], final: [] },
  ay: { initial: [w("ape", "{eɪ}p", "🦍"), w("acorn", "{eɪ}kɔrn", "🌰")], medial: [w("cake", "k{eɪ}k", "🎂"), w("rain", "r{eɪ}n", "🌧️"), w("snake", "sn{eɪ}k", "🐍")], final: [w("play", "pl{eɪ}", "🎮"), w("tray", "tr{eɪ}", "🍱"), w("gray", "gr{eɪ}", "⚪")] },
  eh: { initial: [w("egg", "{ɛ}g", "🥚"), w("elephant", "{ɛ}ləfənt", "🐘")], medial: [w("bed", "b{ɛ}d", "🛏️"), w("nest", "n{ɛ}st", "🪺"), w("ten", "t{ɛ}n", "🔟")], final: [] },
  oh: { initial: [w("oak", "{oʊ}k", "🌳"), w("ocean", "{oʊ}ʃən", "🌊")], medial: [w("boat", "b{oʊ}t", "⛵"), w("goat", "g{oʊ}t", "🐐"), w("nose", "n{oʊ}z", "👃")], final: [w("snow", "sn{oʊ}", "❄️"), w("bow", "b{oʊ}", "🎀"), w("toe", "t{oʊ}", "🦶")] },
  uh: { initial: [w("about", "{ə}baʊt", "💬"), w("again", "{ə}gɛn", "🔁")], medial: [w("camera", "kæm{ə}rə", "📷"), w("pajamas", "p{ə}dʒɑməz", "🩳")], final: [w("sofa", "soʊf{ə}", "🛋️"), w("pizza", "pits{ə}", "🍕"), w("zebra", "zibr{ə}", "🦓")] },
  aw: { initial: [], medial: [w("ball", "b{ɔ}l", "⚽"), w("dog", "d{ɔ}g", "🐶"), w("horse", "h{ɔ}rs", "🐴")], final: [w("saw", "s{ɔ}", "🪚"), w("paw", "p{ɔ}", "🐾"), w("straw", "str{ɔ}", "🥤")] },
  ae: { initial: [w("apple", "{æ}pəl", "🍎"), w("ant", "{æ}nt", "🐜")], medial: [w("cat", "k{æ}t", "🐱"), w("hat", "h{æ}t", "🎩"), w("bat", "b{æ}t", "🦇")], final: [] },
  ah: { initial: [w("octopus", "{ɑ}ktəpʊs", "🐙"), w("olive", "{ɑ}lɪv", "🫒")], medial: [w("sock", "s{ɑ}k", "🧦"), w("clock", "kl{ɑ}k", "🕐"), w("frog", "fr{ɑ}g", "🐸")], final: [] },
  ai: { initial: [w("ice", "{aɪ}s", "🧊"), w("eye", "{aɪ}", "👁️")], medial: [w("kite", "k{aɪ}t", "🪁"), w("bike", "b{aɪ}k", "🚲"), w("light", "l{aɪ}t", "💡")], final: [w("pie", "p{aɪ}", "🥧"), w("fly", "fl{aɪ}", "🪰"), w("sky", "sk{aɪ}", "🌌")] },
  ow: { initial: [w("owl", "{aʊ}l", "🦉"), w("ouch", "{aʊ}tʃ", "🤕")], medial: [w("house", "h{aʊ}s", "🏠"), w("mouse", "m{aʊ}s", "🐭"), w("cloud", "kl{aʊ}d", "☁️")], final: [w("cow", "k{aʊ}", "🐄"), w("plow", "pl{aʊ}", "🚜"), w("bow", "b{aʊ}", "🙇")] },
  ar: { initial: [w("art", "{ɑr}t", "🎨"), w("arm", "{ɑr}m", "💪")], medial: [w("farm", "f{ɑr}m", "🚜"), w("barn", "b{ɑr}n", "🏚️"), w("shark", "ʃ{ɑr}k", "🦈")], final: [w("car", "k{ɑr}", "🚗"), w("star", "st{ɑr}", "⭐"), w("jar", "dʒ{ɑr}", "🫙")] },
  er: { initial: [w("earth", "{ɜr}θ", "🌍"), w("early", "{ɜr}li", "🌅")], medial: [w("bird", "b{ɜr}d", "🐦"), w("turtle", "t{ɜr}təl", "🐢"), w("purple", "p{ɜr}pəl", "🟣")], final: [w("her", "h{ɜr}", "👩"), w("fur", "f{ɜr}", "🐾"), w("stir", "st{ɜr}", "🥄")] },
  air: { initial: [w("air", "{ɛr}", "💨"), w("airplane", "{ɛr}pleɪn", "✈️")], medial: [w("carrot", "k{ɛr}ət", "🥕"), w("cherry", "tʃ{ɛr}i", "🍒"), w("fairy", "f{ɛr}i", "🧚")], final: [w("hair", "h{ɛr}", "💇"), w("bear", "b{ɛr}", "🐻"), w("chair", "tʃ{ɛr}", "🪑")] },
  ear: { initial: [w("ear", "{ɪr}", "👂"), w("earring", "{ɪr}ɪŋ", "💎")], medial: [w("cereal", "s{ɪr}iəl", "🥣"), w("mirror", "m{ɪr}ər", "🪞"), w("hero", "h{ɪr}oʊ", "🦸")], final: [w("deer", "d{ɪr}", "🦌"), w("tear", "t{ɪr}", "😢"), w("year", "j{ɪr}", "📅")] },
  or: { initial: [w("orange", "{ɔr}ɪndʒ", "🍊"), w("orbit", "{ɔr}bɪt", "🪐")], medial: [w("horse", "h{ɔr}s", "🐴"), w("corn", "k{ɔr}n", "🌽"), w("fork", "f{ɔr}k", "🍴")], final: [w("door", "d{ɔr}", "🚪"), w("four", "f{ɔr}", "4️⃣"), w("store", "st{ɔr}", "🏪")] },
  ire: { initial: [], medial: [w("fireman", "f{aɪr}mən", "👨‍🚒"), w("tired", "t{aɪr}d", "😴")], final: [w("fire", "f{aɪr}", "🔥"), w("tire", "t{aɪr}", "🛞"), w("wire", "w{aɪr}", "🔌")] },
};

const VOWEL_RE = /[iɪuʊeɛoəɔæɑaɜ]+/g;
const VOWELS = "iɪuʊeɛoəɔæɑaɜ";
export const countSyllables = (ipa) => (ipa.replace(/[{}]/g, "").match(VOWEL_RE) || []).length || 1;

export const selectionKey = (s) => `${s.phonemeId}-${s.position}`;

export const STRUCTURE_PRESETS = [
  { id: "vowel_initial", label: "Vowel Initial" },
  { id: "singleton_initial", label: "Singleton Initial" },
  { id: "cluster_initial", label: "Cluster Initial" },
  { id: "singleton_final", label: "Singleton Final" },
  { id: "cluster_final", label: "Cluster Final" },
];

/** Converts an IPA string to a C/V pattern, e.g. "spun" -> "CCVC" */
export const cvPattern = (ipa) =>
  ipa
    .replace(/[{}\s-]/g, "")
    .split("")
    .map((ch) => (VOWELS.includes(ch) ? "V" : "C"))
    .join("")
    .replace(/V+/g, "V");

const matchesStructure = (ipa, token) => {
  const p = cvPattern(ipa);
  switch (token) {
    case "vowel_initial":
      return p.startsWith("V");
    case "singleton_initial":
      return /^CV/.test(p);
    case "cluster_initial":
      return /^CC/.test(p);
    case "singleton_final":
      return /VC$/.test(p);
    case "cluster_final":
      return /CC$/.test(p);
    default:
      return p === token.toUpperCase().replace(/[^CV]/g, "");
  }
};

/**
 * selections: [{ phonemeId, position }]
 * filters: { syllables: string[], structures: string[], maxPerSound: number | null }
 */
export function getWordCards(selections, filters = {}) {
  const { syllables = [], structures = [], maxPerSound = null } = filters;
  return selections.flatMap((sel) => {
    const phoneme = ALL_PHONEMES.find((p) => p.id === sel.phonemeId);
    let words = BANK[sel.phonemeId]?.[sel.position] || [];
    if (syllables.length) {
      words = words.filter((wd) => {
        const n = countSyllables(wd.ipa);
        return syllables.some((s) => (s === "5+" ? n >= 5 : n === Number(s)));
      });
    }
    if (structures.length) {
      words = words.filter((wd) => structures.some((t) => matchesStructure(wd.ipa, t)));
    }
    if (maxPerSound) words = words.slice(0, maxPerSound);
    return words.map((wd) => ({
      id: `${sel.phonemeId}-${sel.position}-${wd.word}`,
      ...wd,
      phonemeId: sel.phonemeId,
      phonemeLabel: phoneme?.label,
      phonemeIpa: phoneme?.ipa,
      position: sel.position,
    }));
  });
}