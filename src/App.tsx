import { Hud } from "./components/HUD";
import { GearField } from "./components/parts";
import { Overture, Anatomy, Stress } from "./components/sectionsA";
import { Chamber, Fall } from "./components/sectionsB";
import { Entropy, Epilogue } from "./components/sectionsC";

/* ============================================================
   HOROLOGICIDE — the destruction of a clock in seven stages
   A scroll-coupled forensic demolition. Everything below the
   fixed instrumentation is evidence.
   ============================================================ */

export default function App() {
  return (
    <div className="ambient-base relative min-h-screen overflow-x-clip">
      {/* ---------- fixed ambient layers ---------- */}
      <div className="blueprint-grid pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60" aria-hidden="true">
        <GearField />
      </div>
      <div className="vignette pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />

      <Hud />

      {/* ---------- the case file ---------- */}
      <main className="relative z-10">
        <Overture />
        <Anatomy />
        <Stress />
        <Chamber />
        <Fall />
        <Entropy />
        <Epilogue />
      </main>
    </div>
  );
}
