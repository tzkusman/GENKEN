import { useRef, useState, useEffect } from "react";
import ClockFace, { type ClockProgress } from "./ClockFace";
import { Gear, Spring, DustMotes } from "./parts";
import { SectionHead, Scramble, Stat } from "./HUD";
import { useReveal, useElementProgress, useFrame, crossProgress, window01, easeInOut, clamp01, prefersReducedMotion } from "../lib/scroll";
import { CASE_META, PARTS, VITALS, TORQUE_CURVE, STRESS_LOG, type ClockPart } from "../data/clock";

/* ============================================================
   00 · OVERTURE — the clock, alive, running YOUR local time
   ============================================================ */

const ZERO = { stress: 0, fracture: 0, shatter: 0 };
const getZero = () => ZERO;

export function Overture() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const clockWrapRef = useRef<HTMLDivElement>(null);
  const cueRef = useReveal<HTMLDivElement>(0.05);
  const headRef = useReveal<HTMLDivElement>(0.05);

  /* mouse parallax on the clock — mass lags the cursor */
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  useFrame(() => {
    if (prefersReducedMotion() || !clockWrapRef.current) return;
    pos.current.x += (target.current.x - pos.current.x) * 0.06;
    pos.current.y += (target.current.y - pos.current.y) * 0.06;
    clockWrapRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotateX(${pos.current.y * -0.05}deg) rotateY(${pos.current.x * 0.05}deg)`;
  });

  return (
    <section id="overture" data-stage className="relative flex min-h-screen flex-col justify-end overflow-hidden pt-28">
      <DustMotes count={16} />
      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-6 pb-10 md:px-10 lg:grid-cols-12 lg:gap-6">
        {/* left: the indictment */}
        <div ref={headRef} className="relative z-10 lg:col-span-6">
          <p className="rv mono-label mb-6 flex items-center gap-3 text-ember" style={{ "--rv-delay": "0ms" } as React.CSSProperties}>
            <span className="inline-block h-2 w-2 animate-pulse bg-ember" />
            {CASE_META.file} · HOROLOGICAL FORENSICS DIVISION
          </p>
          <h1 className="font-display leading-[0.86] tracking-[0.01em] text-bone">
            <span className="mask-line" style={{ "--ml-delay": "80ms" } as React.CSSProperties}>
              <span className="text-[clamp(3.4rem,9vw,8.5rem)]">THE DESTRUCTION</span>
            </span>
            <span className="mask-line" style={{ "--ml-delay": "200ms" } as React.CSSProperties}>
              <span className="text-[clamp(3.4rem,9vw,8.5rem)]">
                OF A <em className="not-italic text-brass">CLOCK</em>
              </span>
            </span>
            <span className="mask-line" style={{ "--ml-delay": "320ms" } as React.CSSProperties}>
              <span className="text-[clamp(1.6rem,3.4vw,3rem)] text-mute">IN SEVEN SCROLL-COUPLED STAGES</span>
            </span>
          </h1>

          <p className="rv mt-8 max-w-xl text-[15px] leading-relaxed text-parch/90" style={{ "--rv-delay": "420ms" } as React.CSSProperties}>
            Exhibit 1707-A — <span className="text-brass-hi">Meridian No. 1707</span> — arrived at the laboratory ticking,
            hand-wound, and structurally optimistic. What follows is the complete, reversible demolition of a mechanical
            clock: every gear catalogued, every crack drawn to scale, every shard of enamel weighed. The scroll wheel is
            the weapon. You are the operator.
          </p>

          <div className="rv mt-8 grid grid-cols-1 gap-px border border-seam bg-seam sm:grid-cols-3" style={{ "--rv-delay": "540ms" } as React.CSSProperties}>
            {[
              { k: "EXHIBIT", v: CASE_META.exhibit },
              { k: "MOVEMENT", v: "17 JEWELS · 4 Hz" },
              { k: "VERDICT", v: CASE_META.verdict },
            ].map((m) => (
              <div key={m.k} className="bg-coal/80 px-4 py-3 transition-colors duration-300 hover:bg-panel">
                <div className="mono-label text-mute">{m.k}</div>
                <div className="mono-read mt-1 text-[13px] font-semibold text-bone">{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* right: the condemned, live */}
        <div
          ref={wrapRef}
          className="relative z-10 lg:col-span-6"
          onMouseMove={(e) => {
            const r = wrapRef.current?.getBoundingClientRect();
            if (!r) return;
            target.current.x = ((e.clientX - r.left) / r.width - 0.5) * 26;
            target.current.y = ((e.clientY - r.top) / r.height - 0.5) * 26;
          }}
          onMouseLeave={() => {
            target.current.x = 0;
            target.current.y = 0;
          }}
        >
          <div className="relative mx-auto w-[min(88vw,560px)]" style={{ perspective: "1100px" }}>
            <div className="pulse-ring absolute inset-6 rounded-full border border-brass/30" />
            <div className="pulse-ring absolute inset-6 rounded-full border border-ember/20" style={{ animationDelay: "1.2s" }} />
            <div ref={clockWrapRef} className="relative will-change-transform">
              <ClockFace get={getZero} className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]" />
            </div>
            <p className="mono-label mt-4 flex items-center justify-center gap-2 text-mute">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-verdi" />
              LIVE — RUNNING ON YOUR LOCAL TIME. IT DOES NOT KNOW YET.
            </p>
          </div>
        </div>
      </div>

      {/* scroll cue + marquee */}
      <div ref={cueRef} className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-6 pb-6 md:px-10">
          <div className="relative h-14 w-8 overflow-hidden border border-brass/50">
            <span className="scroll-cue absolute inset-x-2 top-0 h-full bg-gradient-to-b from-transparent via-brass to-transparent" />
          </div>
          <div>
            <p className="font-display text-2xl tracking-[0.14em] text-bone">SCROLL TO COMMENCE DEMOLITION</p>
            <p className="mono-label text-mute">THE ESCAPEMENT CANNOT ESCAPE<span className="blink-cursor text-ember">▍</span></p>
          </div>
        </div>
        <div className="border-y border-seam/70 bg-coal/60 py-3">
          <div className="marquee-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
                {["TEMPUS EDAX RERUM", "EXHIBIT 1707-A WILL NOT SURVIVE THIS PAGE", "THE ESCAPEMENT CANNOT ESCAPE", "EVERY TICK IS A SMALL DEATH · 28,800 REHEARSALS AN HOUR", "SCROLL VELOCITY IS NOW A WEAPON", "THE MAINSPRING REMEMBERS BEING FLAT", "17 JEWELS COULD NOT SAVE IT"].map((t) => (
                  <span key={t} className="mono-label mx-6 flex items-center gap-6 whitespace-nowrap text-mute">
                    {t} <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0 L10 5 L5 10 L0 5 Z" fill="#d95f2b" /></svg>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   I · ANATOMY — exploded movement, hover-synced manifest
   ============================================================ */

function ExplodedClock({ hovered, explodeGet }: { hovered: string | null; explodeGet: () => number }) {
  const groupEls = useRef<Record<string, SVGGElement | null>>({});

  useFrame(() => {
    const e = easeInOut(explodeGet());
    for (const p of PARTS) {
      const g = groupEls.current[p.id];
      if (!g) continue;
      g.setAttribute("transform", `translate(0 ${(p.explodeY * e).toFixed(1)})`);
      g.setAttribute("opacity", String(0.55 + 0.45 * (1 - e * 0.25)));
    }
  });

  const strokeFor = (id: string) => (hovered === id ? "#d95f2b" : "#84642a");
  const bind = (id: string) => (el: SVGGElement | null) => {
    groupEls.current[id] = el;
  };
  const glow = (id: string) => (hovered === id ? "drop-shadow(0 0 6px rgba(217,95,43,0.8))" : undefined);

  return (
    <svg viewBox="0 0 640 940" className="h-auto w-full max-w-[520px]" role="img" aria-label="Exploded view of the Meridian 1707 movement">
      <line x1={320} y1={40} x2={320} y2={900} stroke="#37301f" strokeWidth={1} strokeDasharray="4 7" />
      {/* case */}
      <g ref={bind("case")} style={{ filter: glow("case") }}>
        <circle cx={320} cy={470} r={178} fill="none" stroke={strokeFor("case")} strokeWidth={26} opacity={0.9} />
        <circle cx={320} cy={470} r={192} fill="none" stroke="#3a3120" strokeWidth={2} />
      </g>
      {/* mainplate */}
      <g ref={bind("plate")} style={{ filter: glow("plate") }}>
        <rect x={170} y={450} width={300} height={42} rx={21} fill="#2e2818" stroke={strokeFor("plate")} strokeWidth={2} />
        {[200, 250, 320, 390, 440].map((x) => (
          <circle key={x} cx={x} cy={471} r={4.5} fill="#d95f2b" opacity={0.85} />
        ))}
      </g>
      {/* barrel + mainspring */}
      <g ref={bind("barrel")} style={{ filter: glow("barrel") }}>
        <circle cx={252} cy={470} r={66} fill="#241f12" stroke={strokeFor("barrel")} strokeWidth={2.4} />
        <g transform="translate(252 470)">
          <Spring r={52} turns={7} hue="steel" strokeWidth={2.6} />
        </g>
        <circle cx={252} cy={470} r={9} fill="#84642a" />
      </g>
      {/* gear train */}
      <g ref={bind("geartrain")} style={{ filter: glow("geartrain") }}>
        <g transform="translate(330 470)"><Gear r={44} teeth={12} spokes={4} /></g>
        <g transform="translate(398 470)"><Gear r={30} teeth={10} hue="steel" /></g>
        <g transform="translate(444 470)"><Gear r={19} teeth={8} /></g>
      </g>
      {/* balance */}
      <g ref={bind("balance")} style={{ filter: glow("balance") }}>
        <circle cx={250} cy={470} r={56} fill="none" stroke={strokeFor("balance")} strokeWidth={5} />
        <g transform="translate(250 470)"><Spring r={34} turns={5} hue="brass" strokeWidth={1.6} /></g>
        <line x1={194} y1={470} x2={306} y2={470} stroke={strokeFor("balance")} strokeWidth={3} />
      </g>
      {/* escapement */}
      <g ref={bind("escapement")} style={{ filter: glow("escapement") }}>
        <g transform="translate(400 470)">
          <Gear r={34} teeth={15} hue="steel" />
        </g>
        <path d="M360 470 L400 452 L440 470 L400 480 Z" fill="#a33c1e" opacity={0.85} />
      </g>
      {/* cannon pinion */}
      <g ref={bind("cannon")} style={{ filter: glow("cannon") }}>
        <g transform="translate(320 470)"><Gear r={17} teeth={9} hue="steel" /></g>
      </g>
      {/* dial */}
      <g ref={bind("dial")} style={{ filter: glow("dial") }}>
        <circle cx={320} cy={470} r={150} fill="#e7dcc0" stroke={strokeFor("dial")} strokeWidth={2.4} />
        <circle cx={320} cy={470} r={132} fill="none" stroke="#2b2418" strokeWidth={1.4} opacity={0.7} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line key={i} x1={320 + Math.cos(a) * 138} y1={470 + Math.sin(a) * 138} x2={320 + Math.cos(a) * 146} y2={470 + Math.sin(a) * 146} stroke="#2b2418" strokeWidth={2.2} />
          );
        })}
      </g>
      {/* hands */}
      <g ref={bind("hands")} style={{ filter: glow("hands") }}>
        <g transform="translate(320 470) rotate(-52)">
          <polygon points="0,20 -5,8 -3,-88 0,-104 3,-88 5,8" fill="#1d1a12" stroke={strokeFor("hands")} strokeWidth={1.4} />
        </g>
        <g transform="translate(320 470) rotate(64)">
          <polygon points="0,24 -4,10 -2.4,-132 0,-150 2.4,-132 4,10" fill="#1d1a12" stroke={strokeFor("hands")} strokeWidth={1.4} />
        </g>
        <circle cx={320} cy={470} r={7} fill="#c9a24b" stroke={strokeFor("hands")} strokeWidth={1.2} />
      </g>
      {/* crystal */}
      <g ref={bind("crystal")} style={{ filter: glow("crystal") }}>
        <ellipse cx={320} cy={470} rx={158} ry={44} fill="rgba(234,226,205,0.05)" stroke={strokeFor("crystal")} strokeWidth={2} />
        <ellipse cx={320} cy={470} rx={158} ry={44} fill="none" stroke="#eae2cd" strokeWidth={0.8} opacity={0.35} transform="translate(0 -7)" />
      </g>
    </svg>
  );
}

export function Anatomy() {
  const [hovered, setHovered] = useState<string | null>(null);
  const explode = useRef(0);
  const listRef = useReveal<HTMLDivElement>();

  const sectionElRef = useElementProgress<HTMLElement>(
    (m, s) => crossProgress(m, s),
    (p) => {
      explode.current = p;
    },
  );

  return (
    <section id="anatomy" data-stage ref={sectionElRef} className="relative mx-auto max-w-7xl px-6 py-32 md:px-10">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="sticky top-28">
            <SectionHead
              kicker="STAGE I · ANATOMY OF THE CONDEMNED"
              lines={["TEN PARTS,", "NONE OF THEM", "SURVIVORS"]}
            />
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-parch/85">
              Before the violence, the inventory. Scroll and the movement pulls itself apart along its own axis —
              crystal to case, thought to skull. Hover the manifest and the drawing answers.
            </p>
            <div className="mt-8">
              <ExplodedClock hovered={hovered} explodeGet={() => explode.current} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div ref={listRef} className="divide-y divide-seam border-y border-seam">
            {PARTS.map((p: ClockPart, i) => (
              <article
                key={p.id}
                className="rv group grid cursor-crosshair grid-cols-[3.2rem_1fr] gap-4 px-2 py-6 transition-colors duration-300 hover:bg-panel/70 md:grid-cols-[4rem_1fr_10rem] md:px-4"
                style={{ "--rv-delay": `${(i % 4) * 90}ms` } as React.CSSProperties}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="mono-read pt-1 text-2xl font-semibold text-brass-lo transition-colors duration-300 group-hover:text-ember">
                  {p.index}
                </span>
                <div>
                  <h3 className="font-display text-3xl tracking-[0.04em] text-bone md:text-4xl">
                    {p.name.toUpperCase()}
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-mute">{p.role}</p>
                  <p className="mt-2 text-[13px] text-parch/80">
                    <span className="text-brass">{p.material}</span>
                  </p>
                </div>
                <div className="col-start-2 md:col-start-3 md:text-right">
                  <div className="mono-read inline-block border border-seam px-2 py-1 text-[11px] text-parch/80 transition-colors duration-300 group-hover:border-ember group-hover:text-bone">
                    {p.spec}
                  </div>
                  <div className="mono-label mt-2 text-mute">{p.massG.toFixed(1)} g</div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14">
            <h3 className="mono-label mb-4 text-verdi">PRE-INCIDENT VITALS · FULLY WOUND</h3>
            <div className="grid grid-cols-2 gap-px border border-seam bg-seam md:grid-cols-4">
              {VITALS.map((v) => (
                <Stat key={v.label} label={v.label} value={v.value} note={v.note} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   II · LOADING — torque curve draws itself toward the red line
   ============================================================ */

function TorqueCurve() {
  const pathRef = useRef<SVGPathElement>(null);
  const overRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);
  const lenRef = useRef(1);
  const overLenRef = useRef(1);

  useEffect(() => {
    if (pathRef.current) lenRef.current = pathRef.current.getTotalLength();
    if (overRef.current) overLenRef.current = overRef.current.getTotalLength();
  }, []);

  const ref = useElementProgress<HTMLDivElement>(
    (m, s) => crossProgress(m, s),
    (p) => {
      const drawP = clamp01(p * 1.4);
      if (pathRef.current) {
        pathRef.current.style.strokeDasharray = String(lenRef.current);
        pathRef.current.style.strokeDashoffset = String(lenRef.current * (1 - drawP));
      }
      const overP = window01(p, 0.62, 0.95);
      if (overRef.current) {
        overRef.current.style.strokeDasharray = String(overLenRef.current);
        overRef.current.style.strokeDashoffset = String(overLenRef.current * (1 - overP));
      }
      if (dotRef.current) {
        const i = Math.min(TORQUE_CURVE.length - 1, drawP * (TORQUE_CURVE.length - 1));
        const i0 = Math.floor(i);
        const f = i - i0;
        const a = TORQUE_CURVE[i0];
        const b = TORQUE_CURVE[Math.min(TORQUE_CURVE.length - 1, i0 + 1)];
        const turn = a.turn + (b.turn - a.turn) * f;
        const nm = a.nm + (b.nm - a.nm) * f;
        dotRef.current.setAttribute("cx", String(50 + (turn / 4.5) * 400));
        dotRef.current.setAttribute("cy", String(270 - (nm / 13) * 240));
        if (readRef.current) readRef.current.textContent = `${turn.toFixed(1)} TURNS · ${nm.toFixed(1)} N·mm`;
      }
    },
  );

  const X = (turn: number) => 50 + (turn / 4.5) * 400;
  const Y = (nm: number) => 270 - (nm / 13) * 240;
  const mainPath = TORQUE_CURVE.map((pt, i) => `${i === 0 ? "M" : "L"}${X(pt.turn)} ${Y(pt.nm)}`).join(" ");
  const last = TORQUE_CURVE[TORQUE_CURVE.length - 1];

  return (
    <div ref={ref} className="border border-seam bg-coal/70 p-5">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h4 className="mono-label text-brass">BARREL TORQUE vs CROWN TURNS</h4>
        <span ref={readRef} className="mono-read text-[12px] text-ember">0.0 TURNS · 6.1 N·mm</span>
      </div>
      <svg viewBox="0 0 480 300" className="h-auto w-full">
        {/* danger band */}
        <rect x={50} y={Y(13)} width={400} height={Y(6.1) - Y(13)} fill="#d95f2b" opacity={0.06} />
        <line x1={50} y1={Y(6.1)} x2={450} y2={Y(6.1)} stroke="#d95f2b" strokeWidth={1.2} strokeDasharray="6 5" opacity={0.8} />
        <text x={452} y={Y(6.1) + 4} fill="#d95f2b" fontSize="10" fontFamily="'IBM Plex Mono', monospace" textAnchor="end">
        </text>
        <text x={54} y={Y(6.1) - 6} fill="#d95f2b" fontSize="10" fontFamily="'IBM Plex Mono', monospace">
          DESIGN ENVELOPE · 6.1 N·mm
        </text>
        {/* grid */}
        {[0, 1, 2, 3, 4].map((t) => (
          <g key={t}>
            <line x1={X(t)} y1={30} x2={X(t)} y2={270} stroke="#37301f" strokeWidth={0.7} />
            <text x={X(t)} y={288} fill="#9c9078" fontSize="10" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
              {t}
            </text>
          </g>
        ))}
        {[0, 3, 6, 9, 12].map((n) => (
          <g key={n}>
            <line x1={50} y1={Y(n)} x2={450} y2={Y(n)} stroke="#37301f" strokeWidth={0.7} />
            <text x={44} y={Y(n) + 3} fill="#9c9078" fontSize="10" textAnchor="end" fontFamily="'IBM Plex Mono', monospace">
              {n}
            </text>
          </g>
        ))}
        <path d={mainPath} fill="none" stroke="#c9a24b" strokeWidth={2.6} strokeLinecap="round" ref={pathRef} />
        {/* the overwind event */}
        <path
          ref={overRef}
          d={`M${X(last.turn)} ${Y(last.nm)} L${X(4.15)} ${Y(7.4)} L${X(4.28)} ${Y(9.8)} L${X(4.38)} ${Y(12.4)}`}
          fill="none"
          stroke="#d95f2b"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray="7 4"
        />
        <circle ref={dotRef} r={5.5} fill="#eccf7d" stroke="#12100c" strokeWidth={2} cx={X(0)} cy={Y(6.1)} />
        <text x={X(4.38) - 6} y={Y(12.4) - 10} fill="#d95f2b" fontSize="11" textAnchor="end" fontFamily="'IBM Plex Mono', monospace">
          12.4 N·mm — 203%
        </text>
        <text x={250} y={298} fill="#9c9078" fontSize="10" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
          CROWN TURNS AFTER FULL WIND →
        </text>
      </svg>
    </div>
  );
}

export function Stress() {
  const logRef = useReveal<HTMLDivElement>();
  const rightRef = useReveal<HTMLDivElement>();

  return (
    <section id="stress" data-stage className="relative border-t border-seam/60 bg-coal/40">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-32 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHead
            kicker="STAGE II · LOADING"
            tone="ember"
            lines={["THE WINDING", "PAST", "TOLERANCE"]}
          />
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-parch/90">
            <p>
              A mainspring is a controlled argument between a ribbon of steel and the person holding the key.
              The Meridian's barrel was designed for <span className="text-brass-hi">6.1 newton-millimetres</span> of
              torque — the polite shove of a fully wound spring, metered out over forty-one hours like an inheritance.
            </p>
            <p>
              The operator kept winding. Past the detent click, past the soft mechanical <em className="text-ember not-italic">no</em>.
              Each extra turn compressed the coils toward their solid height, and the torque climbed the curve on the
              right — past the envelope, past the margin, into the territory where steel stops negotiating.
            </p>
            <p className="border-l-2 border-ember pl-4 text-mute">
              Nothing has broken yet. That is the cruel part of Stage II: every instrument is still functioning,
              and every instrument is already testifying.
            </p>
          </div>

          <div ref={logRef} className="mt-10 border border-seam bg-soot/80">
            <div className="flex items-center justify-between border-b border-seam px-4 py-2">
              <span className="mono-label text-mute">TELEMETRY · CHANNELS 01–08</span>
              <span className="mono-label flex items-center gap-2 text-ember">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-ember" /> REC
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto p-4">
              {STRESS_LOG.map((l, i) => (
                <p
                  key={l.t + l.channel}
                  className="rv mono-read mb-2 flex flex-wrap gap-x-3 text-[12px] leading-relaxed"
                  style={{ "--rv-delay": `${i * 110}ms` } as React.CSSProperties}
                >
                  <span className="text-mute">{l.t}</span>
                  <span className={l.level === "crit" ? "text-ember" : l.level === "warn" ? "text-brass-hi" : "text-verdi"}>
                    [{l.channel}]
                  </span>
                  <span className="basis-full text-parch/85 sm:basis-auto">{l.msg}</span>
                </p>
              ))}
              <p className="mono-read text-[12px] text-ember">
                &gt; BUFFER FULL<span className="blink-cursor">▍</span>
              </p>
            </div>
          </div>
        </div>

        <div ref={rightRef} className="lg:col-span-7">
          <div className="rv sticky top-28 space-y-8" style={{ "--rv-delay": "120ms" } as React.CSSProperties}>
            <TorqueCurve />
            <div>
              <h4 className="mono-label mb-4 text-verdi">MATERIAL DOSSIER · WHAT THE STEEL WAS UP AGAINST</h4>
              <div className="grid gap-px border border-seam bg-seam sm:grid-cols-2">
                {[
                  { k: "Fracture toughness", v: "72 MPa·√m", n: "What the alloy could afford" },
                  { k: "Yield strength", v: "1,180 MPa", n: "Where bending becomes permanent" },
                  { k: "Fatigue limit", v: "±410 MPa", n: "Cyclic budget: 345,600 beats/day" },
                  { k: "Shear modulus", v: "79 GPa", n: "Stiffness of the handshake" },
                ].map((d) => (
                  <Stat key={d.k} label={d.k} value={v2s(d.v)} note={d.n} />
                ))}
              </div>
            </div>
            <figure className="border border-seam bg-panel/50 p-6">
              <blockquote className="font-display text-[clamp(1.6rem,3vw,2.6rem)] leading-tight tracking-[0.02em] text-bone">
                "OVERWINDING IS NOT EXCESS. IT IS THE CLOCK BEING ASKED TO HOLD
                <span className="text-ember"> MORE FUTURE THAN ITS PRESENT CAN BEAR.</span>"
              </blockquote>
              <figcaption className="mono-label mt-4 text-mute">— LAB NOTEBOOK, PAGE 41, MARGIN</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

function v2s(v: string) {
  return v;
}
