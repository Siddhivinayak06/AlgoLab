export interface Edge {
  u: number
  v: number
  weight: number
}

export interface NQueensData {
  board: number[][] // 1 for queen, 0 for empty
  currentRow: number
  currentCol: number
  queens: { row: number; col: number }[]
  conflicts: { row: number; col: number }[]
  attackedCells: { row: number; col: number }[] // All cells threatened by placed queens
  isBacktracking: boolean
  solutionCount: number
}

export interface TreeNode {
  id: string
  label: string
  level: number
  included: boolean
  sum: number
  isCurrent: boolean
  isSolution: boolean
}

export interface SumOfSubsetsData {
  items: number[]
  target: number
  treeNodes: TreeNode[]
  currentNodeId: string | null
  includedItems: number[]
  excludedIndices: number[] // Track which items have been excluded
  currentSum: number
  remainingSum: number
  validSubsets: number[][]
}

export interface GraphColoringData {
  nodes: number[]
  edges: Edge[]
  colors: number[] // Color index assigned to each node, -1 if unassigned
  maxColors: number
  currentNode: number
  triedColors: number[]
  conflictEdges: { u: number; v: number }[] // Edges causing color conflicts
  isBacktracking: boolean
  solutionsFound: number
}

export interface TSPData {
  cities: number[]
  edges: Edge[]
  currentPath: number[]
  bestPath: number[]
  currentCost: number
  bestCost: number
  isBacktracking: boolean
  prunedBranches: number
}

export interface BacktrackingStep {
  type: 'n-queens' | 'sum-of-subsets' | 'graph-coloring' | 'tsp'
  stepType: 'init' | 'forward' | 'backtrack' | 'solution' | 'done'
  note: string
  comparisons: number
  operations: number
  statesExplored: number
  memoryUsage: number
  activeLine?: number
  data: NQueensData | SumOfSubsetsData | GraphColoringData | TSPData
}

export interface BacktrackingAlgorithmInfo {
  name: string
  description: string
  worstCase: string
  spaceComplexity: string
}

export const BACKTRACKING_INFO: Record<string, BacktrackingAlgorithmInfo> = {
  'n-queens': {
    name: "N-Queens Problem",
    description: "Places N chess queens on an N×N chessboard so that no two queens threaten each other.",
    worstCase: "O(N!)",
    spaceComplexity: "O(N)",
  },
  'sum-of-subsets': {
    name: "Sum of Subsets",
    description: "Finds all subsets of a given set of positive integers whose sum is equal to a given target.",
    worstCase: "O(2^N)",
    spaceComplexity: "O(N)",
  },
  'graph-coloring': {
    name: "M-Coloring Problem",
    description: "Assigns colors to certain elements of a graph subject to certain constraints, typically that no two adjacent vertices share the same color.",
    worstCase: "O(M^V)",
    spaceComplexity: "O(V)",
  },
  tsp: {
    name: "Traveling Salesman Problem (Backtracking)",
    description: "Finds the shortest possible route that visits every city exactly once and returns to the origin city.",
    worstCase: "O(N!)",
    spaceComplexity: "O(N)",
  },
}

// ─── N-Queens ───────────────────────────────────────────────────────
function computeAttackedCells(queens: { row: number; col: number }[], n: number): { row: number; col: number }[] {
  const set = new Set<string>()
  for (const q of queens) {
    for (let i = 0; i < n; i++) {
      // Row & column
      set.add(`${q.row}-${i}`)
      set.add(`${i}-${q.col}`)
      // Diagonals
      const d1r = q.row + i, d1c = q.col + i
      const d2r = q.row + i, d2c = q.col - i
      const d3r = q.row - i, d3c = q.col + i
      const d4r = q.row - i, d4c = q.col - i
      if (d1r < n && d1c < n) set.add(`${d1r}-${d1c}`)
      if (d2r < n && d2c >= 0) set.add(`${d2r}-${d2c}`)
      if (d3r >= 0 && d3c < n) set.add(`${d3r}-${d3c}`)
      if (d4r >= 0 && d4c >= 0) set.add(`${d4r}-${d4c}`)
    }
  }
  // Remove queen positions themselves
  for (const q of queens) {
    set.delete(`${q.row}-${q.col}`)
  }
  return Array.from(set).map(s => { const [r, c] = s.split('-').map(Number); return { row: r, col: c } })
}

