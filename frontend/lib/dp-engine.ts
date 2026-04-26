/**
 * DP Visualizer Engine
 * Produces grid-based DPStep objects for the DP table visualizer.
 */

export interface DPStep {
  table: number[][]
  currentCell: [number, number] | null
  dependencyCells: [number, number][]
  completedCells: [number, number][]
  stepType: 'init' | 'compare' | 'write' | 'cache-hit' | 'done'
  note: string
  comparisons: number
  operations: number
  cacheHits: number
  rowHeaders: string[]
  colHeaders: string[]
  /** Indices of characters being compared: [strA index (0-based), strB index (0-based)] */
  charIndices?: [number, number]
  /** LCS backtrack path cells highlighted on the done step */
  backtrackPath?: [number, number][]
}

export type DPAlgorithm = 'lcs' | 'knapsack-bottom-up' | 'knapsack-top-down'

export interface DPResult {
  steps: DPStep[]
  answer: number
}

function deepCopyTable(t: number[][]): number[][] {
  return t.map(r => [...r])
}

// ─── LCS ────────────────────────────────────────────────────────────────

export function runLCS(strA: string, strB: string): DPResult {
  const m = strA.length
  const n = strB.length
  const steps: DPStep[] = []
  const table: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const completed: [number, number][] = []
  let comparisons = 0
  let operations = 0

  const rowHeaders = ['""', ...strA.split('')]
  const colHeaders = ['""', ...strB.split('')]

  // Init step
  steps.push({
    table: deepCopyTable(table),
    currentCell: null,
    dependencyCells: [],
    completedCells: [...completed],
    stepType: 'init',
    note: `Initialized ${m + 1}×${n + 1} DP table with zeros. Rows = "${strA}", Cols = "${strB}".`,
    comparisons, operations, cacheHits: 0,
    rowHeaders, colHeaders,
  })

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      comparisons++

      if (strA[i - 1] === strB[j - 1]) {
        const deps: [number, number][] = [[i - 1, j - 1]]

        steps.push({
          table: deepCopyTable(table),
          currentCell: [i, j],
          dependencyCells: deps,
          completedCells: [...completed],
          stepType: 'compare',
          note: `Characters match: "${strA[i - 1]}" == "${strB[j - 1]}" → dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] (${table[i - 1][j - 1]})`,
          comparisons, operations, cacheHits: 0,
          rowHeaders, colHeaders,
          charIndices: [i - 1, j - 1],
        })

        table[i][j] = 1 + table[i - 1][j - 1]
        operations++
      } else {
        const deps: [number, number][] = [[i - 1, j], [i, j - 1]]

        steps.push({
          table: deepCopyTable(table),
          currentCell: [i, j],
          dependencyCells: deps,
          completedCells: [...completed],
          stepType: 'compare',
          note: `No match: "${strA[i - 1]}" ≠ "${strB[j - 1]}" → dp[${i}][${j}] = max(dp[${i - 1}][${j}]=${table[i - 1][j]}, dp[${i}][${j - 1}]=${table[i][j - 1]})`,
          comparisons, operations, cacheHits: 0,
          rowHeaders, colHeaders,
          charIndices: [i - 1, j - 1],
        })

        table[i][j] = Math.max(table[i - 1][j], table[i][j - 1])
        operations++
      }

      // Write step
      completed.push([i, j])
      steps.push({
        table: deepCopyTable(table),
        currentCell: [i, j],
        dependencyCells: [],
        completedCells: [...completed],
        stepType: 'write',
        note: `Set dp[${i}][${j}] = ${table[i][j]}`,
        comparisons, operations, cacheHits: 0,
        rowHeaders, colHeaders,
      })
    }
  }

  // Compute backtracking path
  const backtrackPath: [number, number][] = []
  let bi = m, bj = n
  while (bi > 0 && bj > 0) {
    backtrackPath.push([bi, bj])
    if (strA[bi - 1] === strB[bj - 1]) {
      bi--; bj--
    } else if (table[bi - 1][bj] >= table[bi][bj - 1]) {
      bi--
    } else {
      bj--
    }
  }
  backtrackPath.reverse()

  // Build the actual LCS string
  let lcsStr = ''
  let pi = 0, pj = 0
  for (const [pr, pc] of backtrackPath) {
    if (pr > pi && pc > pj && strA[pr - 1] === strB[pc - 1]) {
      lcsStr += strA[pr - 1]
    }
    pi = pr; pj = pc
  }

  steps.push({
    table: deepCopyTable(table),
    currentCell: null,
    dependencyCells: [],
    completedCells: [...completed],
    stepType: 'done',
    note: `LCS complete! Length = ${table[m][n]}. Subsequence: "${lcsStr}". Backtrack path highlighted.`,
    comparisons, operations, cacheHits: 0,
    rowHeaders, colHeaders,
    backtrackPath,
  })

  return { steps, answer: table[m][n] }
}

