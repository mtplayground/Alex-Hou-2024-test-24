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
- Fixed-pulley scenes now use a wrapped two-sided rope model instead of a fake arc polyline.
- Rope visuals are rendered as smooth overlay strokes rather than visible physics dots/constraints.
- Simulation canvases support invisible world bounds and optional follow-camera behavior to keep loads on-screen.
- Reusable teaching widgets:
  - `Quiz`
  - `NumericAnswer`
  - `DragMatch`
  - `ForceMeter`
  - `MechanicalAdvantage`
  - `CompareSimulations`
  - `AdvancedOnly`
- Optional sound effects gated by both environment config and user preference.
- Responsive layouts for desktop, tablet, and mobile.
- Accessibility pass covering focus treatment, ARIA labeling, reduced motion support, and non-pointer simulation alternatives.

## Architecture Decisions

- Lessons are authored in `src/lessons/<slug>/` with separate metadata, section definitions, and MDX content.
- The lesson registry auto-discovers lessons and drives navigation, cards, and lazy loading.
- Lesson pages are code-split so each lesson loads on demand.
- Pulley interactions are deterministic and bounded inside responsive SVGs rather than a physics engine.
- The shared pulley helper layer owns rope construction, pulley attachment, rope overlay metadata, and attached-load setup.
- Simulation rendering is split into Matter world rendering plus overlay passes for rope and force annotations.
- Shared app state uses Zustand with localStorage persistence.

## Project Conventions

- This is a content-heavy teaching app, not a generic component demo; new work should reinforce lesson flow and learner clarity.
- New lessons are scaffolded with `pnpm new-lesson <slug>`.
- Authoring guidance lives in `docs/AUTHORING.md`.
- Quality gates in regular use are `pnpm check`, `pnpm test:run`, and `npm run build`.
- The fixed-engine lesson scenes have headless Vitest regression coverage for viewport containment and rope-to-pulley contact.
- Bundle inspection is available through `npm run build:analyze`.
