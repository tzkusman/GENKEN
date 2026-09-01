/* ============================================================
   CASE FILE 1707-A — ALL FORENSIC DATA FOR THE DEMOLITION
   Exhibit: "Meridian No. 1707", brass-cased mechanical clock
   ============================================================ */

export const CASE_META = {
  file: "CASE FILE 1707-A",
  exhibit: "MERIDIAN No. 1707",
  movement: "Hand-wound · 17 jewels · 28,800 vph",
  verdict: "TOTAL LOSS",
  date: "RECOVERED 03:12 AM",
  coordinates: "48.8566° N, 2.3522° E",
};

export interface ClockPart {
  id: string;
  index: string;
  name: string;
  material: string;
  spec: string;
  role: string;
  explodeY: number; // px offset in exploded view
  massG: number;
}

export const PARTS: ClockPart[] = [
  {
    id: "crystal",
    index: "01",
    name: "Crystal",
    material: "Domed sapphire, AR-coated",
    spec: "2.1 mm · 9H scratch rating",
    role: "The transparent shield. First to fail, first to be forgiven.",
    explodeY: -190,
    massG: 4.2,
  },
  {
    id: "hands",
    index: "02",
    name: "Hand Set",
    material: "Blued steel, flame-tempered",
    spec: "Hour 21.4 mm · Minute 30.9 mm · Sweep 33.2 mm",
    role: "The narrators of the mechanism. They lie last.",
    explodeY: -145,
    massG: 1.1,
  },
  {
    id: "dial",
    index: "03",
    name: "Dial",
    material: "Grand feu enamel on copper",
    spec: "Ø 38.5 mm · printed minute track",
    role: "The face. Enamel does not bend — it remembers, then shatters.",
    explodeY: -100,
    massG: 6.8,
  },
  {
    id: "cannon",
    index: "04",
    name: "Cannon Pinion",
    material: "Nickel silver, friction-fit",
    spec: "0.42 N·mm friction torque",
    role: "Carries the minute hand by friction alone. A handshake, not a weld.",
    explodeY: -60,
    massG: 0.3,
  },
  {
    id: "escapement",
    index: "05",
    name: "Escapement",
    material: "Swiss lever, hardened steel pallets",
    spec: "15° lift angle · 52° balance arc",
    role: "The gatekeeper. Releases energy one tooth, one tick at a time.",
    explodeY: -20,
    massG: 1.9,
  },
  {
    id: "balance",
    index: "06",
    name: "Balance & Hairspring",
    material: "Glucydur rim · Nivarox spiral",
    spec: "4 Hz · 274° amplitude · 13 coils",
    role: "The heart. Oscillates 345,600 times a day, asking nothing.",
    explodeY: 25,
    massG: 0.9,
  },
  {
    id: "geartrain",
    index: "07",
    name: "Gear Train",
    material: "Brass wheels, polished steel pinions",
    spec: "4 wheels · ratio 1 : 2,880",
    role: "The transmission. Steps the barrel's shove into measured whispers.",
    explodeY: 70,
    massG: 8.4,
  },
  {
    id: "barrel",
    index: "08",
    name: "Barrel & Mainspring",
    material: "Coiled alloy ribbon, 420 mm long",
    spec: "6.1 N·mm full wind · 41 h reserve",
    role: "The reservoir. Stores the violence that will later be released politely.",
    explodeY: 115,
    massG: 11.6,
  },
  {
    id: "plate",
    index: "09",
    name: "Mainplate & Bridges",
    material: "German silver, Côtes de Genève",
    spec: "17 jewel bearings · 32.8 mm Ø",
    role: "The skeleton. Everything above is a thought; this is the skull.",
    explodeY: 160,
    massG: 22.7,
  },
  {
    id: "case",
    index: "10",
    name: "Case",
    material: "Sand-cast brass, hand-finished",
    spec: "Ø 42 mm · 11.8 mm thick",
    role: "The sarcophagus the clock carries while still alive.",
    explodeY: 205,
    massG: 38.2,
  },
];