export function runNQueens(n: number): { steps: BacktrackingStep[]; answer: { row: number; col: number }[][] } {
  const steps: BacktrackingStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const board: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const queens: { row: number; col: number }[] = []
  const solutions: { row: number; col: number }[][] = []

  const createStep = (stepType: BacktrackingStep['stepType'], note: string, currentRow: number, currentCol: number, conflicts: { row: number; col: number }[], isBacktracking: boolean, activeLine?: number): BacktrackingStep => {
    return {
      type: 'n-queens',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: n * n * 4,
      activeLine,
      data: {
        board: board.map(r => [...r]),
        currentRow, currentCol,
        queens: [...queens],
        conflicts,
        attackedCells: computeAttackedCells(queens, n),
        isBacktracking,
        solutionCount: solutions.length,
      }
    }
  }

  steps.push(createStep('init', `Initialized empty ${n}×${n} chessboard. Goal: place ${n} non-attacking queens.`, 0, 0, [], false, 0))

  const isSafe = (row: number, col: number): { safe: boolean; conflicts: { row: number; col: number }[] } => {
    const conflicts: { row: number; col: number }[] = []
    
    for (let i = 0; i < row; i++) {
      comparisons++
      operations++
      if (board[i][col] === 1) conflicts.push({ row: i, col })
      
      const leftDiagCol = col - (row - i)
      if (leftDiagCol >= 0 && board[i][leftDiagCol] === 1) conflicts.push({ row: i, col: leftDiagCol })
      
      const rightDiagCol = col + (row - i)
      if (rightDiagCol < n && board[i][rightDiagCol] === 1) conflicts.push({ row: i, col: rightDiagCol })
    }
    
    return { safe: conflicts.length === 0, conflicts }
  }

  const solve = (row: number) => {
    if (row === n) {
      solutions.push([...queens])
      const positions = queens.map(q => `(${q.row},${q.col})`).join(', ')
      steps.push(createStep('solution', `✓ Found solution #${solutions.length}! Queens at: ${positions}`, row, 0, [], false, 5))
      return
    }

    for (let col = 0; col < n; col++) {
      statesExplored++
      steps.push(createStep('forward', `Row ${row}: Testing column ${col} — checking safety against ${queens.length} placed queen${queens.length !== 1 ? 's' : ''}.`, row, col, [], false, 1))
      
      const { safe, conflicts } = isSafe(row, col)
      
      if (safe) {
        board[row][col] = 1
        queens.push({ row, col })
        operations += 2
        
        steps.push(createStep('forward', `✓ Safe! Placed queen #${queens.length} at (${row}, ${col}). Moving to row ${row + 1}.`, row, col, [], false, 3))
        solve(row + 1)
        
        // Backtrack
        board[row][col] = 0
        queens.pop()
        operations += 2
        steps.push(createStep('backtrack', `↩ Backtrack: Removed queen from (${row}, ${col}). Trying next column.`, row, col, [], true, 6))
      } else {
        const conflictDesc = conflicts.map(c => `(${c.row},${c.col})`).join(', ')
        steps.push(createStep('backtrack', `✗ Conflict at (${row}, ${col})! Attacked by queen${conflicts.length > 1 ? 's' : ''} at ${conflictDesc}.`, row, col, conflicts, true, 2))
      }
    }
  }

  solve(0)
  steps.push(createStep('done', `Exploration complete. Found ${solutions.length} valid arrangement${solutions.length !== 1 ? 's' : ''} for the ${n}×${n} board.`, 0, 0, [], false, 7))

  return { steps, answer: solutions }
}

