import { useEffect, useRef } from "react";
import { useFrame, mulberry32, window01, easeOutCubic, clamp01 } from "../lib/scroll";
import { Gear } from "./parts";

/* ============================================================
   THE CLOCK — MERIDIAN No. 1707
   One SVG, entirely scroll-autopsied.
   - hands run on REAL local time, then wind into panic
   - cracks draw themselves as fracture progresses
   - the enamel dial is 14 seeded shards that scatter on shatter
   ============================================================ */

export interface ClockProgress {
  stress: number; // 0..1 winding past tolerance
  fracture: number; // 0..1 cracks drawing
  shatter: number; // 0..1 explosion
}

const C = 320; // svg center
const R_DIAL = 252;
const R_TICK_OUT = 244;
const R_NUM = 197;

/* ---------- seeded shard wedges ---------- */
interface Wedge {
  d: string;
  midA: number;
  dist: number;
  rot: number;
  z: number;
  lag: number;
}

function buildWedges(seed: number, n: number): Wedge[] {
  const rnd = mulberry32(seed);
  const widths: number[] = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const w = 0.7 + rnd() * 0.6;
    widths.push(w);
    total += w;
  }
  let a = -Math.PI / 2;
  const wedges: Wedge[] = [];
  for (let i = 0; i < n; i++) {
    const sweep = (widths[i] / total) * Math.PI * 2;
    const a0 = a;
    const a1 = a + sweep;
    const midA = (a0 + a1) / 2;
    const large = sweep > Math.PI ? 1 : 0;
    const p0x = C + Math.cos(a0) * R_DIAL;
    const p0y = C + Math.sin(a0) * R_DIAL;
    const p1x = C + Math.cos(a1) * R_DIAL;
    const p1y = C + Math.sin(a1) * R_DIAL;
    wedges.push({
      d: `M${C} ${C} L${p0x.toFixed(1)} ${p0y.toFixed(1)} A${R_DIAL} ${R_DIAL} 0 ${large} 1 ${p1x.toFixed(1)} ${p1y.toFixed(1)} Z`,
      midA,
      dist: 70 + rnd() * 190,
      rot: (rnd() - 0.5) * 300,
      z: 0.45 + rnd() * 0.9,
      lag: rnd() * 0.22,
    });
    a = a1;
  }
  return wedges;
}

const WEDGES = buildWedges(1707, 14);

/* ---------- crack polylines, from the pallet fork outward ---------- */
const CRACKS: { d: string; start: number; w: number }[] = [
  { d: "M320 320 L347 288 L341 262 L373 231 L368 203 L405 178 L401 149 L428 128", start: 0.0, w: 2.4 },
  { d: "M320 320 L361 336 L389 328 L416 349 L451 342 L472 366 L506 361 L533 382", start: 0.06, w: 2.2 },
  { d: "M320 320 L300 361 L309 389 L288 419 L297 449 L272 477 L281 508", start: 0.12, w: 2.3 },
  { d: "M320 320 L279 300 L254 306 L229 285 L201 291 L182 266 L151 272", start: 0.18, w: 2.1 },
  { d: "M320 320 L326 273 L311 247 L322 217 L306 190 L318 162 L305 133 L317 104", start: 0.24, w: 2.0 },
  { d: "M320 320 L350 369 L345 402 L370 431 L364 465 L391 492 L386 523", start: 0.3, w: 2.2 },
  { d: "M320 320 L282 338 L255 331 L229 352 L196 349 L175 372 L143 371", start: 0.36, w: 1.9 },
  { d: "M320 320 L337 292 L368 282 L389 251 L423 241 L444 210", start: 0.42, w: 1.7 },
  { d: "M320 320 L296 277 L301 243 L277 215 L282 181 L259 152", start: 0.48, w: 1.7 },
  { d: "M320 320 L304 342 L311 362 L298 383", start: 0.55, w: 1.4 },
  { d: "M320 320 L342 305 L356 312 L372 301", start: 0.6, w: 1.3 },
  { d: "M320 320 L330 352 L347 360", start: 0.66, w: 1.2 },
];

const NUMERALS = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

interface Props {
  get: () => ClockProgress;
  className?: string;
}

