import { useEffect, useRef } from "react";
import ClockFace from "./ClockFace";
import { Scramble, SectionHead, ElapsedCounter } from "./HUD";
import { DustMotes } from "./parts";
import { useReveal, useElementProgress, useFrame, traversalProgress, window01, prefersReducedMotion, mulberry32 } from "../lib/scroll";
import { ENTROPY_FRAGMENTS, COLOPHON, CASE_META } from "../data/clock";

/* ============================================================
   VII · ENTROPY — the room after. Dust, drift, unmeasured time.
   ============================================================ */

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  tw: number;
  hue: string;
}

interface Glyph {
  x: number;
  y: number;
  rot: number;
  vr: number;
  size: number;
  ch: string;
  a: number;
}

function EntropyCanvas({ get }: { get: () => number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getRef = useRef(get);
  getRef.current = get;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let motes: Mote[] = [];
    let glyphs: Glyph[] = [];
    const reduced = prefersReducedMotion();
    const ROMAN = ["XII", "I", "II", "III", "IIII", "V", "VI", "IX", "∞", ":", "·"];
    const HUES = ["236,207,125", "234,226,205", "217,95,43", "143,136,122"];

    const seed = () => {
      const rnd = mulberry32(1207);
      const count = Math.min(220, Math.floor((w * h) / 9000));
      motes = Array.from({ length: count }).map(() => ({
        x: rnd() * w,
        y: rnd() * h,
        vx: (rnd() - 0.5) * 0.22,
        vy: -0.05 - rnd() * 0.2,
        r: 0.6 + rnd() * 2.2,
        a: 0.15 + rnd() * 0.5,
        tw: rnd() * Math.PI * 2,
        hue: HUES[Math.floor(rnd() * HUES.length)],
      }));
      glyphs = Array.from({ length: 14 }).map(() => ({
        x: rnd() * w,
        y: rnd() * h,
        rot: (rnd() - 0.5) * 1.4,
        vr: (rnd() - 0.5) * 0.004,
        size: 14 + rnd() * 40,
        ch: ROMAN[Math.floor(rnd() * ROMAN.length)],
        a: 0.05 + rnd() * 0.1,
      }));
    };

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = Math.max(300, rect?.width ?? window.innerWidth);
      h = Math.max(300, rect?.height ?? window.innerHeight);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let raf = 0;
    const draw = () => {
      const p = getRef.current();
      ctx.clearRect(0, 0, w, h);
      canvas.style.opacity = (window01(p, 0.05, 0.3) * 0.95 + 0.05).toFixed(3);
      const t = performance.now() / 1000;

      for (const g of glyphs) {
        if (!reduced) {
          g.rot += g.vr;
          g.y -= 0.06;
          if (g.y < -60) g.y = h + 60;
        }
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.rot);
        ctx.font = `${g.size}px 'Bebas Neue', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(201,162,75,${(g.a * (0.6 + 0.4 * Math.sin(t * 0.7 + g.x))).toFixed(3)})`;
        ctx.fillText(g.ch, 0, 0);
        ctx.restore();
      }

      for (const m of motes) {
        if (!reduced) {
          m.x += m.vx + Math.sin(t * 0.6 + m.tw) * 0.06;
          m.y += m.vy;
          if (m.y < -10) {
            m.y = h + 10;
            m.x = Math.random() * w;
          }
          if (m.x < -10) m.x = w + 10;
          if (m.x > w + 10) m.x = -10;
        }
        const twinkle = 0.65 + 0.35 * Math.sin(t * 1.8 + m.tw);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.hue},${(m.a * twinkle).toFixed(3)})`;
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />;
}

export function Entropy() {
  const eP = useRef(0);
  const fragEls = useRef<(HTMLParagraphElement | null)[]>([]);
  const bigWord = useRef<HTMLDivElement>(null);

  const ref = useElementProgress<HTMLElement>(
    (m, s) => traversalProgress(m, s),
    (p, s) => {
      eP.current = p;
      const vh = window.innerHeight;
      fragEls.current.forEach((el, i) => {
        if (!el) return;
        const speed = (i % 2 === 0 ? 1 : -1) * (0.12 + (i % 3) * 0.08);
        el.style.transform = `translateY(${((0.5 - p) * speed * vh).toFixed(1)}px)`;
      });
      if (bigWord.current) bigWord.current.style.transform = `translateX(${((0.5 - p) * -18).toFixed(2)}vw)`;
      void s;
    },
  );

  const reveal = useReveal<HTMLDivElement>();

  return (
    <section id="entropy" data-stage ref={ref} className="relative overflow-hidden border-t border-seam/60 bg-soot">
      <EntropyCanvas get={() => eP.current} />
      <div ref={bigWord} className="pointer-events-none absolute left-1/2 top-[38vh] -translate-x-1/2 select-none whitespace-nowrap" aria-hidden="true">
        <span className="font-display text-[26vw] leading-none" style={{ color: "transparent", WebkitTextStroke: "1px rgba(125,154,134,0.1)" }}>
          ENTROPY
        </span>
      </div>

      {/* drifting fragments */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        {ENTROPY_FRAGMENTS.map((f, i) => (
          <p
            key={i}
            ref={(el) => {
              fragEls.current[i] = el;
            }}
            className="mono-read absolute max-w-[26ch] text-[12px] leading-relaxed text-mute/80"
            style={{
              left: `${8 + ((i * 37) % 78)}%`,
              top: `${12 + ((i * 53) % 70)}%`,
            }}
          >
            ◦ {f}
          </p>
        ))}
      </div>

      <div className="relative mx-auto flex min-h-[170vh] max-w-5xl flex-col justify-center px-6 md:px-10">
        <div ref={reveal} className="py-32 text-center">
          <p className="rv mono-label mb-8 text-verdi">STAGE VII · ENTROPY · t = UNDEFINED</p>
          <div className="rv mono-read glitch-flicker text-[clamp(3rem,12vw,9rem)] font-bold leading-none text-bone" style={{ "--rv-delay": "100ms" } as React.CSSProperties}>
            88:88:88
          </div>
          <Scramble as="h2" text="TIME IS NOW UNMEASURED" className="mt-6 block font-display text-[clamp(2rem,5vw,4.2rem)] tracking-[0.06em] text-brass-hi" speed={34} />
          <p className="rv mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-parch/85" style={{ "--rv-delay": "220ms" } as React.CSSProperties}>
            The room has returned to the statistical average of rooms. Roman numerals drift past at the speed
            of convection currents. Nothing is late anymore, exactly.
          </p>
          <div className="rv mx-auto mt-10 flex w-fit items-center gap-4 border border-seam bg-coal/70 px-6 py-4" style={{ "--rv-delay": "320ms" } as React.CSSProperties}>
            <span className="mono-label text-mute">ELAPSED SINCE T-0</span>
            <ElapsedCounter className="text-2xl font-bold text-ember" />
            <span className="mono-label text-mute">AND COUNTING — THE ONLY CLOCK LEFT IS YOU</span>
          </div>
        </div>
      </div>
      <DustMotes count={10} />
    </section>
  );
}

/* ============================================================
   ∞ · EPILOGUE — rewind, colophon, case closed
   ============================================================ */

const ZERO = { stress: 0, fracture: 0, shatter: 0 };

function LiveRestored() {
  const ref = useRef<HTMLSpanElement>(null);
  useFrame(() => {
    if (!ref.current) return;
    const n = new Date();
    ref.current.textContent = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}:${String(n.getSeconds()).padStart(2, "0")}`;
  });
  return <span ref={ref} className="mono-read text-2xl font-bold text-verdi">--:--:--</span>;
}

