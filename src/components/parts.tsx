import { memo } from "react";
import { mulberry32, hashString } from "../lib/scroll";

/* ============================================================
   MECHANICAL PART SVGs — parametric, deterministic
   ============================================================ */

const HUE = {
  brass: { fill: "#c9a24b", stroke: "#84642a", hi: "#eccf7d" },
  steel: { fill: "#8f887a", stroke: "#5b554a", hi: "#c4bcae" },
  ember: { fill: "#d95f2b", stroke: "#a33c1e", hi: "#f08a4f" },
  bone: { fill: "#e7dcc0", stroke: "#b3a687", hi: "#f4eeda" },
} as const;

export type Hue = keyof typeof HUE;

export function gearPath(r: number, teeth: number, cx = 0, cy = 0, holeRatio = 0.3, depth = 0.2): string {
  const ro = r;
  const rr = r * (1 - depth);
  const w = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  const P = (rad: number, a: number) => `${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`;
  for (let i = 0; i < teeth; i++) {
    const a0 = i * w;
    pts.push(`L${P(rr, a0)}`, `L${P(rr, a0 + 0.24 * w)}`, `L${P(ro, a0 + 0.36 * w)}`, `L${P(ro, a0 + 0.6 * w)}`, `L${P(rr, a0 + 0.72 * w)}`);
  }
  const h = r * holeRatio;
  const hole = `M${cx + h} ${cy} A${h} ${h} 0 1 0 ${cx - h} ${cy} A${h} ${h} 0 1 0 ${cx + h} ${cy} Z`;
  return `M${P(rr, 0)} ${pts.join(" ")} Z ${hole}`;
}

export const Gear = memo(function Gear({
  r,
  teeth,
  hue = "brass",
  opacity = 1,
  spokes = 0,
  className,
}: {
  r: number;
  teeth: number;
  hue?: Hue;
  opacity?: number;
  spokes?: number;
  className?: string;
}) {
  const c = HUE[hue];
  const hole = r * 0.3;
  return (
    <g className={className} opacity={opacity}>
      <path d={gearPath(r, teeth)} fill={c.fill} stroke={c.stroke} strokeWidth={Math.max(1, r * 0.02)} fillRule="evenodd" />
      <circle r={hole * 0.62} fill="none" stroke={c.stroke} strokeWidth={Math.max(1, r * 0.02)} />
      {spokes > 0 &&
        Array.from({ length: spokes }).map((_, i) => {
          const a = (i / spokes) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * r * 0.58}
              cy={Math.sin(a) * r * 0.58}
              r={r * 0.13}
              fill="#1a1712"
              opacity={0.55}
            />
          );
        })}
      <circle r={hole * 0.22} fill="#1a1712" />
      <path
        d={gearPath(r, teeth)}
        fill="none"
        stroke={c.hi}
        strokeWidth={Math.max(0.6, r * 0.012)}
        fillRule="evenodd"
        opacity={0.5}
        transform="translate(-0.8 -0.8)"
      />
    </g>
  );
});

export function Spring({ r = 24, turns = 6, hue = "steel", strokeWidth = 2 }: { r?: number; turns?: number; hue?: Hue; strokeWidth?: number }) {
  const c = HUE[hue];
  const steps = turns * 36;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const rad = 3 + (r - 3) * t;
    d += `${i === 0 ? "M" : "L"}${(Math.cos(a) * rad).toFixed(2)} ${(Math.sin(a) * rad).toFixed(2)} `;
  }
  return (
    <g>
      <path d={d} fill="none" stroke={c.stroke} strokeWidth={strokeWidth + 1} strokeLinecap="round" opacity={0.6} />
      <path d={d} fill="none" stroke={c.fill} strokeWidth={strokeWidth} strokeLinecap="round" />
    </g>
  );
}

export function Screw({ r = 10, hue = "steel" }: { r?: number; hue?: Hue }) {
  const c = HUE[hue];
  return (
    <g>
      <circle r={r} fill={c.fill} stroke={c.stroke} strokeWidth={1.2} />
      <circle r={r * 0.72} fill="none" stroke={c.stroke} strokeWidth={0.7} opacity={0.7} />
      <rect x={-r * 0.78} y={-r * 0.14} width={r * 1.56} height={r * 0.28} fill="#1a1712" transform="rotate(28)" />
      <path d={`M${-r * 0.7} ${-r * 0.5} A${r} ${r} 0 0 1 ${r * 0.7} ${-r * 0.5}`} fill="none" stroke={c.hi} strokeWidth={1} opacity={0.7} />
    </g>
  );
}

export function Jewel({ r = 7, hue = "ember" }: { r?: number; hue?: Hue }) {
  const c = HUE[hue];
  const pts = Array.from({ length: 8 })
    .map((_, i) => {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
      return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
    })
    .join(" ");
  return (
    <g>
      <polygon points={pts} fill={c.fill} stroke={c.stroke} strokeWidth={0.9} />
      <circle r={r * 0.34} fill={c.hi} opacity={0.85} />
      <circle r={r * 0.14} fill="#f4eeda" />
    </g>
  );
}