// ─── Sum of Subsets ─────────────────────────────────────────────────
export function runSumOfSubsets(items: number[], target: number): { steps: BacktrackingStep[]; answer: number[][] } {
  const steps: BacktrackingStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const validSubsets: number[][] = []
  const currentSubset: number[] = []
  const excludedIndices: number[] = []
  const treeNodes: TreeNode[] = []
  
  // Sort items to optimize backtracking (optional but good practice)
  const sortedItems = [...items].sort((a, b) => a - b)
  const totalSum = sortedItems.reduce((a, b) => a + b, 0)

  const createStep = (stepType: BacktrackingStep['stepType'], note: string, currentNodeId: string, currentSum: number, remainingSum: number, activeLine?: number): BacktrackingStep => {
    // Clone treeNodes and mark current
    const nodes = treeNodes.map(n => ({ ...n, isCurrent: n.id === currentNodeId }))
    
    return {
      type: 'sum-of-subsets',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: items.length * 8 + treeNodes.length * 16,
      activeLine,
      data: {
        items: sortedItems,
        target,
        treeNodes: nodes,
        currentNodeId,
        includedItems: [...currentSubset],
        excludedIndices: [...excludedIndices],
        currentSum,
        remainingSum,
        validSubsets: validSubsets.map(s => [...s])
      }
    }
  }

  const rootId = 'root'
  treeNodes.push({ id: rootId, label: 'Start', level: 0, included: false, sum: 0, isCurrent: true, isSolution: false })
  steps.push(createStep('init', `Items: [${sortedItems.join(', ')}]. Target sum: ${target}. Total available: ${totalSum}.`, rootId, 0, totalSum, 0))

  const solve = (idx: number, currentSum: number, remainingSum: number, parentId: string) => {
    statesExplored++
    comparisons++
    
    if (currentSum === target) {
      validSubsets.push([...currentSubset])
      const node = treeNodes.find(n => n.id === parentId)
      if (node) node.isSolution = true
      steps.push(createStep('solution', `✓ Found subset #${validSubsets.length}: [${currentSubset.join(', ')}] = ${target}`, parentId, currentSum, remainingSum, 3))
      return
    }

    if (idx >= sortedItems.length) {
      steps.push(createStep('backtrack', `↩ Reached end of items. Sum ${currentSum} ≠ target ${target}. Backtracking.`, parentId, currentSum, remainingSum, 5))
      return
    }

    if (currentSum > target) {
      steps.push(createStep('backtrack', `✗ Pruned: current sum ${currentSum} exceeds target ${target}.`, parentId, currentSum, remainingSum, 4))
      return
    }

    if (currentSum + remainingSum < target) {
      steps.push(createStep('backtrack', `✗ Pruned: even including all remaining items (sum ${currentSum} + ${remainingSum} = ${currentSum + remainingSum}) can't reach target ${target}.`, parentId, currentSum, remainingSum, 4))
      return
    }

    const item = sortedItems[idx]

    // Include item
    const includeId = `${parentId}-L`
    treeNodes.push({ id: includeId, label: `+${item}`, level: idx + 1, included: true, sum: currentSum + item, isCurrent: true, isSolution: false })
    
    currentSubset.push(item)
    operations++
    steps.push(createStep('forward', `Include item ${item} (index ${idx}). Running sum: ${currentSum} + ${item} = ${currentSum + item}. Remaining: ${remainingSum - item}.`, includeId, currentSum + item, remainingSum - item, 1))
    
    solve(idx + 1, currentSum + item, remainingSum - item, includeId)
    
    // Backtrack and Exclude item
    currentSubset.pop()
    excludedIndices.push(idx)
    operations++
    
    const excludeId = `${parentId}-R`
    treeNodes.push({ id: excludeId, label: `-${item}`, level: idx + 1, included: false, sum: currentSum, isCurrent: true, isSolution: false })
    
    steps.push(createStep('forward', `Exclude item ${item} (index ${idx}). Sum stays at ${currentSum}. Exploring without it.`, excludeId, currentSum, remainingSum - item, 2))
    
    solve(idx + 1, currentSum, remainingSum - item, excludeId)
    excludedIndices.pop()
  }

  solve(0, 0, totalSum, rootId)
  steps.push(createStep('done', `Exploration complete. Found ${validSubsets.length} valid subset${validSubsets.length !== 1 ? 's' : ''} summing to ${target}.`, rootId, 0, 0, 6))

  return { steps, answer: validSubsets }
}

