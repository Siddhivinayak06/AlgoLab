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
 * Longest Common Subsequence (LCS) - Dynamic Programming
 *
 * Builds a (m+1) × (n+1) DP table and fills it row by row.
 * The bar visualization shows the current row of the DP table,
 * where each bar represents dp[i][j] for the current row i.
 */
export async function lcs(
  string1: string,
  string2: string,
  onStep: (step: SortStep) => void,
  speed: number = 50,
  control?: SortExecutionControl
): Promise<{ result: number; comparisons: number; operations: number }> {
  const m = string1.length
  const n = string2.length
  let comparisons = 0
  let operations = 0

  // Initialize DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  // Initial state - show empty row
  onStep({
    array: [...dp[0]],
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Initialize DP table of size ${m + 1} × ${n + 1}. Strings: "${string1}" and "${string2}".`,
    stepType: 'copy',
    activeRange: [0, n],
  })

  await waitForControl(speed, control, 'copy')

  // Fill the DP table row by row
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      comparisons++
      operations++

      const char1 = string1[i - 1]
      const char2 = string2[j - 1]

      // Step 1: Compare characters
      onStep({
        array: [...dp[i]],
        comparing: [j],
        swapped: false,
        operations,
        comparisons,
        note: `Compare "${char1}" (str1[${i - 1}]) with "${char2}" (str2[${j - 1}]).`,
        stepType: 'compare',
        activeRange: [0, n],
      })

      await waitForControl(speed, control, 'compare')

      if (char1 === char2) {
        // Characters match
        dp[i][j] = dp[i - 1][j - 1] + 1
        operations++

        onStep({
          array: [...dp[i]],
          comparing: [j],
          swapped: true,
          operations,
          comparisons,
          note: `Match! "${char1}" = "${char2}" → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`,
          stepType: 'write',
          writeIndex: j,
          activeRange: [0, n],
        })
      } else {
        // Characters don't match
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        operations++

        const fromAbove = dp[i - 1][j]
        const fromLeft = dp[i][j - 1]

        onStep({
          array: [...dp[i]],
          comparing: [j],
          swapped: true,
          operations,
          comparisons,
          note: `No match: "${char1}" ≠ "${char2}" → dp[${i}][${j}] = max(dp[${i - 1}][${j}]=${fromAbove}, dp[${i}][${j - 1}]=${fromLeft}) = ${dp[i][j]}.`,
          stepType: 'write',
          writeIndex: j,
          activeRange: [0, n],
        })
      }

      await waitForControl(speed, control, 'write')
    }
  }

  const lcsLength = dp[m][n]

  // Final result step
  onStep({
    array: [...dp[m]],
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `LCS complete. Length of longest common subsequence = ${lcsLength}.`,
    stepType: 'done',
  })

  return { result: lcsLength, comparisons, operations }
}