export const VITALS: { label: string; value: string; note: string }[] = [
  { label: "Beat rate", value: "28,800 vph", note: "8 beats per second" },
  { label: "Amplitude", value: "274°", note: "dial-up, full wind" },
  { label: "Beat error", value: "0.2 ms", note: "within chronometer spec" },
  { label: "Rate", value: "+4.1 s/d", note: "slightly eager, like its owner" },
  { label: "Jewels", value: "17", note: "synthetic ruby bearings" },
  { label: "Power reserve", value: "41 h", note: "one long weekend" },
  { label: "Mainspring torque", value: "6.1 N·mm", note: "at full wind" },
  { label: "Mass", value: "96.1 g", note: "complete, ticking" },
];

export const TORQUE_CURVE: { turn: number; nm: number }[] = [
  { turn: 0.0, nm: 6.1 },
  { turn: 0.5, nm: 5.9 },
  { turn: 1.0, nm: 5.6 },
  { turn: 1.5, nm: 5.2 },
  { turn: 2.0, nm: 4.8 },
  { turn: 2.5, nm: 4.5 },
  { turn: 3.0, nm: 4.1 },
  { turn: 3.5, nm: 3.6 },
  { turn: 4.0, nm: 3.0 },
];

export const STRESS_LOG: { t: string; channel: string; msg: string; level: "ok" | "warn" | "crit" }[] = [
  { t: "T-00:07", channel: "BARREL", msg: "Crown rotation beyond stop detected. Operator ignored detent click.", level: "warn" },
  { t: "T-00:06", channel: "TORQUE", msg: "Mainspring torque 9.8 N·mm — 161% of design envelope.", level: "warn" },
  { t: "T-00:05", channel: "TORQUE", msg: "Torque 12.4 N·mm — 203%. Barrel arbor deflection measurable.", level: "crit" },
  { t: "T-00:04", channel: "TRAIN", msg: "Fourth-wheel pivot friction +340%. Heat signature rising at jewel 12.", level: "crit" },
  { t: "T-00:03", channel: "ESCAPE", msg: "Pallet-stone impact velocity out of spec. Audible metallic ringing.", level: "crit" },
  { t: "T-00:02", channel: "BALANCE", msg: "Hairspring coil collision — amplitude collapse 274° → 96°.", level: "crit" },
  { t: "T-00:01", channel: "ACOUSTIC", msg: "First audible report. 94 dB at 10 cm. Frequency 3.1 kHz — fracture tone.", level: "crit" },
  { t: "T-00:00", channel: "FATAL", msg: "Crack initiation at pallet-fork root. Propagation velocity ~1,120 m/s.", level: "crit" },
];

export const FRACTURE_PHYSICS: { term: string; value: string; plain: string }[] = [
  { term: "Stress intensity K₁", value: "41 MPa·√m", plain: "The push at the crack tip. Steel gives up near 50." },
  { term: "Crack velocity", value: "1,120 m/s", plain: "About a third the speed of sound in steel. Too fast to flinch." },
  { term: "Fracture toughness", value: "72 MPa·√m", plain: "What the alloy could afford. What it received: more." },
  { term: "Energy released", value: "0.84 J", plain: "A small joule. Enough to end a century of ticking." },
  { term: "Fragment count", value: "47", plain: "Recovered and catalogued. Three remain at large." },
  { term: "Elapsed, start→silence", value: "6.9 ms", plain: "Between first report and total arrest. No witness blinked." },
];

export interface Shard {
  id: string;
  massG: number;
  vector: string;
  velocity: string;
  site: string;
}

