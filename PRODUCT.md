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

- Matter.js-based pulley simulations with drag, touch, and keyboard interaction paths.
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
- Matter.js is only loaded when a simulation runtime mounts, keeping the main app bundle smaller.
- Shared app state uses Zustand with localStorage persistence.

## Project Conventions

- This is a content-heavy teaching app, not a generic component demo; new work should reinforce lesson flow and learner clarity.
- New lessons are scaffolded with `pnpm new-lesson <slug>`.
- Authoring guidance lives in `docs/AUTHORING.md`.
- Quality gates in regular use are `pnpm check`, `pnpm test:run`, and `npm run build`.
- Bundle inspection is available through `npm run build:analyze`.
