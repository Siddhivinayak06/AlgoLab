export interface PuzzleState {
  board: number[][]
  blankRow: number
  blankCol: number
  cost: number // g + h
  g: number    // distance from root
  h: number    // heuristic value
  parentId: string | null
  moveDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null
}

export interface BranchBoundStep {
  type: '15-puzzle'
  stepType: 'init' | 'expand' | 'evaluate' | 'process' | 'update' | 'solution' | 'done'
  note: string
  activeLine: number
  comparisons: number
  operations: number
  statesExplored: number
  memoryUsage: number
  data: {
    currentBoard: number[][]
    blankPos: { row: number; col: number }
    moveDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null
    heuristicCost: number
    gCost: number
    exploredStatesCount: number
    frontierStatesCount: number
  }
}

export interface BranchBoundAlgorithmInfo {
  name: string
  description: string
  worstCase: string
  spaceComplexity: string
}

export const BRANCH_BOUND_INFO: Record<string, BranchBoundAlgorithmInfo> = {
  '15-puzzle': {
    name: "15 Puzzle (Branch & Bound)",
    description: "Solves the 15-puzzle by searching a state space tree, using a priority queue ordered by cost (g + h) where h is Manhattan distance to goal.",
    worstCase: "O(b^d) where b is branching factor, d is depth",
    spaceComplexity: "O(b^d) to store the frontier",
  },
}

// Goal board for 4x4 (1-15, 0 represents blank)
const GOAL_BOARD = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 0]
]

// Manhattan distance heuristic
function calculateHeuristic(board: number[][]): number {
  let distance = 0
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = board[r][c]
      if (val !== 0) {
        // Expected row and col for this value
        const targetRow = Math.floor((val - 1) / 4)
        const targetCol = (val - 1) % 4
        distance += Math.abs(r - targetRow) + Math.abs(c - targetCol)
      }
    }
  }
  return distance
}

function cloneBoard(board: number[][]): number[][] {
  return board.map(row => [...row])
}

function boardToString(board: number[][]): string {
  return board.map(r => r.join(',')).join('|')
}

export function run15Puzzle(initialBoard: number[][]): { steps: BranchBoundStep[]; answer: number[][][] | null } {
  const steps: BranchBoundStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExploredCount = 0

  // Find initial blank
  let initialBlankR = -1
  let initialBlankC = -1
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (initialBoard[r][c] === 0) {
        initialBlankR = r
        initialBlankC = c
      }
    }
  }

  const pq: PuzzleState[] = []
  const explored = new Set<string>()
  const parentMap = new Map<string, number[][]>() // Map state string to its parent's state string for path reconstruction

  const h = calculateHeuristic(initialBoard)
  pq.push({
    board: cloneBoard(initialBoard),
    blankRow: initialBlankR,
    blankCol: initialBlankC,
    cost: h,
    g: 0,
    h,
    parentId: null,
    moveDirection: null
  })

  const createStep = (
    stepType: BranchBoundStep['stepType'], 
    note: string, 
    activeLine: number,
    board: number[][], 
    blankPos: {row: number; col: number}, 
    dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null,
    hCost: number,
    gCost: number
  ): BranchBoundStep => {
    return {
      type: '15-puzzle',
      stepType,
      note,
      activeLine,
      comparisons, operations, statesExplored: statesExploredCount, memoryUsage: (explored.size + pq.length) * 64,
      data: {
        currentBoard: cloneBoard(board),
        blankPos,
        moveDirection: dir,
        heuristicCost: hCost,
        gCost,
        exploredStatesCount: explored.size,
        frontierStatesCount: pq.length
      }
    }
  }

  steps.push(createStep('init', `Initialized 15-Puzzle. Initial heuristic (Manhattan) is ${h}.`, 1, initialBoard, {row: initialBlankR, col: initialBlankC}, null, h, 0))

  const moves = [
    { dr: -1, dc: 0, dir: 'UP' as const },
    { dr: 1, dc: 0, dir: 'DOWN' as const },
    { dr: 0, dc: -1, dir: 'LEFT' as const },
    { dr: 0, dc: 1, dir: 'RIGHT' as const }
  ]

  let solutionState: PuzzleState | null = null

  // Limit iterations to prevent infinite loops in visualizer (15-puzzle state space is huge)
  const MAX_ITERATIONS = 1000

  while (pq.length > 0 && statesExploredCount < MAX_ITERATIONS) {
    // Pop minimum cost state
    pq.sort((a, b) => a.cost - b.cost)
    const current = pq.shift()!
    const stateStr = boardToString(current.board)

    statesExploredCount++
    operations++
    comparisons++

    if (explored.has(stateStr)) continue
    explored.add(stateStr)

    steps.push(createStep('evaluate', `Evaluating state with g=${current.g}, h=${current.h}, f=${current.cost}.`, 3, current.board, {row: current.blankRow, col: current.blankCol}, current.moveDirection, current.h, current.g))

    if (current.h === 0) { // Goal reached
      solutionState = current
      steps.push(createStep('solution', `Goal state reached! Cost: ${current.g} moves.`, 5, current.board, {row: current.blankRow, col: current.blankCol}, current.moveDirection, 0, current.g))
      break
    }

    // Expand
    steps.push(createStep('expand', `Expanding current state into valid neighbors.`, 6, current.board, {row: current.blankRow, col: current.blankCol}, current.moveDirection, current.h, current.g))
    
    for (const move of moves) {
      const newR = current.blankRow + move.dr
      const newC = current.blankCol + move.dc

      if (newR >= 0 && newR < 4 && newC >= 0 && newC < 4) {
        operations += 2
        const newBoard = cloneBoard(current.board)
        // Swap
        const temp = newBoard[newR][newC]
        newBoard[newR][newC] = 0
        newBoard[current.blankRow][current.blankCol] = temp

        const newStateStr = boardToString(newBoard)
        comparisons++
        
        steps.push(createStep('process', `Generated new board state (move ${move.dir}).`, 7, newBoard, {row: newR, col: newC}, move.dir, calculateHeuristic(newBoard), current.g + 1))

        if (!explored.has(newStateStr)) {
          const newH = calculateHeuristic(newBoard)
          const newG = current.g + 1
          
          pq.push({
            board: newBoard,
            blankRow: newR,
            blankCol: newC,
            cost: newG + newH,
            g: newG,
            h: newH,
            parentId: stateStr,
            moveDirection: move.dir
          })
          
          parentMap.set(newStateStr, current.board)
          steps.push(createStep('update', `State is unexplored. Pushed to Priority Queue with f=${newG + newH}.`, 9, newBoard, {row: newR, col: newC}, move.dir, newH, newG))
        }
      }
    }
  }

  if (!solutionState) {
    if (statesExploredCount >= MAX_ITERATIONS) {
      steps.push(createStep('done', `Exploration limit reached (${MAX_ITERATIONS} states). Solution not found within limit.`, 9, initialBoard, {row: initialBlankR, col: initialBlankC}, null, h, 0))
    } else {
      steps.push(createStep('done', `State space exhausted. Puzzle might be unsolvable.`, 9, initialBoard, {row: initialBlankR, col: initialBlankC}, null, h, 0))
    }
    return { steps, answer: null }
  }

  // Backtrack to reconstruct path
  const path: number[][][] = []
  let currStr = boardToString(solutionState.board)
  path.push(solutionState.board)
  
  while (parentMap.has(currStr)) {
    const parent = parentMap.get(currStr)!
    path.push(parent)
    currStr = boardToString(parent)
  }
  
  path.reverse() // From start to goal

  return { steps, answer: path }
}