export const SHARD_MANIFEST: Shard[] = [
  { id: "S-01", massG: 2.41, vector: "017° / 4.2 m", velocity: "18.6 m/s", site: "North wall, embedded 3 mm" },
  { id: "S-02", massG: 1.02, vector: "043° / 2.8 m", velocity: "22.1 m/s", site: "Floorboard gap, unrecoverable" },
  { id: "S-03", massG: 3.77, vector: "071° / 1.1 m", velocity: "9.4 m/s", site: "Rug, face down, still warm" },
  { id: "S-04", massG: 0.64, vector: "096° / 5.6 m", velocity: "31.0 m/s", site: "Window sill, exited and returned" },
  { id: "S-05", massG: 2.18, vector: "122° / 3.3 m", velocity: "14.8 m/s", site: "Bookshelf, Vol. IV of Proust" },
  { id: "S-06", massG: 1.55, vector: "149° / 2.0 m", velocity: "12.2 m/s", site: "Tea cup, displacing 4 ml" },
  { id: "S-07", massG: 0.31, vector: "171° / 6.9 m", velocity: "38.4 m/s", site: "Door frame, apex of flight" },
  { id: "S-08", massG: 4.02, vector: "198° / 0.8 m", velocity: "6.1 m/s", site: "Beneath the movement itself" },
  { id: "S-09", massG: 1.27, vector: "224° / 2.4 m", velocity: "16.5 m/s", site: "Cat. The cat is fine." },
  { id: "S-10", massG: 0.89, vector: "251° / 4.0 m", velocity: "27.3 m/s", site: "Curtain fold, arrested mid-air" },
  { id: "S-11", massG: 2.66, vector: "287° / 1.7 m", velocity: "11.9 m/s", site: "Operator's slipper, left" },
  { id: "S-12", massG: 1.73, vector: "313° / 3.1 m", velocity: "20.7 m/s", site: "Still spinning when found" },
];

export const TOTAL_MASS_RECOVERED = "22.45 g of an estimated 23.9 g dial mass — 93.9% recovered.";

export interface DebrisItem {
  kind: "gear" | "spring" | "screw" | "shard" | "hand" | "jewel" | "wheel";
  x: number; // % of width
  size: number; // px
  depth: number; // 0 far … 1 near — drives parallax speed
  spin: number; // degrees per progress unit
  flip: number;
  hue: "brass" | "steel" | "ember" | "bone";
  delay: number; // 0..1 stagger of the fall
}

export const DEBRIS: DebrisItem[] = [
  { kind: "gear", x: 8, size: 64, depth: 0.25, spin: 420, flip: 1, hue: "brass", delay: 0.05 },
  { kind: "screw", x: 16, size: 22, depth: 0.6, spin: -720, flip: 0.4, hue: "steel", delay: 0.12 },
  { kind: "shard", x: 23, size: 40, depth: 0.85, spin: 260, flip: 1.3, hue: "bone", delay: 0.02 },
  { kind: "spring", x: 31, size: 46, depth: 0.4, spin: 180, flip: 0.7, hue: "steel", delay: 0.18 },
  { kind: "wheel", x: 38, size: 88, depth: 0.15, spin: -300, flip: 1, hue: "brass", delay: 0.08 },
  { kind: "hand", x: 45, size: 54, depth: 0.7, spin: 540, flip: 0.5, hue: "steel", delay: 0.15 },
  { kind: "jewel", x: 52, size: 16, depth: 0.95, spin: 90, flip: 0.2, hue: "ember", delay: 0.22 },
  { kind: "gear", x: 58, size: 120, depth: 0.1, spin: 240, flip: 1, hue: "brass", delay: 0.0 },
  { kind: "shard", x: 64, size: 30, depth: 0.55, spin: -380, flip: 1.1, hue: "bone", delay: 0.1 },
  { kind: "screw", x: 70, size: 26, depth: 0.8, spin: 660, flip: 0.6, hue: "steel", delay: 0.2 },
  { kind: "wheel", x: 77, size: 58, depth: 0.35, spin: -200, flip: 1, hue: "brass", delay: 0.06 },
  { kind: "spring", x: 84, size: 62, depth: 0.65, spin: -140, flip: 0.9, hue: "steel", delay: 0.16 },
  { kind: "gear", x: 91, size: 44, depth: 0.5, spin: 320, flip: 1.2, hue: "brass", delay: 0.12 },
  { kind: "shard", x: 12, size: 26, depth: 0.9, spin: -500, flip: 0.8, hue: "bone", delay: 0.25 },
  { kind: "jewel", x: 28, size: 13, depth: 0.75, spin: -60, flip: 0.3, hue: "ember", delay: 0.3 },
  { kind: "hand", x: 49, size: 40, depth: 0.3, spin: -420, flip: 1, hue: "steel", delay: 0.24 },
  { kind: "screw", x: 62, size: 18, depth: 0.45, spin: 780, flip: 0.5, hue: "steel", delay: 0.28 },
  { kind: "gear", x: 88, size: 76, depth: 0.2, spin: -260, flip: 1, hue: "brass", delay: 0.26 },
  { kind: "shard", x: 95, size: 34, depth: 0.7, spin: 300, flip: 1.4, hue: "bone", delay: 0.04 },
  { kind: "wheel", x: 4, size: 40, depth: 0.5, spin: 360, flip: 1, hue: "brass", delay: 0.21 },
];