export function HandPart({ len = 30, hue = "steel" }: { len?: number; hue?: Hue }) {
  const c = HUE[hue];
  const w = Math.max(2.4, len * 0.085);
  return (
    <g>
      <polygon
        points={`0,${len * 0.28} ${-w},${len * 0.1} ${-w * 0.45},${-len * 0.78} 0,${-len} ${w * 0.45},${-len * 0.78} ${w},${len * 0.1}`}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth={0.9}
      />
      <circle r={w * 0.9} fill={c.stroke} />
    </g>
  );
}

export function ShardPiece({ r = 20, seed = 1, hue = "bone" }: { r?: number; seed?: number; hue?: Hue }) {
  const c = HUE[hue];
  const rnd = mulberry32(seed);
  const n = 4 + Math.floor(rnd() * 3);
  const pts = Array.from({ length: n })
    .map((_, i) => {
      const a = (i / n) * Math.PI * 2 + rnd() * 0.7;
      const rad = r * (0.45 + rnd() * 0.65);
      return `${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)}`;
    })
    .join(" ");
  return (
    <g>
      <polygon points={pts} fill={c.fill} stroke={c.stroke} strokeWidth={1} opacity={0.96} />
      <polygon points={pts} fill={c.hi} opacity={0.18} transform={`scale(0.6) rotate(${rnd() * 40 - 20})`} />
    </g>
  );
}

export function Wheel({ r = 34, teeth = 24, hue = "brass" }: { r?: number; teeth?: number; hue?: Hue }) {
  const c = HUE[hue];
  return (
    <g>
      <path d={gearPath(r, teeth, 0, 0, 0.14, 0.12)} fill={c.fill} stroke={c.stroke} strokeWidth={1.1} fillRule="evenodd" />
      <circle r={r * 0.5} fill="none" stroke={c.stroke} strokeWidth={r * 0.09} opacity={0.85} />
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return <line key={i} x1={0} y1={0} x2={Math.cos(a) * r * 0.52} y2={Math.sin(a) * r * 0.52} stroke={c.stroke} strokeWidth={r * 0.07} opacity={0.8} />;
      })}
      <circle r={r * 0.12} fill={c.stroke} />
    </g>
  );
}

/* ============================================================
   DEBRIS SPRITE — picks the right part for the fall field
   ============================================================ */

export function DebrisSprite({ kind, size, hue }: { kind: string; size: number; hue: Hue }) {
  const s = size / 2;
  switch (kind) {
    case "gear":
      return <Gear r={s} teeth={Math.max(8, Math.round(size / 6))} hue={hue} spokes={size > 70 ? 4 : 0} />;
    case "wheel":
      return <Wheel r={s} teeth={Math.max(16, Math.round(size / 3))} hue={hue} />;
    case "spring":
      return <Spring r={s} turns={6} hue={hue} strokeWidth={Math.max(1.6, size / 22)} />;
    case "screw":
      return <Screw r={s} hue={hue} />;
    case "jewel":
      return <Jewel r={s} hue={hue} />;
    case "hand":
      return <HandPart len={size} hue={hue} />;
    case "shard":
    default:
      return <ShardPiece r={s} seed={hashString(kind + size)} hue={hue} />;
  }
}

/* ============================================================
   AMBIENT GEAR FIELD — slow background transmission
   ============================================================ */

export const GearField = memo(function GearField({ className }: { className?: string }) {
  const gears = [
    { x: "8%", y: "18%", r: 90, teeth: 16, dur: 46, rev: true, o: 0.1 },
    { x: "20%", y: "26%", r: 46, teeth: 10, dur: 26, rev: false, o: 0.12 },
    { x: "85%", y: "14%", r: 120, teeth: 20, dur: 64, rev: false, o: 0.08 },
    { x: "78%", y: "30%", r: 54, teeth: 11, dur: 30, rev: true, o: 0.11 },
    { x: "92%", y: "62%", r: 80, teeth: 15, dur: 44, rev: true, o: 0.09 },
    { x: "6%", y: "70%", r: 64, teeth: 12, dur: 34, rev: false, o: 0.1 },
    { x: "14%", y: "86%", r: 100, teeth: 18, dur: 56, rev: true, o: 0.07 },
    { x: "70%", y: "88%", r: 44, teeth: 9, dur: 22, rev: false, o: 0.12 },
  ];
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {gears.map((g, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: g.x, top: g.y, animation: `gear-spin ${g.dur}s linear infinite ${g.rev ? "reverse" : "normal"}` }}
        >
          <svg width={g.r * 2.4} height={g.r * 2.4} viewBox={`${-g.r * 1.2} ${-g.r * 1.2} ${g.r * 2.4} ${g.r * 2.4}`}>
            <Gear r={g.r} teeth={g.teeth} opacity={g.o} spokes={g.r > 70 ? 4 : 0} />
          </svg>
        </div>
      ))}
      <style>{`@keyframes gear-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
});

/* floating dust motes for ambient layers */
export function DustMotes({ count = 14 }: { count?: number }) {
  const rnd = mulberry32(77);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => {
        const size = 2 + rnd() * 4;
        return (
          <span
            key={i}
            className="dust-mote"
            style={
              {
                left: `${rnd() * 100}%`,
                top: `${rnd() * 100}%`,
                width: size,
                height: size,
                animationDuration: `${14 + rnd() * 22}s`,
                animationDelay: `${-rnd() * 30}s`,
                "--mote-o": 0.2 + rnd() * 0.45,
                "--mote-x": `${(rnd() - 0.5) * 10}vw`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
