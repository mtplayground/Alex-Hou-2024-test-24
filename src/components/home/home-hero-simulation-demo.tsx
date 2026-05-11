import PulleyDiagram from "@/components/pulley/pulley-diagram";

function HomeHeroSimulationDemo() {
  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
            Interactive preview
          </p>
          <h2 className="mt-2 font-display text-2xl text-white">
            Pull down, load rises
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
          SVG diagram
        </div>
      </div>

      <PulleyDiagram
        className="border-white/10 bg-white/5 shadow-none"
        loadWeight={160}
        maxPullDistance={170}
        pulleyCount={1}
        type="fixed"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-200">
          <p className="font-semibold text-white">See the motion</p>
          <p className="mt-1 leading-6 text-slate-300">
            Drag the handle and watch the rope path change instantly inside a
            bounded SVG view.
          </p>
        </div>
        <div className="rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-200">
          <p className="font-semibold text-white">Build intuition</p>
          <p className="mt-1 leading-6 text-slate-300">
            The diagram makes the direction change obvious before the lessons
            introduce formulas.
          </p>
        </div>
        <div className="rounded-2xl bg-white/8 px-4 py-3 text-sm text-slate-200">
          <p className="font-semibold text-white">Jump into lessons</p>
          <p className="mt-1 leading-6 text-slate-300">
            Use the lesson registry below to move from this preview into the
            structured lesson sequence.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomeHeroSimulationDemo;