// ─── Knapsack Bottom-Up ─────────────────────────────────────────────────

export function runKnapsackBottomUp(
  weights: number[],
  values: number[],
  capacity: number,
): DPResult {
  const n = weights.length
  const steps: DPStep[] = []
  const table: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))
  const completed: [number, number][] = []
  let comparisons = 0
  let operations = 0

  const rowHeaders = ['0', ...weights.map((w, i) => `w${w}/v${values[i]}`)]
  const colHeaders = Array.from({ length: capacity + 1 }, (_, i) => `${i}`)

  steps.push({
    table: deepCopyTable(table),
    currentCell: null,
    dependencyCells: [],
    completedCells: [...completed],
    stepType: 'init',
    note: `Initialized ${n + 1}×${capacity + 1} DP table. Items: ${n}, Capacity: ${capacity}.`,
    comparisons, operations, cacheHits: 0,
    rowHeaders, colHeaders,
  })

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      comparisons++
      const wi = weights[i - 1]
      const vi = values[i - 1]

      if (wi > w) {
        const deps: [number, number][] = [[i - 1, w]]
        steps.push({
          table: deepCopyTable(table),
          currentCell: [i, w],
          dependencyCells: deps,
          completedCells: [...completed],
          stepType: 'compare',
          note: `Item ${i} weight(${wi}) > capacity(${w}) → skip. dp[${i}][${w}] = dp[${i - 1}][${w}] = ${table[i - 1][w]}`,
          comparisons, operations, cacheHits: 0,
          rowHeaders, colHeaders,
        })
        table[i][w] = table[i - 1][w]
      } else {
        const excl = table[i - 1][w]
        const incl = vi + table[i - 1][w - wi]
        const deps: [number, number][] = [[i - 1, w], [i - 1, w - wi]]

        steps.push({
          table: deepCopyTable(table),
          currentCell: [i, w],
          dependencyCells: deps,
          completedCells: [...completed],
          stepType: 'compare',
          note: `Item ${i} (w=${wi}, v=${vi}) fits. exclude=${excl}, include=${vi}+dp[${i - 1}][${w - wi}]=${incl} → max=${Math.max(excl, incl)}`,
          comparisons, operations, cacheHits: 0,
          rowHeaders, colHeaders,
        })
        table[i][w] = Math.max(excl, incl)
      }

      operations++
      completed.push([i, w])

      steps.push({
        table: deepCopyTable(table),
        currentCell: [i, w],
        dependencyCells: [],
        completedCells: [...completed],
        stepType: 'write',
        note: `Set dp[${i}][${w}] = ${table[i][w]}`,
        comparisons, operations, cacheHits: 0,
        rowHeaders, colHeaders,
      })
    }
  }

  steps.push({
    table: deepCopyTable(table),
    currentCell: null,
    dependencyCells: [],
    completedCells: [...completed],
    stepType: 'done',
    note: `Knapsack complete! Maximum value achievable = ${table[n][capacity]}.`,
    comparisons, operations, cacheHits: 0,
    rowHeaders, colHeaders,
  })

  return { steps, answer: table[n][capacity] }
}

// ─── Knapsack Top-Down ──────────────────────────────────────────────────

