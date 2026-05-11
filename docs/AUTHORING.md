# Authoring Lessons

This project ships with a lesson scaffold command and an MDX-based lesson
pipeline. Use this guide when you want to add a new lesson or revise an
existing one.

## Quick Start

1. Create the lesson scaffold:

```bash
pnpm new-lesson <slug>
```

Example:

```bash
pnpm new-lesson ideal-mechanical-advantage
```

2. The scaffold creates:

```text
src/lessons/<slug>/
  lesson.mdx
  meta.ts
  simulations/
    index.ts
```

3. Update `meta.ts` with real lesson metadata.
4. Replace the placeholder content in `lesson.mdx`.
5. Run checks before opening a PR:

```bash
pnpm check
pnpm test:run
npm run build
```

## Lesson Files

### `src/lessons/<slug>/meta.ts`

Each lesson must export a `LessonMeta` object. The registry discovers these
files automatically with `import.meta.glob`.

Required fields:

- `slug`: Must match the folder name exactly.
- `title`: Student-facing lesson title.
- `description`: Short summary used in cards and navigation.
- `order`: Numeric lesson order in the sequence.

Common optional fields:

- `durationMinutes`: Approximate lesson length.
- `illustration`: Emoji or short visual marker for lesson cards.
- `tags`: Lesson keywords.
- `prerequisites`: Array of lesson slugs that must come first.
- `advancedAvailable`: Set to `true` when the lesson includes advanced-mode
  content.

### `src/lessons/<slug>/lesson.mdx`

This is the lesson body. It is loaded automatically by the lesson registry and
rendered on `/lessons/:slug`.

Each lesson should export `lessonSections` near the top of the file:

```mdx
export const lessonSections = [
  { id: "intro", title: "Introduction" },
  { id: "activity", title: "Activity" },
  { id: "check", title: "Check" },
];
```

The section IDs should match the `id` props you pass to `<LessonSection />`.
This powers:

- the section progress bar
- presentation-mode navigation
- lesson page scroll tracking

### `src/lessons/<slug>/simulations/index.ts`

The scaffold creates this file as a place to keep lesson-specific simulation
helpers or configuration. It is not auto-registered today, but it is the
intended home for custom scene builders and related lesson-only simulation
logic.

## Available MDX Components

The lesson page injects a shared component map from
[`src/components/lessons/lesson-mdx-components.tsx`](/workspace/src/components/lessons/lesson-mdx-components.tsx).
These components can be used directly inside `lesson.mdx`.

### Structure

- `<LessonSection id="..." title="...">...</LessonSection>`
  Wraps a lesson block with consistent layout and anchors it for progress
  tracking.

- `<AdvancedOnly>...</AdvancedOnly>`
  Shows content only when Advanced Mode is enabled.

### Checks For Understanding

- `<Quiz />`
  Multiple-choice question with stored progress and explanation reveal.

  Key props:
  - `quizId`
  - `prompt`
  - `options`
  - `correctOptionId`
  - `explanation`
  - optional `title`

- `<NumericAnswer />`
  Numeric-response widget with tolerance and worked solution reveal.

  Key props:
  - `widgetId`
  - `prompt`
  - `correctValue`
  - `tolerance`
  - `unit`
  - `workedSolution`
  - optional `title`

- `<DragMatch />`
  Drag-to-match interaction for categorization or example sorting.

  Key props:
  - `widgetId`
  - `instructions`
  - `items`
  - `targets`
  - optional `title`

### Simulation And Readout Blocks

- `<PulleyDemo />`
  General-purpose pulley preview with optional readouts.

- `<ForceMeter value={...} />`
  Animated force readout.

- `<MechanicalAdvantage value={...} />`
  Animated mechanical-advantage badge.

### Lesson-Specific Blocks Already In The Repo

These are useful references when building a new lesson with similar mechanics:

- `<BucketLiftWidget />`
- `<FixedPulleySandbox />`
- `<MovablePulleySandbox />`
- `<MovablePulleyCompare />`
- `<BlockAndTackleBuilder />`
- `<RealLifeGallery />`

If your new lesson needs one of these exact experiences, reuse it. If it needs
different behavior, create a new lesson-specific component instead of forcing a
poor fit.

## Pulley Diagram Helpers

The shared lesson interaction layer is now SVG-based and deterministic.

Core files:

