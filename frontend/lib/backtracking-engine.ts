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
  isBacktracking: boolean
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
  currentSum: number
  validSubsets: number[][]
}

export interface GraphColoringData {
  nodes: number[]
  edges: Edge[]
  colors: number[] // Color index assigned to each node, -1 if unassigned
  maxColors: number
  currentNode: number
  triedColors: number[]
  isBacktracking: boolean
}

export interface TSPData {
  cities: number[]
  edges: Edge[]
  currentPath: number[]
  bestPath: number[]
  currentCost: number
  bestCost: number
  isBacktracking: boolean
}

export interface BacktrackingStep {
  type: 'n-queens' | 'sum-of-subsets' | 'graph-coloring' | 'tsp'
  stepType: 'init' | 'forward' | 'backtrack' | 'solution' | 'done'
  note: string
  comparisons: number
  operations: number
  statesExplored: number
  memoryUsage: number
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

export function runNQueens(n: number): { steps: BacktrackingStep[]; answer: { row: number; col: number }[][] } {
  const steps: BacktrackingStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const board: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  const queens: { row: number; col: number }[] = []
  const solutions: { row: number; col: number }[][] = []

  const createStep = (stepType: BacktrackingStep['stepType'], note: string, currentRow: number, currentCol: number, conflicts: { row: number; col: number }[], isBacktracking: boolean): BacktrackingStep => {
    return {
      type: 'n-queens',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: n * n * 4,
      data: {
        board: board.map(r => [...r]),
        currentRow, currentCol,
        queens: [...queens],
        conflicts,
        isBacktracking
      }
    }
  }

  steps.push(createStep('init', `Initialized ${n}x${n} board.`, 0, 0, [], false))

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
      steps.push(createStep('solution', `Found valid solution!`, row, 0, [], false))
      return
    }

    for (let col = 0; col < n; col++) {
      statesExplored++
      steps.push(createStep('forward', `Trying to place queen at (${row}, ${col}).`, row, col, [], false))
      
      const { safe, conflicts } = isSafe(row, col)
      
      if (safe) {
        board[row][col] = 1
        queens.push({ row, col })
        operations += 2
        
        steps.push(createStep('forward', `Placed queen at (${row}, ${col}).`, row, col, [], false))
        solve(row + 1)
        
        // Backtrack
        board[row][col] = 0
        queens.pop()
        operations += 2
        steps.push(createStep('backtrack', `Backtracking from (${row}, ${col}). Removed queen.`, row, col, [], true))
      } else {
        steps.push(createStep('backtrack', `Conflict at (${row}, ${col}). Cannot place queen.`, row, col, conflicts, true))
      }
    }
  }

  solve(0)
  steps.push(createStep('done', `Finished exploring all states. Found ${solutions.length} solutions.`, 0, 0, [], false))

  return { steps, answer: solutions }
}

export function runSumOfSubsets(items: number[], target: number): { steps: BacktrackingStep[]; answer: number[][] } {
  const steps: BacktrackingStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const validSubsets: number[][] = []
  const currentSubset: number[] = []
  const treeNodes: TreeNode[] = []
  
  // Sort items to optimize backtracking (optional but good practice)
  const sortedItems = [...items].sort((a, b) => a - b)
  const totalSum = sortedItems.reduce((a, b) => a + b, 0)

  const createStep = (stepType: BacktrackingStep['stepType'], note: string, currentNodeId: string, currentSum: number): BacktrackingStep => {
    // Clone treeNodes and mark current
    const nodes = treeNodes.map(n => ({ ...n, isCurrent: n.id === currentNodeId }))
    
    return {
      type: 'sum-of-subsets',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: items.length * 8 + treeNodes.length * 16,
      data: {
        items: sortedItems,
        target,
        treeNodes: nodes,
        currentNodeId,
        includedItems: [...currentSubset],
        currentSum,
        validSubsets: validSubsets.map(s => [...s])
      }
    }
  }

  const rootId = 'root'
  treeNodes.push({ id: rootId, label: 'Start', level: 0, included: false, sum: 0, isCurrent: true, isSolution: false })
  steps.push(createStep('init', `Started with sorted items. Target: ${target}.`, rootId, 0))

  const solve = (idx: number, currentSum: number, remainingSum: number, parentId: string) => {
    statesExplored++
    comparisons++
    
    if (currentSum === target) {
      validSubsets.push([...currentSubset])
      const node = treeNodes.find(n => n.id === parentId)
      if (node) node.isSolution = true
      steps.push(createStep('solution', `Found subset summing to ${target}: [${currentSubset.join(', ')}]`, parentId, currentSum))
      return
    }

    if (idx >= sortedItems.length || currentSum > target || currentSum + remainingSum < target) {
      steps.push(createStep('backtrack', `Backtracking. Current sum: ${currentSum}, Target: ${target}.`, parentId, currentSum))
      return
    }

    const item = sortedItems[idx]

    // Include item
    const includeId = `${parentId}-L`
    treeNodes.push({ id: includeId, label: `+${item}`, level: idx + 1, included: true, sum: currentSum + item, isCurrent: true, isSolution: false })
    
    currentSubset.push(item)
    operations++
    steps.push(createStep('forward', `Included ${item}. New sum: ${currentSum + item}.`, includeId, currentSum + item))
    
    solve(idx + 1, currentSum + item, remainingSum - item, includeId)
    
    // Backtrack and Exclude item
    currentSubset.pop()
    operations++
    
    const excludeId = `${parentId}-R`
    treeNodes.push({ id: excludeId, label: `-${item}`, level: idx + 1, included: false, sum: currentSum, isCurrent: true, isSolution: false })
    
    steps.push(createStep('forward', `Excluded ${item}. Sum remains: ${currentSum}.`, excludeId, currentSum))
    
    solve(idx + 1, currentSum, remainingSum - item, excludeId)
  }

  solve(0, 0, totalSum, rootId)
  steps.push(createStep('done', `Finished exploring. Found ${validSubsets.length} valid subsets.`, rootId, 0))

  return { steps, answer: validSubsets }
}

