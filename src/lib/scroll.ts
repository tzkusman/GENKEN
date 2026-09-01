import { useEffect, useRef, useState } from "react";

/* ============================================================
   SCROLL ENGINE
   A single requestAnimationFrame loop feeds every animated
   element on the page with a smoothed (lerped) scroll value,
   so parallax layers lag behind the wheel like real mass.
   ============================================================ */

export type FrameFn = (smoothed: number, raw: number, dt: number) => void;

const listeners = new Set<FrameFn>();

let smoothed = typeof window !== "undefined" ? window.scrollY : 0;
let raw = smoothed;
let lastT = 0;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function loop(t: number) {
  const dt = Math.min(64, t - lastT || 16);
  lastT = t;
  raw = window.scrollY;
  if (prefersReducedMotion()) {
    smoothed = raw;
  } else {
    // frame-rate independent exponential approach
    const k = 1 - Math.pow(0.0022, dt / 1000);
    smoothed += (raw - smoothed) * k;
    if (Math.abs(raw - smoothed) < 0.08) smoothed = raw;
  }
  listeners.forEach((fn) => {
    try {
      fn(smoothed, raw, dt);
    } catch (err) {
      console.error(err);
    }
  });
  requestAnimationFrame(loop);
}

if (typeof window !== "undefined") {
  requestAnimationFrame((t) => {
    lastT = t;
    requestAnimationFrame(loop);
  });
}

/** Subscribe to the frame loop. */
export function useFrame(fn: FrameFn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const cb: FrameFn = (s, r, d) => ref.current(s, r, d);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
}

/* ============================================================
   PROGRESS MEASUREMENT
   ============================================================ */

export interface Measure {
  top: number;
  height: number;
  vh: number;
}

export function measure(el: HTMLElement): Measure {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { top, height: el.offsetHeight, vh: window.innerHeight };
}

/** progress 0..1 across full traversal (enters bottom → exits top) */
export function traversalProgress(m: Measure, smoothedScroll: number): number {
  return clamp((smoothedScroll + m.vh - m.top) / (m.height + m.vh), 0, 1);
}

/** progress 0..1 while a sticky child is pinned (container taller than viewport) */
export function stickyProgress(m: Measure, smoothedScroll: number): number {
  const span = Math.max(1, m.height - m.vh);
  return clamp((smoothedScroll - m.top) / span, 0, 1);
}

/** progress 0..1 while element crosses the middle band of the viewport */
export function crossProgress(m: Measure, smoothedScroll: number): number {
  return clamp((smoothedScroll + m.vh * 0.85 - m.top) / (m.height + m.vh * 0.7), 0, 1);
}

/** Subscribe + measure + callback with progress every frame (imperative, no re-render) */
export function useElementProgress<T extends HTMLElement>(
  calc: (m: Measure, s: number) => number,
  fn: (p: number, s: number) => void,
) {
  const ref = useRef<T>(null);
  const measureRef = useRef<Measure | null>(null);
  const calcRef = useRef(calc);
  const fnRef = useRef(fn);
  calcRef.current = calc;
  fnRef.current = fn;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const recompute = () => {
      measureRef.current = measure(el);
    };
    recompute();
    window.addEventListener("resize", recompute);
    const cb: FrameFn = (s) => {
      if (!measureRef.current) measureRef.current = measure(el);
      const p = calcRef.current(measureRef.current, s);
      fnRef.current(p, s);
    };
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("resize", recompute);
    };
  }, []);

  return ref;
}

/** State variant — re-renders when the *band* changes (cheap, bucketed). */
export function useProgressBand<T extends HTMLElement>(
  calc: (m: Measure, s: number) => number,
  buckets: number,
): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [band, setBand] = useState(0);
  const measureRef = useRef<Measure | null>(null);
  const calcRef = useRef(calc);
  calcRef.current = calc;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const recompute = () => {
      measureRef.current = measure(el);
    };
    recompute();
    window.addEventListener("resize", recompute);
    const cb: FrameFn = (s) => {
      if (!measureRef.current) measureRef.current = measure(el);
      const p = calcRef.current(measureRef.current, s);
      const b = Math.round(p * buckets) / buckets;
      setBand((prev) => (prev === b ? prev : b));
    };
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("resize", recompute);
    };
  }, [buckets]);

  return [ref, band];
}

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */

export function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>(".rv, .mask-line"));
    if (el.classList.contains("rv") || el.classList.contains("mask-line")) targets.push(el);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("on");
            io.unobserve(e.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/* ============================================================
   MATH / RANDOM UTILITIES
   ============================================================ */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const clamp01 = clamp;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};
/** map p from [a,b] to [0,1] clamped */
export const window01 = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);

/** deterministic PRNG so the shatter is identical on every load */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const pad2 = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");

export function formatCountdown(totalProgress: number): string {
  const totalMs = (1 - clamp01(totalProgress)) * 24 * 3600 * 1000;
  const ms = Math.max(0, totalMs);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}:${pad2(cs)}`;
}
