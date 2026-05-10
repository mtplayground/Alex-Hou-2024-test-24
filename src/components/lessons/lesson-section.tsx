import type { ReactNode } from "react";

type LessonSectionProps = {
  children: ReactNode;
  id: string;
  title: string;
};

function LessonSection({ children, id, title }: LessonSectionProps) {
  return (
    <section
      id={id}
      data-lesson-section="true"
      className="scroll-mt-28 space-y-4 rounded-[1.75rem] border border-white/70 bg-white/85 p-6 shadow-sm"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
          Section
        </p>
        <h2 className="font-display text-3xl text-slate-900">{title}</h2>
      </div>
      <div className="space-y-4 text-base leading-7 text-slate-700">
        {children}
      </div>
    </section>
  );
}

export default LessonSection;
