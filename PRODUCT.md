# Pulley Playground

Pulley Playground is a browser-based learning app for teaching pulley mechanics through interactive lessons, simulations, and lightweight assessments. It is a single-page React application built for classroom, tablet, and self-paced use.

## What It Does

- Teaches core pulley concepts through five shipped lessons:
  - What Is a Pulley?
  - Fixed Pulley
  - Movable Pulley
  - Block & Tackle
  - Pulleys in Real Life
- Combines MDX lesson content with live simulations, quizzes, numeric checks, and drag-to-match activities.
- Tracks learner progress locally, including lesson progress, quiz/widget completion, Advanced Mode, and sound preferences.
- Supports presentation mode for teacher-led use with larger typography and keyboard section navigation.

## Current Feature Set

- SVG-based pulley diagrams with direct drag interaction and derived force/mechanical-advantage readouts.
- Pulley motion is driven by deterministic geometry and ratio math rather than a runtime physics engine.
- Rope paths are generated per pulley type, with tangent-aligned fixed and compound layouts plus an offset S-shape movable layout instead of generic shortest-path wrapping.
- Lessons 1–5 all use the shared `PulleyDiagram` model for fixed, movable, and compound pulley scenarios.
- Reusable teaching widgets:
  - `Quiz`
  - `NumericAnswer`
  - `DragMatch`
  - `ForceMeter`
  - `MechanicalAdvantage`
  - `AdvancedOnly`
- Optional sound effects gated by both environment config and user preference.
- Responsive layouts for desktop, tablet, and mobile.
- Accessibility pass covering focus treatment, ARIA labeling, reduced motion support, and keyboard/pointer alternatives for interactive diagrams.

## Architecture Decisions

- Lessons are authored in `src/lessons/<slug>/` with separate metadata, section definitions, and MDX content.
- The lesson registry auto-discovers lessons and drives navigation, cards, and lazy loading.
- Lesson pages are code-split so each lesson loads on demand.
- Pulley interactions are deterministic and bounded inside responsive SVGs rather than a physics engine.
- Shared pulley logic lives in pure geometry helpers plus a local React state hook (`usePulleyState`) that derives pull distance, load distance, and mechanical advantage.
- Rope geometry is explicit by type: fixed, movable, and compound diagrams each generate their own SVG path from anchored tangents, including a two-wheel offset S-shape for the movable rig instead of relying on a generic arc chooser.
- Readout widgets can consume pulley state through React context, while still supporting explicit props where needed.
- Shared app state uses Zustand with localStorage persistence.

## Project Conventions

- This is a content-heavy teaching app, not a generic component demo; new work should reinforce lesson flow and learner clarity.
- New lessons are scaffolded with `pnpm new-lesson <slug>`.
- Authoring guidance lives in `docs/AUTHORING.md`.
- Quality gates in regular use are `pnpm check`, `pnpm test:run`, and `npm run build`.
- Pulley geometry and ratio behavior have direct Vitest coverage for tangent math, arc sweeps, per-type rope path generation, movable offset/strand invariants, circle-contact correctness, and `usePulleyState` ratios.
- Bundle inspection is available through `npm run build:analyze`.
