import type { SortStep, SortExecutionControl } from '../../algorithms'
import { speedToDelayMs, SortAbortedError } from '../../algorithms'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForControl(
  speed: number,
  control?: SortExecutionControl,
  stepType?: SortStep['stepType']
) {
  let elapsed = 0

  while (true) {
    const liveSpeed = control?.getSpeed?.() ?? speed
    const delay = speedToDelayMs(liveSpeed, stepType)

    if (elapsed >= delay) {
      break
    }

    while (control?.shouldPause?.()) {
      if (control?.shouldStop?.()) {
        throw new SortAbortedError()
      }

      await sleep(20)
    }

    if (control?.shouldStop?.()) {
      throw new SortAbortedError()
    }

    const slice = Math.min(16, delay - elapsed)
    await sleep(slice)
    elapsed += slice
  }

  while (control?.shouldPause?.()) {
    if (control?.shouldStop?.()) {
      throw new SortAbortedError()
    }

    await sleep(20)
  }

  if (control?.shouldStop?.()) {
    throw new SortAbortedError()
  }
}

/**
 * 0/1 Knapsack - Top-Down (Memoization)
 *
 * Uses recursion with a memo table to solve the knapsack problem.
 * The bar visualization shows the memo table row for the current item,
 * where each bar represents memo[i][w].
 */
export async function knapsackTopDown(
  weights: number[],
  values: number[],
  capacity: number,
  onStep: (step: SortStep) => void,
  speed: number = 50,
  control?: SortExecutionControl
): Promise<{ result: number; comparisons: number; operations: number }> {
  const n = weights.length
  let comparisons = 0
  let operations = 0

  // Initialize memo table with -1 (uncomputed)
  const memo: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(-1)
  )

  // Display array: shows a flattened view of the memo table's current state
  // We use the last row being computed to drive bars
  function getMemoRow(item: number): number[] {
    return memo[item].map((v) => (v === -1 ? 0 : v))
  }

  // Initial state
  onStep({
    array: new Array(capacity + 1).fill(0),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Initialize memo table: ${n} items, capacity ${capacity}. Weights: [${weights.join(', ')}], Values: [${values.join(', ')}]. Using top-down recursion.`,
    stepType: 'copy',
    activeRange: [0, capacity],
  })

  await waitForControl(speed, control, 'copy')

  async function solve(i: number, w: number): Promise<number> {
    // Base case
    if (i === 0 || w === 0) {
      memo[i][w] = 0
      return 0
    }

    // Check memo table
    if (memo[i][w] !== -1) {
      comparisons++
      operations++

      onStep({
        array: getMemoRow(i),
        comparing: [w],
        swapped: false,
        operations,
        comparisons,
        note: `Memo hit! f(${i}, ${w}) already computed = ${memo[i][w]}. Skipping recursion.`,
        stepType: 'copy',
        activeRange: [0, capacity],
      })

      await waitForControl(speed, control, 'copy')

      return memo[i][w]
    }

    const itemWeight = weights[i - 1]
    const itemValue = values[i - 1]

    comparisons++
    operations++

    // Show recursive call
    onStep({
      array: getMemoRow(i),
      comparing: [w],
      swapped: false,
      operations,
      comparisons,
      note: `Recursive call: f(${i}, ${w}) — Item ${i} (wt=${itemWeight}, val=${itemValue}), remaining capacity=${w}.`,
      stepType: 'compare',
      activeRange: [0, capacity],
    })

    await waitForControl(speed, control, 'compare')

    let result: number

    if (itemWeight > w) {
      // Item too heavy — exclude
      operations++

      result = await solve(i - 1, w)

      onStep({
        array: getMemoRow(i),
        comparing: [w],
        swapped: true,
        operations,
        comparisons,
        note: `Item ${i} too heavy (wt=${itemWeight} > cap=${w}) → f(${i}, ${w}) = f(${i - 1}, ${w}) = ${result}.`,
        stepType: 'write',
        writeIndex: w,
        activeRange: [0, capacity],
      })

      await waitForControl(speed, control, 'write')
    } else {
      // Can include or exclude
      const excludeResult = await solve(i - 1, w)
      const includeResult = itemValue + await solve(i - 1, w - itemWeight)
      operations += 2

      result = Math.max(includeResult, excludeResult)
      const decision = includeResult >= excludeResult ? 'Include' : 'Exclude'

      onStep({
        array: getMemoRow(i),
        comparing: [w],
        swapped: true,
        operations,
        comparisons,
        note: `${decision} item ${i}: include=${itemValue}+f(${i - 1},${w - itemWeight})=${includeResult}, exclude=f(${i - 1},${w})=${excludeResult} → f(${i},${w}) = ${result}.`,
        stepType: 'swap',
        writeIndex: w,
        activeRange: [0, capacity],
      })

      await waitForControl(speed, control, 'swap')
    }

    // Store in memo
    memo[i][w] = result
    operations++

    onStep({
      array: getMemoRow(i),
      comparing: [w],
      swapped: true,
      operations,
      comparisons,
      note: `Store memo[${i}][${w}] = ${result}.`,
      stepType: 'write',
      writeIndex: w,
      activeRange: [0, capacity],
    })

    await waitForControl(speed, control, 'write')

    return result
  }

  const maxValue = await solve(n, capacity)

  // Final result step
  onStep({
    array: getMemoRow(n),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Knapsack (Top-Down) complete. Maximum achievable value = ${maxValue}.`,
    stepType: 'done',
  })

  return { result: maxValue, comparisons, operations }
}
