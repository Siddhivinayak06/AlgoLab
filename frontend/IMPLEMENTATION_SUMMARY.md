# Implementation Summary

## Frontend Stack
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Axios

## High-Level Architecture

### App Layer
- Route pages are under `app/`.
- Visualizer entry point: `app/visualizer/page.tsx`.

### Component Layer
- Main visualizer logic: `components/algorithm-visualizer.tsx`.
- Dataset generation UI: `components/dataset-generator.tsx`.
- Shared UI components: `components/ui/*`.

### Logic Layer
- Sorting implementations and step callbacks: `lib/algorithms.ts`.
- Experiment persistence helpers: `lib/experiment-tracker.ts`.
- API client layer: `lib/api.ts`.

## Visualizer Flow

1. DatasetGenerator emits dataset + metadata.
2. AlgorithmVisualizer initializes run state.
3. Selected sort algorithm streams `SortStep` updates.
4. UI updates bars, explanation, and metrics per step.
5. Completed runs are saved as experiments.

## Current UX Structure

- Responsive two-column layout:
  - Left: controls and learning context.
  - Right: sticky visualization and progress.
- Collapsible beginner guide.
- Compact dataset generator.
- Timeline-aware step forward/backward controls.
- Bottom algorithm complexity information.

## Performance and Reliability Notes

- Step behavior is controlled by pause/stop-aware execution loops.
- Progress in history mode is frame-based for accurate 0 to 100 progression.
- Build and type checks are validated through `npm run build`.

## Repository Notes

- Primary documentation entry: `README.md`.
- This file, `FEATURES.md`, and `USAGE_GUIDE.md` provide focused reference material.