export function runGraphColoring(nodes: number, edges: Edge[], maxColors: number): { steps: BacktrackingStep[]; answer: number[] | null } {
  const steps: BacktrackingStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const adj: number[][] = Array.from({ length: nodes }, () => [])
  edges.forEach(e => {
    adj[e.u].push(e.v)
    adj[e.v].push(e.u) // Undirected
  })

  const colors: number[] = Array(nodes).fill(-1)
  let solution: number[] | null = null

  const createStep = (stepType: BacktrackingStep['stepType'], note: string, currentNode: number, triedColors: number[], isBacktracking: boolean): BacktrackingStep => {
    return {
      type: 'graph-coloring',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: nodes * 4,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => i),
        edges,
        colors: [...colors],
        maxColors,
        currentNode,
        triedColors,
        isBacktracking
      }
    }
  }

  steps.push(createStep('init', `Initialized graph with ${nodes} nodes. Max colors allowed: ${maxColors}.`, 0, [], false))

  const isSafe = (u: number, c: number): boolean => {
    for (const v of adj[u]) {
      comparisons++
      if (colors[v] === c) return false
    }
    return true
  }

  const solve = (u: number): boolean => {
    if (u === nodes) {
      solution = [...colors]
      steps.push(createStep('solution', `Found a valid coloring for all nodes!`, u - 1, [], false))
      return true
    }

    statesExplored++
    const triedColors: number[] = []

    for (let c = 0; c < maxColors; c++) {
      triedColors.push(c)
      steps.push(createStep('forward', `Trying color ${c} for node ${u}.`, u, [...triedColors], false))
      
      if (isSafe(u, c)) {
        colors[u] = c
        operations++
        steps.push(createStep('forward', `Assigned color ${c} to node ${u}. Moving to next node.`, u, [...triedColors], false))
        
        if (solve(u + 1)) return true // Stop at first solution for simplicity
        
        colors[u] = -1
        operations++
        steps.push(createStep('backtrack', `Backtracking from node ${u}. Color ${c} didn't lead to solution.`, u, [...triedColors], true))
      } else {
        steps.push(createStep('backtrack', `Color ${c} is invalid for node ${u} (adjacent conflict).`, u, [...triedColors], true))
      }
    }

    return false
  }

  solve(0)
  steps.push(createStep('done', `Graph coloring complete. ${solution ? 'Solution found.' : 'No solution exists.'}`, 0, [], false))

  return { steps, answer: solution }
}

export function runTSP(nodes: number, edges: Edge[]): { steps: BacktrackingStep[]; answer: { path: number[]; cost: number } } {
  const steps: BacktrackingStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

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

  const createStep = (stepType: BacktrackingStep['stepType'], note: string, currentCost: number, isBacktracking: boolean): BacktrackingStep => {
    return {
      type: 'tsp',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: nodes * 8,
      data: {
        cities: Array.from({ length: nodes }, (_, i) => i),
        edges,
        currentPath: [...currentPath],
        bestPath: [...bestPath],
        currentCost,
        bestCost,
        isBacktracking
      }
    }
  }

  steps.push(createStep('init', `Started TSP from city 0.`, 0, false))

  const solve = (currPos: number, count: number, cost: number) => {
    statesExplored++
    comparisons++
    
    // Pruning (Branch and Bound aspect within backtracking)
    if (cost >= bestCost) {
       steps.push(createStep('backtrack', `Pruning path: current cost ${cost} >= best cost ${bestCost}.`, cost, true))
       return
    }

    if (count === nodes && adjMatrix[currPos][0] !== Infinity) {
      const finalCost = cost + adjMatrix[currPos][0]
      if (finalCost < bestCost) {
        bestCost = finalCost
        bestPath = [...currentPath, 0]
        steps.push(createStep('solution', `Found better tour! Cost: ${bestCost}. Path: [${bestPath.join(' -> ')}].`, finalCost, false))
      } else {
        steps.push(createStep('backtrack', `Completed tour with cost ${finalCost}, but not better than ${bestCost}.`, finalCost, true))
      }
      return
    }

    for (let i = 0; i < nodes; i++) {
      if (!visited[i] && adjMatrix[currPos][i] !== Infinity) {
        visited[i] = true
        currentPath.push(i)
        operations += 2
        
        steps.push(createStep('forward', `Traveled from city ${currPos} to ${i}. Cost so far: ${cost + adjMatrix[currPos][i]}.`, cost + adjMatrix[currPos][i], false))
        
        solve(i, count + 1, cost + adjMatrix[currPos][i])
        
        visited[i] = false
        currentPath.pop()
        operations += 2
        
        steps.push(createStep('backtrack', `Backtracking from city ${i} to ${currPos}.`, cost, true))
      }
    }
  }

  solve(0, 1, 0)
  steps.push(createStep('done', `TSP complete. Best cost: ${bestCost === Infinity ? 'None' : bestCost}.`, 0, false))

  return { steps, answer: { path: bestPath, cost: bestCost } }
}
