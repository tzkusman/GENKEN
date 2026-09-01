import { useRef } from "react";
import ClockFace, { type ClockProgress } from "./ClockFace";
import { DebrisSprite } from "./parts";
import { SectionHead } from "./HUD";
import {
  useReveal,
  useElementProgress,
  useFrame,
  stickyProgress,
  traversalProgress,
  window01,
  easeInOut,
  clamp01,
  prefersReducedMotion,
  mulberry32,
} from "../lib/scroll";
import { DEBRIS, FALL_NOTES, SHARD_MANIFEST, TOTAL_MASS_RECOVERED, FRACTURE_PHYSICS, STRESS_LOG } from "../data/clock";

/* ============================================================
   III–V · THE CHAMBER — sticky clock, scroll-coupled demolition
   stress → fracture → shatter, fully reversible scrubbing
   ============================================================ */

const bell = (p: number, a: number, b: number) => Math.sin(Math.PI * clamp01(window01(p, a, b)));

export function Chamber() {
  const prog = useRef<ClockProgress>({ stress: 0, fracture: 0, shatter: 0 });
  const get = () => prog.current;

  const cardA = useRef<HTMLDivElement>(null);
  const cardB = useRef<HTMLDivElement>(null);
  const cardC = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const word2Ref = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);
  const fracCountRef = useRef<HTMLSpanElement>(null);
  const crackLenRef = useRef<HTMLSpanElement>(null);

  const ref = useElementProgress<HTMLElement>(
    (m, s) => stickyProgress(m, s),
    (p, s) => {
      const stress = window01(p, 0.02, 0.32);
      const fracture = window01(p, 0.34, 0.64);
      const shatter = window01(p, 0.66, 0.96);
      prog.current = { stress, fracture, shatter };

      const t = performance.now() / 1000;
      const reduced = prefersReducedMotion();

      /* shake */
      if (shakeRef.current && !reduced) {
        const amp = stress * stress * 1.6 + Math.pow(fracture, 3) * 8;
        const tx = (Math.sin(t * 43.7) + Math.sin(t * 67.3)) * 0.5 * amp;
        const ty = (Math.cos(t * 57.1) + Math.sin(t * 31.9)) * 0.5 * amp;
        shakeRef.current.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      }

      /* overlay cards */
      const setCard = (el: HTMLDivElement | null, a: number, b: number, side: 1 | -1) => {
        if (!el) return;
        const w = window01(p, a, b);
        const o = Math.sin(Math.PI * w);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translateX(${((0.5 - w) * 60 * side).toFixed(1)}px)`;
        el.style.pointerEvents = o > 0.35 ? "auto" : "none";
      };
      setCard(cardA.current, 0.0, 0.3, -1);
      setCard(cardB.current, 0.34, 0.64, 1);
      setCard(cardC.current, 0.68, 0.98, -1);

      /* giant background words drift in opposite directions */
      if (wordRef.current) wordRef.current.style.transform = `translateX(${(12 - p * 26).toFixed(2)}vw)`;
      if (word2Ref.current) {
        word2Ref.current.style.transform = `translateX(${(-14 + p * 30).toFixed(2)}vw)`;
        word2Ref.current.style.opacity = String(window01(p, 0.5, 0.75));
      }

      /* impact flash + stamp */
      if (flashRef.current) flashRef.current.style.opacity = (bell(p, 0.66, 0.78) * 0.5).toFixed(3);
      if (stampRef.current) {
        const so = window01(shatter, 0.03, 0.1) * (1 - window01(shatter, 0.55, 0.85));
        stampRef.current.style.opacity = so.toFixed(3);
        stampRef.current.style.transform = `rotate(-8deg) scale(${(1.25 - so * 0.25).toFixed(3)})`;
      }

      /* readouts */
      if (phaseRef.current) {
        const phase = p < 0.34 ? "III · STRESS" : p < 0.66 ? "IV · FRACTURE" : "V · SHATTER";
        const label = `${phase} — ${(p * 100).toFixed(0)}%`;
        if (phaseRef.current.textContent !== label) phaseRef.current.textContent = label;
      }
      if (fracCountRef.current) fracCountRef.current.textContent = String(Math.floor(stress * 96 + fracture * 312));
      if (crackLenRef.current) crackLenRef.current.textContent = `${(fracture * 212 + shatter * 1400).toFixed(1)} mm`;

      /* keep smoothed scroll referenced (unused warning guard) */
      void s;
    },
  );

  return (
    <section id="chamber" data-stage ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* drifting giants */}
        <div ref={wordRef} className="pointer-events-none absolute left-0 top-[12vh] select-none whitespace-nowrap will-change-transform" aria-hidden="true">
          <span className="font-display text-[22vw] leading-none tracking-[0.04em]" style={{ color: "transparent", WebkitTextStroke: "1px rgba(201,162,75,0.16)" }}>
            FRACTURE
          </span>
        </div>
        <div ref={word2Ref} className="pointer-events-none absolute bottom-[8vh] right-0 select-none whitespace-nowrap opacity-0 will-change-transform" aria-hidden="true">
          <span className="font-display text-[20vw] leading-none tracking-[0.04em]" style={{ color: "transparent", WebkitTextStroke: "1px rgba(217,95,43,0.22)" }}>
            SHATTER
          </span>
        </div>

        {/* impact flash */}
        <div ref={flashRef} className="pointer-events-none absolute inset-0 opacity-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(236,207,125,0.55), rgba(217,95,43,0.25) 35%, transparent 65%)" }} />

        {/* the clock */}
        <div ref={shakeRef} className="relative w-[min(82vw,540px)] will-change-transform">
          <ClockFace get={get} className="h-auto w-full drop-shadow-[0_36px_70px_rgba(0,0,0,0.6)]" />
        </div>

        {/* T-00:00 stamp */}
        <div ref={stampRef} className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0">
          <div className="stamp px-8 py-4 text-5xl md:text-7xl">T-00:00 · REPORT</div>
        </div>

        {/* phase cards */}
        <div ref={cardA} className="absolute left-[4vw] top-1/2 hidden w-80 -translate-y-1/2 opacity-0 lg:block">
          <CardShell index="III" title="STRESS BEYOND ELASTIC LIMIT" tone="brass">
            <p>
              The crown has stopped accepting apologies. Torque is past 200% of the design envelope and the
              going train is being fed like a fire hose. Listen: the tick is no longer a tick — it is a
              negotiation conducted in shouting.
            </p>
            <div className="mt-4 border-t border-seam pt-3">
              <div className="mono-label text-mute">MICRO-FRACTURES INITIATED</div>
              <span ref={fracCountRef} className="mono-read text-3xl font-bold text-brass-hi">0</span>
            </div>
          </CardShell>
        </div>

        <div ref={cardB} className="absolute right-[4vw] top-1/2 hidden w-80 -translate-y-1/2 opacity-0 lg:block">
          <CardShell index="IV" title="FRACTURE INITIATION" tone="ember">
            <p>
              The crack opens at the pallet-fork root — the single worst possible postcode — and immediately
              runs at a third of the speed of sound. The escapement, which has released energy one tooth at a
              time for its entire life, now releases all of it at once.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-seam pt-3">
              <div>
                <div className="mono-label text-mute">CRACK VELOCITY</div>
                <div className="mono-read text-xl font-bold text-ember">1,120 m/s</div>
              </div>
              <div>
                <div className="mono-label text-mute">TOTAL CRACK LENGTH</div>
                <span ref={crackLenRef} className="mono-read text-xl font-bold text-ember">0.0 mm</span>
              </div>
            </div>
          </CardShell>
        </div>

        <div ref={cardC} className="absolute left-[4vw] top-1/2 hidden w-80 -translate-y-1/2 opacity-0 lg:block">
          <CardShell index="V" title="SHATTER" tone="ember">
            <p>
              Enamel does not dent. It stores the argument and answers in fragments — fourteen primary shards,
              forty-seven pieces total, 0.84 joules of released energy. The hands leave the dial like
              employees at closing time.
            </p>
            <div className="mt-4 border-t border-seam pt-3">
              <div className="mono-label text-mute">ADVISORY</div>
              <p className="text-[13px] text-parch/85">Do not look away. Everything you skip will still be on the floor.</p>
            </div>
          </CardShell>
        </div>

        {/* bottom readout */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4 border border-seam bg-soot/80 px-5 py-2 backdrop-blur-sm">
          <span className="mono-label hidden text-mute sm:inline">DEMOLITION PROGRESS</span>
          <span ref={phaseRef} className="mono-read text-[13px] font-semibold text-bone">III · STRESS — 0%</span>
        </div>
      </div>
    </section>
  );
}

function CardShell({ index, title, tone, children }: { index: string; title: string; tone: "brass" | "ember"; children: React.ReactNode }) {
  const border = tone === "ember" ? "border-ember/40" : "border-brass/30";
  const text = tone === "ember" ? "text-ember" : "text-brass";
  return (
    <div className={`border ${border} bg-soot/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm`}>
      <div className="flex items-baseline gap-3">
        <span className={`font-display text-4xl ${text}`}>{index}</span>
        <h3 className="font-display text-2xl leading-tight tracking-[0.05em] text-bone">{title}</h3>
      </div>
      <div className="mt-3 text-[13.5px] leading-relaxed text-parch/90">{children}</div>
    </div>
  );
}

/* ============================================================
   VI · THE FALL — debris rain + dying pendulum + recovery manifest
   ============================================================ */

function Pendulum({ pGet }: { pGet: () => number }) {
  const swingRef = useRef<SVGGElement>(null);
  const rootRef = useRef<SVGGElement>(null);
  const bobGlowRef = useRef<SVGCircleElement>(null);

  useFrame(() => {
    const p = pGet();
    const t = performance.now() / 1000;
    const damp = Math.max(0, 1 - p * 0.94);
    const angle = prefersReducedMotion() ? -12 * damp : Math.sin(t * 2.6) * 24 * damp;
    if (swingRef.current) swingRef.current.setAttribute("transform", `rotate(${angle.toFixed(2)} 150 46)`);
    if (rootRef.current) {
      rootRef.current.setAttribute("transform", `translate(0 ${(p * 240).toFixed(1)})`);
      rootRef.current.setAttribute("opacity", String(1 - window01(p, 0.82, 1) * 0.85));
    }
    if (bobGlowRef.current) bobGlowRef.current.setAttribute("opacity", String(0.5 * damp));
  });

  return (
    <svg viewBox="0 0 300 640" className="h-auto w-full max-w-[320px]" role="img" aria-label="A pendulum swinging with decreasing amplitude as it falls">
      {/* suspension */}
      <rect x={70} y={18} width={160} height={14} rx={7} fill="#3a3120" />
      <circle cx={150} cy={46} r={8} fill="#c9a24b" stroke="#84642a" strokeWidth={2} />
      {/* amplitude ghost arcs */}
      {[-24, -12, 12, 24].map((a) => (
        <line key={a} x1={150} y1={46} x2={150 + Math.sin((a * Math.PI) / 180) * 470} y2={46 + Math.cos((a * Math.PI) / 180) * 470} stroke="#37301f" strokeWidth={1} strokeDasharray="3 8" />
      ))}
      <g ref={rootRef}>
        <g ref={swingRef}>
          <line x1={150} y1={46} x2={150} y2={470} stroke="#8f887a" strokeWidth={4} />
          <line x1={150} y1={46} x2={150} y2={470} stroke="#c4bcae" strokeWidth={1.2} opacity={0.5} transform="translate(-1 0)" />
          <circle ref={bobGlowRef} cx={150} cy={500} r={70} fill="#c9a24b" opacity={0.5} filter="blur(18px)" />
          <circle cx={150} cy={500} r={52} fill="url(#bobGrad)" stroke="#84642a" strokeWidth={3} />
          <circle cx={150} cy={500} r={38} fill="none" stroke="#84642a" strokeWidth={1.4} opacity={0.7} />
          <circle cx={136} cy={486} r={10} fill="#eccf7d" opacity={0.5} />
          <rect x={142} y={430} width={16} height={34} rx={4} fill="#84642a" />
        </g>
      </g>
      <defs>
        <radialGradient id="bobGrad" cx="38%" cy="32%" r="80%">
          <stop offset="0%" stopColor="#eccf7d" />
          <stop offset="55%" stopColor="#c9a24b" />
          <stop offset="100%" stopColor="#84642a" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Fall() {
  const fallP = useRef(0);
  const itemEls = useRef<(HTMLDivElement | null)[]>([]);
  const pendGet = () => fallP.current;
  const bgWord = useRef<HTMLDivElement>(null);
  const headReveal = useReveal<HTMLDivElement>();
  const notesReveal = useReveal<HTMLDivElement>();
  const tableReveal = useReveal<HTMLDivElement>();
  const rnd = useRef(mulberry32(4711)).current;

  const ref = useElementProgress<HTMLElement>(
    (m, s) => traversalProgress(m, s),
    (p, s) => {
      fallP.current = p;
      const vh = window.innerHeight;
      DEBRIS.forEach((d, i) => {
        const el = itemEls.current[i];
        if (!el) return;
        const local = clamp01(window01(p, d.delay * 0.35, 0.55 + d.delay * 0.4));
        const e = local * local * (3 - 2 * local); // smoothstep fall
        const travel = vh * (1.15 + d.depth * 0.75);
        const y = -120 + e * travel;
        const sway = Math.sin(e * 5.5 + d.x) * 26 * d.depth;
        const rot = e * d.spin;
        el.style.transform = `translate3d(${sway.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scaleY(${(0.55 + 0.45 * Math.abs(Math.cos(e * 4 * d.flip * Math.PI))).toFixed(3)})`;
        el.style.opacity = (window01(local, 0, 0.08) * (1 - window01(p, 0.92, 1))).toFixed(3);
      });
      if (bgWord.current) bgWord.current.style.transform = `translateY(${((0.5 - p) * 22).toFixed(2)}vh)`;
      void s;
      void rnd;
    },
  );

  return (
    <section id="fall" data-stage ref={ref} className="relative overflow-x-clip border-t border-seam/60">
      <div ref={bgWord} className="pointer-events-none absolute left-1/2 top-[6vh] -translate-x-1/2 select-none whitespace-nowrap" aria-hidden="true">
        <span className="font-display text-[24vw] leading-none" style={{ color: "transparent", WebkitTextStroke: "1px rgba(234,226,205,0.07)" }}>
          FALLING
        </span>
      </div>

      {/* debris rain */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {DEBRIS.map((d, i) => (
          <div
            key={i}
            ref={(el) => {
              itemEls.current[i] = el;
            }}
            className="absolute top-0 opacity-0 will-change-transform"
            style={{ left: `${d.x}%` }}
          >
            <svg width={d.size * 2.2} height={d.size * 2.2} viewBox={`${-d.size * 1.1} ${-d.size * 1.1} ${d.size * 2.2} ${d.size * 2.2}`} style={{ opacity: 0.35 + d.depth * 0.6, filter: d.depth < 0.25 ? "blur(1.5px)" : undefined }}>
              <DebrisSprite kind={d.kind} size={d.size} hue={d.hue} />
            </svg>
          </div>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-32 md:px-10">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <SectionHead kicker="STAGE VI · THE FALL" tone="verdi" lines={["GRAVITY FILES", "ITS OWN", "REPORT"]} />
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-parch/85">
                With the dial gone and the train unmeshed, ninety-six grams of horology renegotiate their
                relationship with the floor. Depth cues lie on purpose here: the far gears drift, the near
                shards plummet. The pendulum — still wound, still loyal — swings slower as it descends,
                measuring a time nobody asked for.
              </p>
              <div className="mt-10 flex justify-center lg:justify-start">
                <Pendulum pGet={pendGet} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div ref={headReveal}>
              <h3 className="rv mono-label mb-6 text-verdi">FIELD NOTES · DESCENT OBSERVATIONS</h3>
              <div className="space-y-4">
                {FALL_NOTES.map((n, i) => (
                  <p key={i} className="rv border-l-2 border-seam pl-5 text-[15px] leading-relaxed text-parch/85 transition-colors duration-300 hover:border-verdi hover:text-bone" style={{ "--rv-delay": `${i * 100}ms` } as React.CSSProperties}>
                    <span className="mono-read mr-3 text-verdi">{String(i + 1).padStart(2, "0")}</span>
                    {n}
                  </p>
                ))}
              </div>
            </div>

            <div ref={tableReveal} className="mt-16">
              <div className="rv mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-4xl tracking-[0.03em] text-bone">RECOVERY MANIFEST</h3>
                <span className="mono-label text-mute">47 PIECES · 12 PRIMARY SHARDS CATALOGUED</span>
              </div>
              <div className="rv overflow-x-auto border border-seam" style={{ "--rv-delay": "120ms" } as React.CSSProperties}>
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-seam bg-coal/80">
                      {["SHARD", "MASS", "VECTOR", "VELOCITY", "RECOVERY SITE"].map((h) => (
                        <th key={h} className="mono-label px-4 py-3 font-medium text-brass">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SHARD_MANIFEST.map((s, i) => (
                      <tr key={s.id} className={`row-invert border-b border-seam/60 ${i % 2 ? "bg-coal/40" : ""}`}>
                        <td className="mono-read px-4 py-2.5 text-[13px] font-bold text-brass-hi">{s.id}</td>
                        <td className="mono-read row-dim px-4 py-2.5 text-[13px] text-parch/85">{s.massG.toFixed(2)} g</td>
                        <td className="mono-read row-dim px-4 py-2.5 text-[13px] text-parch/85">{s.vector}</td>
                        <td className="mono-read row-dim px-4 py-2.5 text-[13px] text-parch/85">{s.velocity}</td>
                        <td className="px-4 py-2.5 text-[13px] text-mute">{s.site}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="rv mono-read mt-3 text-[12px] text-mute" style={{ "--rv-delay": "220ms" } as React.CSSProperties}>
                † {TOTAL_MASS_RECOVERED}
              </p>
            </div>

            <div ref={notesReveal} className="mt-16 grid gap-px border border-seam bg-seam sm:grid-cols-3">
              {FRACTURE_PHYSICS.slice(0, 3).map((f, i) => (
                <div key={f.term} className="rv bg-coal/70 p-5" style={{ "--rv-delay": `${i * 90}ms` } as React.CSSProperties}>
                  <div className="mono-label text-ember">{f.term}</div>
                  <div className="mono-read mt-2 text-2xl font-bold text-bone">{f.value}</div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-mute">{f.plain}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 border border-seam bg-panel/40 p-6">
              <h4 className="mono-label mb-3 text-mute">APPENDIX · LAST TELEMETRY BEFORE SILENCE</h4>
              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                {STRESS_LOG.slice(4).map((l) => (
                  <p key={l.t} className="mono-read text-[12px] text-parch/80">
                    <span className="text-mute">{l.t}</span> <span className="text-ember">[{l.channel}]</span> {l.msg}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