export default function ClockFace({ get, className }: Props) {
  const shardEls = useRef<(SVGPathElement | null)[]>([]);
  const printRef = useRef<SVGGElement>(null);
  const handsHour = useRef<SVGGElement>(null);
  const handsMin = useRef<SVGGElement>(null);
  const handsSec = useRef<SVGGElement>(null);
  const handsAll = useRef<SVGGElement>(null);
  const subHand = useRef<SVGLineElement>(null);
  const crackEls = useRef<(SVGPathElement | null)[]>([]);
  const crackGlowEls = useRef<(SVGPathElement | null)[]>([]);
  const behindRef = useRef<SVGGElement>(null);
  const gearA = useRef<SVGGElement>(null);
  const gearB = useRef<SVGGElement>(null);
  const gearC = useRef<SVGGElement>(null);
  const flashRef = useRef<SVGCircleElement>(null);
  const bezelRef = useRef<SVGGElement>(null);
  const crownRef = useRef<SVGGElement>(null);
  const wholeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    shardEls.current = shardEls.current.slice(0, WEDGES.length);
    crackEls.current = crackEls.current.slice(0, CRACKS.length);
  }, []);

  useFrame(() => {
    const { stress, fracture, shatter } = get();
    const now = new Date();
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    const t = performance.now() / 1000;

    const shE = easeOutCubic(shatter);
    const stressSq = stress * stress;

    /* hands: real time + panic wind + fracture tremor */
    const tremor = fracture > 0 ? (Math.sin(t * 61) + Math.sin(t * 83.7)) * 0.5 * fracture * 7 : 0;
    const panic = stressSq * 620 + fracture * 260;
    const secDeg = s * 6 + panic * 1.6 + tremor;
    const minDeg = m * 6 + panic + tremor * 0.6;
    const hourDeg = h * 30 + panic * 0.7 + tremor * 0.35;

    /* hands fly off during shatter */
    const fly = shE;
    const setHand = (
      el: SVGGElement | null,
      deg: number,
      fx: number,
      fy: number,
      frot: number,
    ) => {
      if (!el) return;
      const dx = fx * fly;
      const dy = fy * fly - fly * 30;
      el.setAttribute(
        "transform",
        `translate(${C + dx} ${C + dy}) rotate(${deg + frot * fly})`,
      );
      el.setAttribute("opacity", String(1 - window01(shatter, 0.55, 0.95) * 0.92));
    };
    setHand(handsHour.current, hourDeg, -150, 120, -260);
    setHand(handsMin.current, minDeg, 170, -140, 300);
    setHand(handsSec.current, secDeg, -60, -230, 520);
    if (handsAll.current) {
      handsAll.current.setAttribute("opacity", String(1 - window01(shatter, 0.6, 1) * 0.6));
    }
    if (subHand.current) {
      subHand.current.setAttribute("transform", `rotate(${s * 6 * 2} 320 428)`);
    }

    /* shards scatter */
    for (let i = 0; i < WEDGES.length; i++) {
      const el = shardEls.current[i];
      const w = WEDGES[i];
      if (!el) continue;
      const local = clamp01(window01(shatter, w.lag, w.lag + 0.72));
      const e = easeOutCubic(local);
      const gx = Math.cos(w.midA) * w.dist * e;
      const gy = Math.sin(w.midA) * w.dist * e + e * e * 90 * w.z; // gravity
      const rot = w.rot * e;
      el.setAttribute("transform", `translate(${gx.toFixed(2)} ${gy.toFixed(2)}) rotate(${rot.toFixed(2)} ${C} ${C})`);
      el.setAttribute("opacity", String(1 - window01(shatter, 0.72, 1) * (0.55 + w.z * 0.3)));
    }

    /* dial print fades as enamel leaves */
    if (printRef.current) {
      const po = 1 - window01(shatter, 0.02, 0.34);
      printRef.current.setAttribute("opacity", String(po));
      const jx = tremor * 0.25;
      printRef.current.setAttribute("transform", `translate(${jx} 0)`);
    }

    /* cracks draw */
    for (let i = 0; i < CRACKS.length; i++) {
      const el = crackEls.current[i];
      const glow = crackGlowEls.current[i];
      const c = CRACKS[i];
      if (!el) continue;
      const local = window01(fracture, c.start, c.start + 0.45);
      const off = 1 - easeOutCubic(local);
      el.setAttribute("stroke-dashoffset", off.toFixed(3));
      if (glow) {
        glow.setAttribute("stroke-dashoffset", off.toFixed(3));
        glow.setAttribute("opacity", String(0.5 * local * (1 - shatter)));
      }
    }

    /* movement revealed behind the dial */
    if (behindRef.current) {
      behindRef.current.setAttribute("opacity", String(window01(shatter, 0.1, 0.45) * 0.95));
    }
    const gearSpin = shE * -160;
    gearA.current?.setAttribute("transform", `translate(243 252) rotate(${t * 6 + gearSpin})`);
    gearB.current?.setAttribute("transform", `translate(408 296) rotate(${-t * 8 + gearSpin * 1.3})`);
    gearC.current?.setAttribute("transform", `translate(296 425) rotate(${t * 11 + gearSpin * 0.7})`);

    /* impact flash */
    if (flashRef.current) {
      const fp = window01(shatter, 0, 0.16);
      const bell = Math.sin(Math.PI * fp);
      flashRef.current.setAttribute("opacity", (bell * 0.85).toFixed(3));
      flashRef.current.setAttribute("r", String(120 + fp * 260));
    }

    /* bezel loosens, crown winds itself frantic */
    if (bezelRef.current) {
      bezelRef.current.setAttribute("transform", `rotate(${stress * 2.4 + shE * -4} ${C} ${C})`);
    }
    if (crownRef.current) {
      crownRef.current.setAttribute("transform", `rotate(${stress * 940 + fracture * 180} 320 24)`);
    }

    /* whole-face stress tremor */
    if (wholeRef.current) {
      const amp = stressSq * 1.1 + fracture * 2.2;
      const tx = (Math.sin(t * 47) + Math.sin(t * 71.3)) * 0.5 * amp;
      const ty = (Math.cos(t * 59.7) + Math.sin(t * 39.1)) * 0.5 * amp;
      wholeRef.current.setAttribute("transform", `translate(${tx.toFixed(2)} ${ty.toFixed(2)})`);
    }
  });

  return (
    <svg
      viewBox="0 0 640 640"
      className={className}
      role="img"
      aria-label="Meridian No. 1707 — a mechanical clock, live, about to be destroyed"
    >
      <g ref={wholeRef}>
      <defs>
        <radialGradient id="dialGrad" cx="42%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#f2e9d2" />
          <stop offset="62%" stopColor="#e7dcc0" />
          <stop offset="100%" stopColor="#cfc09c" />
        </radialGradient>
        <linearGradient id="brassGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eccf7d" />
          <stop offset="45%" stopColor="#c9a24b" />
          <stop offset="75%" stopColor="#84642a" />
          <stop offset="100%" stopColor="#c9a24b" />
        </linearGradient>
        <radialGradient id="flashGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f4eeda" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#eccf7d" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#d95f2b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d95f2b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="innerShadow" cx="50%" cy="50%" r="50%">
          <stop offset="86%" stopColor="#12100c" stopOpacity="0" />
          <stop offset="100%" stopColor="#12100c" stopOpacity="0.45" />
        </radialGradient>
      </defs>

      {/* drop shadow under the clock */}
      <ellipse cx={C} cy={602} rx={218} ry={20} fill="#12100c" opacity={0.55} />

      {/* ---------- movement revealed on shatter ---------- */}
      <g ref={behindRef} opacity={0}>
        <circle cx={C} cy={C} r={R_DIAL} fill="#2a2417" />
        <rect x={180} y={286} width={280} height={26} rx={13} fill="#3a3120" transform="rotate(-18 320 300)" />
        <rect x={200} y={372} width={240} height={22} rx={11} fill="#3a3120" transform="rotate(14 320 380)" />
        <g ref={gearA}>
          <Gear r={86} teeth={18} spokes={4} />
        </g>
        <g ref={gearB}>
          <Gear r={64} teeth={13} hue="steel" spokes={4} />
        </g>
        <g ref={gearC}>
          <Gear r={48} teeth={11} />
        </g>
        <circle cx={C} cy={C} r={13} fill="#d95f2b" opacity={0.85} />
        <circle cx={C} cy={C} r={R_DIAL} fill="url(#innerShadow)" />
      </g>

      {/* ---------- enamel dial as 14 shards ---------- */}
      <g>
        {WEDGES.map((w, i) => (
          <path
            key={i}
            ref={(el) => {
              shardEls.current[i] = el;
            }}
            d={w.d}
            fill="url(#dialGrad)"
            stroke="#c4b48d"
            strokeWidth={0.6}
          />
        ))}
        <circle cx={C} cy={C} r={R_DIAL} fill="url(#innerShadow)" pointerEvents="none" />
      </g>

      {/* ---------- dial print: track, numerals, brand, sub-dial ---------- */}
      <g ref={printRef}>
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const major = i % 5 === 0;
          const r1 = major ? 230 : 237;
          return (
            <line
              key={i}
              x1={C + Math.cos(a) * r1}
              y1={C + Math.sin(a) * r1}
              x2={C + Math.cos(a) * R_TICK_OUT}
              y2={C + Math.sin(a) * R_TICK_OUT}
              stroke="#2b2418"
              strokeWidth={major ? 2.6 : 1}
              opacity={major ? 0.9 : 0.65}
            />
          );
        })}
        {NUMERALS.map((n, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          return (
            <text
              key={n}
              x={C + Math.cos(a) * R_NUM}
              y={C + Math.sin(a) * R_NUM + 15}
              textAnchor="middle"
              fill="#2b2418"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: i === 0 ? 46 : 40, letterSpacing: 2 }}
            >
              {n}
            </text>
          );
        })}
        <text x={C} y={238} textAnchor="middle" fill="#5b4c2c" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 8 }}>
          MERIDIAN
        </text>
        <text x={C} y={262} textAnchor="middle" fill="#7a6a45" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 3 }}>
          No. 1707 · HUIT JOURS
        </text>
        {/* small-seconds sub-dial */}
        <circle cx={C} cy={428} r={46} fill="none" stroke="#2b2418" strokeWidth={1.2} opacity={0.75} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={C + Math.cos(a) * 39}
              y1={428 + Math.sin(a) * 39}
              x2={C + Math.cos(a) * 44}
              y2={428 + Math.sin(a) * 44}
              stroke="#2b2418"
              strokeWidth={1}
              opacity={0.7}
            />
          );
        })}
        <line ref={subHand} x1={C} y1={428} x2={C} y2={392} stroke="#a33c1e" strokeWidth={1.6} />
        <circle cx={C} cy={428} r={3} fill="#2b2418" />
        <text x={C} y={506} textAnchor="middle" fill="#8a7a52" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: 4 }}>
          17 SEVENTEEN JEWELS
        </text>
      </g>

      {/* ---------- cracks ---------- */}
      <g pointerEvents="none">
        {CRACKS.map((c, i) => (
          <g key={i}>
            <path
              ref={(el) => {
                crackGlowEls.current[i] = el;
              }}
              d={c.d}
              fill="none"
              stroke="#a33c1e"
              strokeWidth={c.w + 2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
              opacity={0}
              transform="translate(1.2 1.2)"
            />
            <path
              ref={(el) => {
                crackEls.current[i] = el;
              }}
              d={c.d}
              fill="none"
              stroke="#17130c"
              strokeWidth={c.w}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </g>
        ))}
      </g>

      {/* ---------- hands ---------- */}
      <g ref={handsAll}>
        <g ref={handsHour}>
          <polygon points="0,26 -7,10 -4.5,-96 0,-118 4.5,-96 7,10" fill="#1d1a12" stroke="#3a3120" strokeWidth={1} />
          <rect x={-2} y={-104} width={4} height={26} fill="#c9a24b" />
        </g>
        <g ref={handsMin}>
          <polygon points="0,30 -5.6,12 -3.4,-158 0,-184 3.4,-158 5.6,12" fill="#1d1a12" stroke="#3a3120" strokeWidth={1} />
          <rect x={-1.6} y={-170} width={3.2} height={30} fill="#c9a24b" />
        </g>
        <g ref={handsSec}>
          <line x1={0} y1={52} x2={0} y2={-196} stroke="#d95f2b" strokeWidth={2.4} />
          <circle cy={52} r={7} fill="#d95f2b" />
          <polygon points="-3.5,-180 0,-206 3.5,-180" fill="#d95f2b" />
        </g>
        <circle cx={C} cy={C} r={10.5} fill="#c9a24b" stroke="#84642a" strokeWidth={1.4} />
        <circle cx={C} cy={C} r={4} fill="#12100c" />
      </g>

      {/* ---------- bezel + crown ---------- */}
      <g ref={bezelRef} pointerEvents="none">
        <circle cx={C} cy={C} r={296} fill="none" stroke="url(#brassGrad)" strokeWidth={30} />
        <circle cx={C} cy={C} r={281} fill="none" stroke="#3a3120" strokeWidth={2.4} opacity={0.8} />
        <circle cx={C} cy={C} r={311} fill="none" stroke="#84642a" strokeWidth={3} />
        <circle cx={C} cy={C} r={269} fill="none" stroke="#eccf7d" strokeWidth={1.2} opacity={0.55} />
        {/* bezel screws */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <g key={deg} transform={`translate(${C + Math.cos(a) * 296} ${C + Math.sin(a) * 296}) rotate(${deg + 20})`}>
              <circle r={6.5} fill="#84642a" />
              <rect x={-4.5} y={-1.1} width={9} height={2.2} fill="#12100c" />
            </g>
          );
        })}
      </g>
      <g ref={crownRef}>
        <rect x={306} y={2} width={28} height={20} rx={5} fill="url(#brassGrad)" stroke="#84642a" strokeWidth={1.4} />
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={i} x1={310 + i * 5} y1={4} x2={310 + i * 5} y2={20} stroke="#84642a" strokeWidth={1.4} />
        ))}
      </g>

      {/* glass reflection */}
      <path d={`M ${C - 150} ${C - 190} A 240 240 0 0 1 ${C + 60} ${C - 228}`} fill="none" stroke="#f4eeda" strokeWidth={16} strokeLinecap="round" opacity={0.08} pointerEvents="none" />

      {/* impact flash */}
      <circle ref={flashRef} cx={C} cy={C} r={140} fill="url(#flashGrad)" opacity={0} pointerEvents="none" />
      </g>
    </svg>
  );
}