// ─── Graph Coloring ─────────────────────────────────────────────────
export function runGraphColoring(nodes: number, edges: Edge[], maxColors: number): { steps: BacktrackingStep[]; answer: number[] | null } {
  const steps: BacktrackingStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0
  let solutionsFound = 0

  const adj: number[][] = Array.from({ length: nodes }, () => [])
  edges.forEach(e => {
    adj[e.u].push(e.v)
    adj[e.v].push(e.u) // Undirected
  })

  const colors: number[] = Array(nodes).fill(-1)
  let solution: number[] | null = null

  const createStep = (stepType: BacktrackingStep['stepType'], note: string, currentNode: number, triedColors: number[], conflictEdges: { u: number; v: number }[], isBacktracking: boolean, activeLine?: number): BacktrackingStep => {
    return {
      type: 'graph-coloring',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: nodes * 4,
      activeLine,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => i),
        edges,
        colors: [...colors],
        maxColors,
        currentNode,
        triedColors,
        conflictEdges,
        isBacktracking,
        solutionsFound,
      }
    }
  }

  const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Cyan', 'Pink']

  steps.push(createStep('init', `Graph has ${nodes} nodes and ${edges.length} edges. Attempting coloring with ${maxColors} color${maxColors !== 1 ? 's' : ''}.`, 0, [], [], false, 0))

  const isSafe = (u: number, c: number): { safe: boolean; conflictEdges: { u: number; v: number }[] } => {
    const conflicts: { u: number; v: number }[] = []
    for (const v of adj[u]) {
      comparisons++
      if (colors[v] === c) conflicts.push({ u, v })
    }
    return { safe: conflicts.length === 0, conflictEdges: conflicts }
  }

  const solve = (u: number): boolean => {
    if (u === nodes) {
      solution = [...colors]
      solutionsFound++
      const assignment = colors.map((c, i) => `Node ${i}→${COLOR_NAMES[c] || `C${c}`}`).join(', ')
      steps.push(createStep('solution', `✓ Valid coloring found! ${assignment}`, u - 1, [], [], false, 5))
      return true
    }

    statesExplored++
    const triedColors: number[] = []
    const neighbors = adj[u].filter(v => colors[v] !== -1)
    const neighborInfo = neighbors.length > 0 ? ` Neighbors with colors: ${neighbors.map(v => `Node ${v}(${COLOR_NAMES[colors[v]] || `C${colors[v]}`})`).join(', ')}.` : ' No colored neighbors yet.'

    for (let c = 0; c < maxColors; c++) {
      triedColors.push(c)
      const colorName = COLOR_NAMES[c] || `Color ${c}`
      steps.push(createStep('forward', `Node ${u}: Trying ${colorName}.${neighborInfo}`, u, [...triedColors], [], false, 1))
      
      const { safe, conflictEdges } = isSafe(u, c)

      if (safe) {
        colors[u] = c
        operations++
        steps.push(createStep('forward', `✓ Assigned ${colorName} to node ${u}. No adjacent conflicts. Moving to node ${u + 1}.`, u, [...triedColors], [], false, 3))
        
        if (solve(u + 1)) return true // Stop at first solution
        
        colors[u] = -1
        operations++
        const reason = u + 1 < nodes ? `Node ${u + 1} couldn't be colored` : 'Exploring alternatives'
        steps.push(createStep('backtrack', `↩ Backtrack node ${u}: Removing ${colorName}. ${reason}.`, u, [...triedColors], [], true, 4))
      } else {
        const conflictNames = conflictEdges.map(e => `Node ${e.v}(${COLOR_NAMES[colors[e.v]] || `C${colors[e.v]}`})`).join(', ')
        steps.push(createStep('backtrack', `✗ ${colorName} invalid for node ${u} — conflicts with ${conflictNames}.`, u, [...triedColors], conflictEdges, true, 2))
      }
    }

    return false
  }

  solve(0)
  steps.push(createStep('done', `Graph coloring complete. ${solution ? `Solution found using ${maxColors} colors.` : `No valid coloring exists with ${maxColors} colors.`}`, 0, [], [], false, 6))

  return { steps, answer: solution }
}