- [`src/components/pulley/pulley-diagram.tsx`](/workspace/src/components/pulley/pulley-diagram.tsx)
- [`src/components/pulley/pulley-context.tsx`](/workspace/src/components/pulley/pulley-context.tsx)
- [`src/lib/pulley/pulleyGeometry.ts`](/workspace/src/lib/pulley/pulleyGeometry.ts)
- [`src/lib/pulley/use-pulley-state.ts`](/workspace/src/lib/pulley/use-pulley-state.ts)

### `PulleyDiagram`

Use `PulleyDiagram` when a lesson needs an interactive pulley model. It:

- renders a bounded responsive SVG
- supports direct drag interaction on the rope handle
- derives load travel from `pullDistance / mechanicalAdvantage`
- exposes force and mechanical-advantage values through React context
- can show labels and force arrows without any physics runtime

### Geometry And State Helpers

`src/lib/pulley/pulleyGeometry.ts` exposes the shared drawing helpers:

- `tangentPoints(...)`
- `arcSweep(...)`
- `ropePath(...)` / `renderRopePath(...)`

`src/lib/pulley/use-pulley-state.ts` exposes `usePulleyState(config)` for the
derived pulley math.

These helpers are the default choice for new pulley lessons. Reuse them first;
only add new primitives when the shared ones cannot represent the behavior you
need.

## Recommended Authoring Workflow

1. Scaffold the lesson with `pnpm new-lesson <slug>`.
2. Fill in `meta.ts` completely.
3. Define `lessonSections` in `lesson.mdx`.
4. Draft the narrative with `<LessonSection />` blocks first.
5. Add checks:
   - `Quiz` for concept checks
   - `NumericAnswer` for calculation checks
   - `DragMatch` for classification or example matching
6. Add simulations only where they clarify the idea better than static text.
7. Gate deeper math or engineering detail behind `<AdvancedOnly>`.
8. Run formatting, checks, tests, and production build.

## Content Guidelines

### Tone

- Write like a teacher speaking clearly to students.
- Prefer direct sentences over clever phrasing.
- Explain what to notice before asking students to infer it.
- Keep the lesson encouraging, but not overly chatty.

### Reading Level

- Target roughly upper elementary to middle school readability.
- Define specialized words the first time they appear.
- Keep paragraphs short.
- Break multi-step reasoning into ordered or clearly separated chunks.

### Structure

- Open with the physical idea, not the formula.
- Use one main concept per section.
- Put the interactive moment close to the explanation it supports.
- End with a check that matches the section goal.

### Advanced Mode

- Use advanced content for formulas, idealizations, or tradeoff language.
- Do not hide the core lesson behind Advanced Mode.
- Advanced content should enrich the same concept, not introduce a separate
  prerequisite.

### Simulation Design

- Make the student action obvious.
- Prefer one clear manipulation per widget.
- Keep visual noise low.
- Use readouts only when the number helps interpretation.

## Example MDX Skeleton

```mdx
export const lessonSections = [
  { id: "big-idea", title: "Big Idea" },
  { id: "try-it", title: "Try It" },
  { id: "check", title: "Check" },
];

# Example Lesson

<LessonSection id="big-idea" title="Big Idea">
  <p>Introduce the concept in plain language.</p>
  <AdvancedOnly>
    <p>Add the more technical version here.</p>
  </AdvancedOnly>
</LessonSection>

<LessonSection id="try-it" title="Try It">
  <PulleyDemo />
</LessonSection>

<LessonSection id="check" title="Check">
  <Quiz
    quizId="example-lesson-check"
    title="Quick Check"
    prompt="What should the student notice?"
    correctOptionId="b"
    explanation="Explain why option B is correct."
    options={[
      { id: "a", label: "A", text: "Distractor answer" },
      { id: "b", label: "B", text: "Correct answer" },
      { id: "c", label: "C", text: "Distractor answer" },
    ]}
  />
</LessonSection>
```

## Verification Checklist

Before opening a PR for a new lesson:

- `meta.ts` slug matches the folder name
- `order` and `prerequisites` are correct
- `lessonSections` IDs match the `<LessonSection />` blocks
- widget IDs are unique
- Advanced Mode content is optional, not required
- the lesson renders at `/lessons/<slug>`
- `pnpm check` passes
- `pnpm test:run` passes
- `npm run build` passes
