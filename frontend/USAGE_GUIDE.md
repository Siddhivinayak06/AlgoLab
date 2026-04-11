# Usage Guide

## 1. Start the Frontend

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open:

- http://localhost:3000

## 2. Use the Sorting Visualizer

1. Open the Visualizer page from navigation.
2. Generate a dataset (or enter custom values).
3. Select an algorithm.
4. Adjust speed.
5. Click Start.

## 3. Understand Controls

- Start: Run from the current dataset state.
- Pause: Pause active run.
- Resume: Continue paused run.
- Step Forward: Move exactly one recorded step.
- Step Backward: Move exactly one recorded step back.
- Reset: Restore the initial dataset and clear run state.

## 4. Read the Visualization

- Blue: Normal element
- Yellow: Comparing
- Red: Swapping
- Green: Sorted

Progress and metrics update in real time during execution.

## 5. Dataset Tips

- Use Nearly Sorted to observe best-case behavior differences.
- Use Reverse Sorted to stress algorithms with weaker worst-case performance.
- Use Few Unique to inspect behavior with duplicate-heavy data.

## 6. Troubleshooting

### Controls seem disabled
- Generate a dataset first.
- Ensure a run is active for Pause/Resume behavior.

### Step controls are not changing frame
- Pause first, then use Step Forward or Step Backward.
- If no timeline exists yet, start a run to record steps.

### Build check

```bash
npm run build
```

If build succeeds, the app is production-ready.