export function Epilogue() {
  const reveal = useReveal<HTMLDivElement>();
  const colophon = useReveal<HTMLDivElement>();

  return (
    <section id="epilogue" data-stage className="relative border-t border-seam/60 bg-coal/40">
      <div className="mx-auto max-w-6xl px-6 py-32 md:px-10">
        <div ref={reveal} className="grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead
              kicker="STAGE ∞ · EPILOGUE"
              tone="verdi"
              lines={["EVERY FRACTURE", "ON THIS PAGE", "RUNS BACKWARDS"]}
            />
            <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-parch/90">
              <p className="rv">
                This demolition is scroll-reversible. Climb back up and the enamel re-fuses, the cracks
                un-draw themselves into the dark, the second hand remembers its arc, and the crown politely
                returns the extra turns. Entropy, in Case File 1707-A, is a two-way street — but the toll is
                paid in thumb muscle.
              </p>
              <p className="rv" style={{ "--rv-delay": "120ms" } as React.CSSProperties}>
                The Meridian itself is beyond repair. Its mainspring is a question it no longer wants to
                answer; its jewels are scattered across a rug, a bookshelf, a cat. But the laboratory keeps a
                second clock on the bench — fully wound, acutely aware, running your local time right now.
              </p>
            </div>
            <div className="rv mt-10 flex flex-wrap items-center gap-6" style={{ "--rv-delay": "240ms" } as React.CSSProperties}>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}
                className="btn-brass font-display border border-brass px-10 py-4 text-3xl tracking-[0.14em] text-brass-hi"
              >
                ↺ REWIND THE CASE
              </button>
              <div>
                <div className="mono-label text-mute">LOCAL TIME, RESTORED</div>
                <LiveRestored />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rv relative mx-auto w-56" style={{ "--rv-delay": "200ms" } as React.CSSProperties}>
              <div className="pulse-ring absolute inset-0 rounded-full border border-verdi/30" />
              <ClockFace get={() => ZERO} className="h-auto w-full opacity-95 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
              <p className="mono-label mt-3 text-center text-mute">EXHIBIT B — VERY AWARE</p>
            </div>
            <div className="rv mx-auto mt-8 w-fit px-6 py-3 stamp text-3xl" style={{ "--rv-delay": "340ms" } as React.CSSProperties}>
              CASE CLOSED · TOTAL LOSS
            </div>
          </div>
        </div>

        {/* colophon */}
        <div ref={colophon} className="mt-28 border-t border-seam pt-12">
          <h3 className="rv mono-label mb-8 text-brass">COLOPHON · AUTOPSY PAPERWORK</h3>
          <div className="grid gap-px border border-seam bg-seam sm:grid-cols-2 lg:grid-cols-4">
            {COLOPHON.map((c, i) => (
              <div key={c.k} className="rv bg-coal/70 px-5 py-4" style={{ "--rv-delay": `${(i % 4) * 80}ms` } as React.CSSProperties}>
                <div className="mono-label text-mute">{c.k}</div>
                <div className="mt-2 text-[13px] leading-relaxed text-parch/90">{c.v}</div>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-16 flex flex-col items-center gap-4 border-t border-seam pt-8 text-center">
          <p className="mono-label text-mute">
            {CASE_META.file} · {CASE_META.exhibit} · RECOVERED {CASE_META.date} · {CASE_META.coordinates}
          </p>
          <p className="text-[13px] text-mute">
            Built with one requestAnimationFrame loop and zero mercy. No clocks were harmed in the making of
            this page — <span className="text-brass-hi">this one arrived condemned.</span>
          </p>
          <p className="mono-read text-[11px] text-faint">HOROLOGICIDE v1.707 · the escapement could not escape</p>
        </footer>
      </div>
    </section>
  );
}