export function runKnapsackTopDown(
  weights: number[],
  values: number[],
  capacity: number,
): DPResult {
  const n = weights.length
  const steps: DPStep[] = []
  const table: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(-1))
  const completed: [number, number][] = []
  let comparisons = 0
  let operations = 0
  let cacheHits = 0

  // Base cases
  for (let w = 0; w <= capacity; w++) {
    table[0][w] = 0
    completed.push([0, w])
  }

  const rowHeaders = ['0', ...weights.map((w, i) => `w${w}/v${values[i]}`)]
  const colHeaders = Array.from({ length: capacity + 1 }, (_, i) => `${i}`)

  steps.push({
    table: deepCopyTable(table),
    currentCell: null,
    dependencyCells: [],
    completedCells: [...completed],
    stepType: 'init',
    note: `Initialized memo table (−1 = uncomputed). Base row set to 0. Starting recursive solve(${n}, ${capacity}).`,
    comparisons, operations, cacheHits,
    rowHeaders, colHeaders,
  })

  function solve(i: number, w: number): number {
    if (i === 0 || w === 0) return 0

    if (table[i][w] !== -1) {
      cacheHits++
      steps.push({
        table: deepCopyTable(table),
        currentCell: [i, w],
        dependencyCells: [],
        completedCells: [...completed],
        stepType: 'cache-hit',
        note: `Cache hit! memo[${i}][${w}] = ${table[i][w]} already computed.`,
        comparisons, operations, cacheHits,
        rowHeaders, colHeaders,
      })
      return table[i][w]
    }

    comparisons++
    const wi = weights[i - 1]
    const vi = values[i - 1]

    if (wi > w) {
      const deps: [number, number][] = [[i - 1, w]]
      steps.push({
        table: deepCopyTable(table),
        currentCell: [i, w],
        dependencyCells: deps,
        completedCells: [...completed],
        stepType: 'compare',
        note: `solve(${i}, ${w}): Item weight(${wi}) > capacity(${w}) → recurse solve(${i - 1}, ${w})`,
        comparisons, operations, cacheHits,
        rowHeaders, colHeaders,
      })

      const result = solve(i - 1, w)
      table[i][w] = result
    } else {
      steps.push({
        table: deepCopyTable(table),
        currentCell: [i, w],
        dependencyCells: [[i - 1, w], [i - 1, w - wi]],
        completedCells: [...completed],
        stepType: 'compare',
        note: `solve(${i}, ${w}): Item (w=${wi}, v=${vi}) fits → max(solve(${i - 1},${w}), ${vi}+solve(${i - 1},${w - wi}))`,
        comparisons, operations, cacheHits,
        rowHeaders, colHeaders,
      })

      const excl = solve(i - 1, w)
      const incl = vi + solve(i - 1, w - wi)
      table[i][w] = Math.max(excl, incl)
    }

    operations++
    completed.push([i, w])

    steps.push({
      table: deepCopyTable(table),
      currentCell: [i, w],
      dependencyCells: [],
      completedCells: [...completed],
      stepType: 'write',
      note: `Memoize: memo[${i}][${w}] = ${table[i][w]}`,
      comparisons, operations, cacheHits,
      rowHeaders, colHeaders,
    })

    return table[i][w]
  }

  const answer = solve(n, capacity)

  steps.push({
    table: deepCopyTable(table),
    currentCell: null,
    dependencyCells: [],
    completedCells: [...completed],
    stepType: 'done',
    note: `Top-down complete! Maximum value = ${answer}. Cache hits: ${cacheHits}.`,
    comparisons, operations, cacheHits,
    rowHeaders, colHeaders,
  })

  return { steps, answer }
}

// ─── Algorithm Info ─────────────────────────────────────────────────────

export interface DPAlgorithmInfo {
  name: string
  description: string
  worstCase: string
  spaceComplexity: string
  recurrence: string[]
}

export const DP_INFO: Record<DPAlgorithm, DPAlgorithmInfo> = {
  lcs: {
    name: 'Longest Common Subsequence',
    description: 'Finds the longest subsequence common to two strings by building a 2D DP table row-by-row.',
    worstCase: 'O(m × n)',
    spaceComplexity: 'O(m × n)',
    recurrence: [
      'if A[i] == B[j]:',
      '  dp[i][j] = 1 + dp[i-1][j-1]',
      'else:',
      '  dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
    ],
  },
  'knapsack-bottom-up': {
    name: '0/1 Knapsack (Bottom-Up)',
    description: 'Fills a DP table iteratively, deciding for each item and capacity whether including the item yields a higher value.',
    worstCase: 'O(n × W)',
    spaceComplexity: 'O(n × W)',
    recurrence: [
      'if weight[i] > w:',
      '  dp[i][w] = dp[i-1][w]',
      'else:',
      '  dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-weight[i]])',
    ],
  },
  'knapsack-top-down': {
    name: '0/1 Knapsack (Top-Down)',
    description: 'Uses recursion with memoization to solve only the sub-problems actually needed, caching results.',
    worstCase: 'O(n × W)',
    spaceComplexity: 'O(n × W)',
    recurrence: [
      'solve(i, w):',
      '  if memo[i][w] != -1: return memo[i][w]',
      '  if weight[i] > w: memo[i][w] = solve(i-1, w)',
      '  else: memo[i][w] = max(solve(i-1,w), val[i]+solve(i-1,w-weight[i]))',
    ],
  },
}