export const FALL_NOTES: string[] = [
  "Every component is now a projectile with a biography.",
  "The gear train descends in order of mass, which is to say: in order of importance it was never given.",
  "Screws fall slowest. They were never in a hurry to begin with.",
  "The hairspring uncoils mid-air — 13 turns becoming one long exhale.",
  "Seventeen ruby jewels, each smaller than a tear, are now the most valuable litter on the floor.",
];

export const ENTROPY_FRAGMENTS: string[] = [
  "The second hand's last tick was never heard; it is still, technically, arriving.",
  "Time in the room now moves at the speed of dust.",
  "Without an escapement, a minute is just 60 uncounted seconds lying around.",
  "The calendar wheel still believes it is Tuesday.",
  "Somewhere in the debris field, two gear teeth are touching that never touched in service.",
  "Entropy is not disorder. It is the clock finally telling the truth about the room.",
];

export const STAGES: { id: string; roman: string; label: string }[] = [
  { id: "overture", roman: "00", label: "OVERTURE" },
  { id: "anatomy", roman: "I", label: "ANATOMY" },
  { id: "stress", roman: "II", label: "LOADING" },
  { id: "chamber", roman: "III–V", label: "FRACTURE" },
  { id: "fall", roman: "VI", label: "THE FALL" },
  { id: "entropy", roman: "VII", label: "ENTROPY" },
  { id: "epilogue", roman: "∞", label: "REWIND" },
];

export const MARQUEE_LINES: string[] = [
  "TEMPUS EDAX RERUM — TIME, DEVOURER OF ALL THINGS",
  "EXHIBIT 1707-A WILL NOT SURVIVE THIS PAGE",
  "THE ESCAPEMENT CANNOT ESCAPE",
  "EVERY TICK IS A SMALL DEATH, REHEARSED 28,800 TIMES AN HOUR",
  "SCROLL VELOCITY IS NOW A WEAPON",
  "THE MAINSPRING REMEMBERS BEING FLAT",
  "17 JEWELS COULD NOT SAVE IT",
];

export const COLOPHON: { k: string; v: string }[] = [
  { k: "EXHIBIT", v: "Meridian No. 1707, mechanical, condemned" },
  { k: "DISPLAY TYPE", v: "Bebas Neue — tall, unhurried, terminal" },
  { k: "TEXT TYPE", v: "Archivo — the voice of the investigation" },
  { k: "DATA TYPE", v: "IBM Plex Mono — the voice of the instruments" },
  { k: "MOTION", v: "Scroll-coupled SVG · lerped parallax · seeded shatter" },
  { k: "MECHANISM", v: "React 18 · Vite · Tailwind v4 · one rAF loop" },
  { k: "FRAGMENTS", v: "47 catalogued · 3 at large · 0 mourned adequately" },
  { k: "TIME ELAPSED", v: "All of it" },
];
