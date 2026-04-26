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
 * 0/1 Knapsack - Bottom-Up (Tabulation)
 *
 * Builds a (items+1) × (capacity+1) DP table iteratively.
 * The bar visualization shows the current row of the DP table,
 * where each bar represents dp[i][w] for the current item i.
 */
export async function knapsackBottomUp(
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

  // Initialize DP table
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  )

  // Initial state
  onStep({
    array: [...dp[0]],
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Initialize DP table: ${n} items, capacity ${capacity}. Weights: [${weights.join(', ')}], Values: [${values.join(', ')}].`,
    stepType: 'copy',
    activeRange: [0, capacity],
  })

  await waitForControl(speed, control, 'copy')

  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    const itemWeight = weights[i - 1]
    const itemValue = values[i - 1]

    for (let w = 0; w <= capacity; w++) {
      comparisons++
      operations++

      // Step 1: Check if current item can fit
      onStep({
        array: [...dp[i]],
        comparing: [w],
        swapped: false,
        operations,
        comparisons,
        note: `Item ${i} (wt=${itemWeight}, val=${itemValue}): Can it fit in capacity ${w}? ${itemWeight <= w ? 'Yes' : 'No'}.`,
        stepType: 'compare',
        activeRange: [0, capacity],
      })

      await waitForControl(speed, control, 'compare')

      if (itemWeight <= w) {
        // Item can fit — decide include vs exclude
        const includeValue = itemValue + dp[i - 1][w - itemWeight]
        const excludeValue = dp[i - 1][w]
        operations += 2

        dp[i][w] = Math.max(includeValue, excludeValue)

        const decision = includeValue >= excludeValue ? 'Include' : 'Exclude'

        // Show the include/exclude decision
        onStep({
          array: [...dp[i]],
          comparing: [w],
          swapped: true,
          operations,
          comparisons,
          note: `${decision} item ${i}: include=${itemValue}+dp[${i - 1}][${w - itemWeight}]=${includeValue}, exclude=dp[${i - 1}][${w}]=${excludeValue} → dp[${i}][${w}] = ${dp[i][w]}.`,
          stepType: 'swap',
          writeIndex: w,
          activeRange: [0, capacity],
        })

        await waitForControl(speed, control, 'swap')
      } else {
        // Item can't fit — carry forward
        dp[i][w] = dp[i - 1][w]
        operations++

        onStep({
          array: [...dp[i]],
          comparing: [w],
          swapped: true,
          operations,
          comparisons,
          note: `Item ${i} too heavy (wt=${itemWeight} > capacity=${w}) → dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i][w]}.`,
          stepType: 'write',
          writeIndex: w,
          activeRange: [0, capacity],
        })

        await waitForControl(speed, control, 'write')
      }
    }
  }

  const maxValue = dp[n][capacity]

  // Final result step
  onStep({
    array: [...dp[n]],
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Knapsack complete. Maximum achievable value = ${maxValue}.`,
    stepType: 'done',
  })

  return { result: maxValue, comparisons, operations }
}