// ─── TSP ────────────────────────────────────────────────────────────
export function runTSP(nodes: number, edges: Edge[]): { steps: BacktrackingStep[]; answer: { path: number[]; cost: number } } {
  const steps: BacktrackingStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0
  let prunedBranches = 0

  const adjMatrix: number[][] = Array.from({ length: nodes }, () => Array(nodes).fill(Infinity))
  edges.forEach(e => {
    adjMatrix[e.u][e.v] = e.weight
    adjMatrix[e.v][e.u] = e.weight // Assuming undirected
  })

  let bestCost = Infinity
  let bestPath: number[] = []
  const visited = Array(nodes).fill(false)
  const currentPath: number[] = [0] // Start at node 0
  visited[0] = true

  const createStep = (stepType: BacktrackingStep['stepType'], note: string, currentCost: number, isBacktracking: boolean, activeLine?: number): BacktrackingStep => {
    return {
      type: 'tsp',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: nodes * 8,
      activeLine,
      data: {
        cities: Array.from({ length: nodes }, (_, i) => i),
        edges,
        currentPath: [...currentPath],
        bestPath: [...bestPath],
        currentCost,
        bestCost,
        isBacktracking,
        prunedBranches,
      }
    }
  }

  steps.push(createStep('init', `TSP with ${nodes} cities and ${edges.length} edges. Starting from city 0. Finding minimum-cost Hamiltonian cycle.`, 0, false, 0))

  const solve = (currPos: number, count: number, cost: number) => {
    statesExplored++
    comparisons++
    
    // Pruning (Branch and Bound aspect within backtracking)
    if (cost >= bestCost) {
      prunedBranches++
      steps.push(createStep('backtrack', `✗ Pruned: partial cost ${cost} ≥ best known ${bestCost}. Saved exploring ${Math.pow(nodes - count, 2)} potential branches.`, cost, true, 3))
      return
    }

    if (count === nodes && adjMatrix[currPos][0] !== Infinity) {
      const finalCost = cost + adjMatrix[currPos][0]
      if (finalCost < bestCost) {
        bestCost = finalCost
        bestPath = [...currentPath, 0]
        const pathStr = bestPath.join(' → ')
        steps.push(createStep('solution', `✓ New best tour! Path: [${pathStr}], Cost: ${bestCost} (improved from ${bestCost === finalCost ? '∞' : bestCost}).`, finalCost, false, 5))
      } else {
        steps.push(createStep('backtrack', `↩ Completed tour cost ${finalCost} ≥ best ${bestCost}. Not an improvement.`, finalCost, true, 4))
      }
      return
    }

    if (count === nodes) {
      steps.push(createStep('backtrack', `✗ Dead end: No edge from city ${currPos} back to city 0.`, cost, true, 4))
      return
    }

    for (let i = 0; i < nodes; i++) {
      if (!visited[i] && adjMatrix[currPos][i] !== Infinity) {
        const edgeCost = adjMatrix[currPos][i]
        visited[i] = true
        currentPath.push(i)
        operations += 2
        
        const visitedCount = count + 1
        const remaining = nodes - visitedCount
        steps.push(createStep('forward', `Travel: city ${currPos} → city ${i} (edge cost: ${edgeCost}). Running cost: ${cost + edgeCost}. Visited: ${visitedCount}/${nodes}.`, cost + edgeCost, false, 1))
        
        solve(i, count + 1, cost + edgeCost)
        
        visited[i] = false
        currentPath.pop()
        operations += 2
        
        steps.push(createStep('backtrack', `↩ Backtrack: city ${i} → city ${currPos}. Undoing visit to explore other routes.`, cost, true, 6))
      }
    }
  }

  solve(0, 1, 0)
  steps.push(createStep('done', `TSP complete. ${bestCost === Infinity ? 'No valid tour exists.' : `Best tour cost: ${bestCost}. Path: [${bestPath.join(' → ')}]. Pruned ${prunedBranches} branches.`}`, 0, false, 7))

  return { steps, answer: { path: bestPath, cost: bestCost } }
}
