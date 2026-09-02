import { useEffect, useRef, useState } from "react";
import { useFrame, useReveal, formatCountdown, clamp01, hashString, mulberry32 } from "../lib/scroll";
import { STAGES, CASE_META } from "../data/clock";

/* ============================================================
   FIXED HUD — the instrumentation wrapped around the crime
   ============================================================ */

export function Hud() {
  const countdownRef = useRef<HTMLSpanElement>(null);
  const localRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const railRefs = useRef<(HTMLLIElement | null)[]>([]);

  useFrame((smoothed) => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const p = clamp01(smoothed / max);

    if (countdownRef.current) countdownRef.current.textContent = formatCountdown(p);
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

    const now = new Date();
    if (localRef.current)
      localRef.current.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    /* active stage by smoothed position */
    let active = 0;
    const anchors = document.querySelectorAll<HTMLElement>("[data-stage]");
    anchors.forEach((el, i) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.5) active = i;
    });
    if (stageRef.current && STAGES[active]) {
      const label = `${STAGES[active].roman} / ${STAGES[active].label}`;
      if (stageRef.current.textContent !== label) stageRef.current.textContent = label;
    }
    railRefs.current.forEach((li, i) => {
      if (!li) return;
      li.classList.toggle("rail-active", i === active);
      li.classList.toggle("rail-past", i < active);
    });
  });

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 border-b border-seam/60 bg-soot/70 px-4 py-3 backdrop-blur-sm md:px-8">
        <a href="#overture" className="group flex items-center gap-3" onClick={(e) => { e.preventDefault(); jumpTo("overture"); }}>
          <svg width="26" height="26" viewBox="0 0 32 32" className="shrink-0 transition-transform duration-700 group-hover:rotate-180" aria-hidden="true">
            <circle cx="16" cy="16" r="13" fill="none" stroke="#c9a24b" strokeWidth="2.4" />
            <line x1="16" y1="16" x2="16" y2="7.5" stroke="#eae2cd" strokeWidth="1.8" />
            <line x1="16" y1="16" x2="21.5" y2="18.5" stroke="#d95f2b" strokeWidth="1.8" />
            <line x1="7" y1="25" x2="25" y2="7" stroke="#d95f2b" strokeWidth="2.2" />
          </svg>
          <span className="font-display text-xl leading-none tracking-[0.18em] text-bone">
            HOROLOGICIDE
          </span>
          <span className="mono-label hidden text-mute sm:inline">{CASE_META.file}</span>
        </a>

        <div className="hidden items-center gap-3 md:flex">
          <span className="mono-label text-mute">STAGE</span>
          <span ref={stageRef} className="mono-read w-36 text-right text-[13px] font-semibold text-brass-hi">
            00 / OVERTURE
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="text-right">
            <div className="mono-label text-mute">LOCAL TIME</div>
            <span ref={localRef} className="mono-read text-[13px] text-bone">
              --:--:--
            </span>
          </div>
          <div className="text-right">
            <div className="mono-label text-ember">T− TIME REMAINING</div>
            <span ref={countdownRef} className="mono-read text-[13px] font-semibold text-ember">
              24:00:00:00
            </span>
          </div>
        </div>
      </header>

      {/* stage rail */}
      <nav className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block" aria-label="Stages of destruction">
        <ul className="space-y-4">
          {STAGES.map((s, i) => (
            <li key={s.id} ref={(el) => { railRefs.current[i] = el; }}>
              <button
                onClick={() => jumpTo(s.id)}
                className="group flex items-center gap-3 outline-none"
                aria-label={`Go to stage ${s.roman} — ${s.label}`}
              >
                <span className="rail-dot block h-[3px] w-6 bg-seam transition-all duration-500 group-hover:w-9 group-hover:bg-brass" />
                <span className="mono-label text-mute opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {s.roman} · {s.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <style>{`
          .rail-active .rail-dot { width: 2.25rem; background: #d95f2b; }
          .rail-past .rail-dot { background: #84642a; }
        `}</style>
      </nav>

      {/* bottom progress */}
      <div className="fixed inset-x-0 bottom-0 z-50 h-[3px] bg-seam/40">
        <div ref={barRef} className="h-full origin-left bg-gradient-to-r from-brass-lo via-brass to-ember" style={{ transform: "scaleX(0)" }} />
      </div>
    </>
  );
}

/* ============================================================
   SCRAMBLE-DECODE TEXT — titles reassemble from static
   ============================================================ */

const GLYPHS = "▮▯XVI·—/\\0123456789:KHz";

export function Scramble({
  text,
  className,
  speed = 28,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  speed?: number;
  as?: "span" | "h1" | "h2" | "h3" | "div" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || done.current) return;
          done.current = true;
          io.disconnect();
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.textContent = text;
            return;
          }
          const rnd = mulberry32(hashString(text));
          let frame = 0;
          const total = text.length;
          const iv = window.setInterval(() => {
            frame++;
            const settled = Math.floor((frame / (total + 14)) * total * 1.35);
            let out = "";
            for (let i = 0; i < total; i++) {
              const ch = text[i];
              if (ch === " " || i < settled) out += ch;
              else out += GLYPHS[Math.floor(rnd() * GLYPHS.length)];
            }
            el.textContent = out;
            if (settled >= total) {
              el.textContent = text;
              window.clearInterval(iv);
            }
          }, speed);
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, speed]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className} aria-label={text}>
      {text}
    </Tag>
  );
}

/* ============================================================
   SECTION HEADER — kicker + display title with line masks
   ============================================================ */

export function SectionHead({
  kicker,
  lines,
  tone = "brass",
  align = "left",
  className,
}: {
  kicker: string;
  lines: string[];
  tone?: "brass" | "ember" | "verdi";
  align?: "left" | "right";
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  const toneClass = tone === "ember" ? "text-ember" : tone === "verdi" ? "text-verdi" : "text-brass";
  return (
    <div ref={ref} className={className}>
      <p className={`mono-label mb-4 flex items-center gap-3 ${toneClass} ${align === "right" ? "justify-end" : ""}`}>
        <span className={`inline-block h-px w-10 ${tone === "ember" ? "bg-ember" : tone === "verdi" ? "bg-verdi" : "bg-brass"}`} />
        {kicker}
      </p>
      <h2 className={`font-display leading-[0.92] tracking-[0.02em] text-bone ${align === "right" ? "text-right" : ""}`}>
        {lines.map((l, i) => (
          <span key={i} className="mask-line" style={{ "--ml-delay": `${i * 120}ms` } as React.CSSProperties}>
            <span className="text-[clamp(2.8rem,7vw,6.5rem)]">{l}</span>
          </span>
        ))}
      </h2>
    </div>
  );
}

/* small mono stat block */
export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-seam bg-coal/60 px-4 py-3 transition-colors duration-300 hover:border-brass/60">
      <div className="mono-label text-mute">{label}</div>
      <div className="mono-read mt-1 text-lg font-semibold text-bone">{value}</div>
      {note && <div className="mt-0.5 text-[11px] text-mute">{note}</div>}
    </div>
  );
}

/* elapsed-since-T0 live counter */
export function ElapsedCounter({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const start = useRef(performance.now());
  useFrame(() => {
    if (!ref.current) return;
    const ms = performance.now() - start.current;
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    ref.current.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  });
  return <span ref={ref} className={`mono-read ${className ?? ""}`}>00:00.00</span>;
}
