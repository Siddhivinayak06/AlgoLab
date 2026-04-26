export interface Edge {
  u: number
  v: number
  weight: number
}

export interface MultistageData {
  stages: number[][] // nodes in each stage
  nodes: number[]
  edges: Edge[]
  costs: number[]
  dpTable: number[]
  currentStage: number
  currentNode: number | null
}

export interface BellmanFordData {
  nodes: number[]
  edges: Edge[]
  distances: number[]
  iteration: number
  relaxedEdge: Edge | null
  negativeCycle: boolean
  parent: number[]
  sptEdges: Edge[]
}

export interface FloydWarshallData {
  matrix: number[][]
  k: number
  i: number
  j: number
  previousValue: number
  newValue: number
  improved: boolean
}

export interface GraphStep {
  type: 'multistage' | 'bellman-ford' | 'floyd-warshall'
  stepType: 'init' | 'process' | 'update' | 'check' | 'done' | 'spt-build'
  note: string
  activeLine: number
  comparisons: number
  operations: number
  statesExplored: number
  memoryUsage: number
  data: MultistageData | BellmanFordData | FloydWarshallData
}

export interface GraphAlgorithmInfo {
  name: string
  description: string
  worstCase: string
  spaceComplexity: string
}

export const GRAPH_INFO: Record<string, GraphAlgorithmInfo> = {
  multistage: {
    name: "Multistage Graph",
    description: "Finds the shortest path from a source to a sink in a directed graph divided into stages, using dynamic programming.",
    worstCase: "O(V + E)",
    spaceComplexity: "O(V)",
  },
  'bellman-ford': {
    name: "Bellman-Ford Algorithm",
    description: "Computes shortest paths from a single source vertex to all of the other vertices in a weighted digraph, capable of handling negative weights.",
    worstCase: "O(V × E)",
    spaceComplexity: "O(V)",
  },
  'floyd-warshall': {
    name: "Floyd-Warshall Algorithm",
    description: "Finds shortest paths between all pairs of vertices in a weighted graph, positive or negative edge weights.",
    worstCase: "O(V^3)",
    spaceComplexity: "O(V^2)",
  },
}

export function runMultistage(stages: number[][], edges: Edge[]): { steps: GraphStep[]; answer: number } {
  const steps: GraphStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const nodes = stages.flat()
  const n = nodes.length
  const costs = Array(n).fill(Infinity)
  const path = Array(n).fill(-1)
  
  const adj: [number, number][][] = Array.from({ length: n }, () => [])
  edges.forEach(e => {
    adj[e.u].push([e.v, e.weight])
  })

  // Sink node distance is 0
  const sinkStage = stages[stages.length - 1]
  if (sinkStage && sinkStage.length > 0) {
    costs[sinkStage[0]] = 0
  }

  const createStep = (stepType: GraphStep['stepType'], note: string, activeLine: number, currentStage: number, currentNode: number | null): GraphStep => {
    return {
      type: 'multistage',
      stepType,
      note,
      activeLine,
      comparisons, operations, statesExplored, memoryUsage: n * 8,
      data: {
        stages,
        nodes,
        edges,
        costs: [...costs],
        dpTable: [...costs], // Same as costs for this representation
        currentStage,
        currentNode
      }
    }
  }

  steps.push(createStep('init', `Initialized costs to Infinity, sink node cost to 0.`, 1, stages.length - 1, null))

  // Work backwards from second to last stage
  for (let i = stages.length - 2; i >= 0; i--) {
    const stageNodes = stages[i]
    
    for (const u of stageNodes) {
      statesExplored++
      steps.push(createStep('process', `Evaluating node ${u} in stage ${i}.`, 3, i, u))
      
      let minCost = Infinity
      
      for (const [v, weight] of adj[u]) {
        comparisons++
        operations++
        const candidateCost = weight + costs[v]
        
        steps.push(createStep('check', `Checking edge (${u}, ${v}) weight ${weight} + cost(${v}) ${costs[v]} = ${candidateCost}.`, 5, i, u))
        
        if (candidateCost < minCost) {
          minCost = candidateCost
          path[u] = v
        }
      }
      
      costs[u] = minCost
      steps.push(createStep('update', `Minimum cost for node ${u} is ${costs[u]}.`, 8, i, u))
    }
  }

  steps.push(createStep('done', `Multistage graph shortest path complete. Minimum cost from source is ${costs[0]}.`, 8, 0, null))
  return { steps, answer: costs[0] }
}

export function runBellmanFord(nodes: number, edges: Edge[], source: number): { steps: GraphStep[]; answer: number[] } {
  const steps: GraphStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const distances = Array(nodes).fill(Infinity)
  const parent = Array(nodes).fill(-1)
  const sptEdges: Edge[] = []
  distances[source] = 0

  const createStep = (stepType: GraphStep['stepType'], note: string, activeLine: number, iteration: number, relaxedEdge: Edge | null, negativeCycle: boolean): GraphStep => {
    return {
      type: 'bellman-ford',
      stepType,
      note,
      activeLine,
      comparisons, operations, statesExplored, memoryUsage: nodes * 8,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => i),
        edges,
        distances: [...distances],
        iteration,
        relaxedEdge,
        negativeCycle,
        parent: [...parent],
        sptEdges: [...sptEdges]
      }
    }
  }

  steps.push(createStep('init', `Initialized distances to Infinity, source node ${source} to 0.`, 1, 0, null, false))

  // Relax edges |V| - 1 times
  for (let i = 1; i < nodes; i++) {
    statesExplored++
    let anyRelaxed = false

    steps.push(createStep('process', `Starting iteration ${i}.`, 2, i, null, false))

    for (const edge of edges) {
      const { u, v, weight } = edge
      comparisons++
      operations++

      if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight
        parent[v] = u
        anyRelaxed = true
        steps.push(createStep('update', `Relaxed edge (${u}, ${v}). New distance for ${v} is ${distances[v]}.`, 5, i, edge, false))
      } else {
        steps.push(createStep('check', `Checked edge (${u}, ${v}). No relaxation needed.`, 4, i, edge, false))
      }
    }

    if (!anyRelaxed) {
      steps.push(createStep('process', `No edges relaxed in iteration ${i}. Early termination.`, 5, i, null, false))
      break
    }
  }

  // Check for negative weight cycles
  let negativeCycle = false
  for (const edge of edges) {
    comparisons++
    const { u, v, weight } = edge
    if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
      negativeCycle = true
      steps.push(createStep('check', `Negative weight cycle detected at edge (${u}, ${v}).`, 8, nodes, edge, true))
      break
    }
  }

  if (!negativeCycle) {
    // Build Shortest Path Tree for animation
    for (let v = 0; v < nodes; v++) {
      if (parent[v] !== -1 && parent[v] !== null && parent[v] !== undefined) {
        const u = parent[v]
        const weight = edges.find(e => e.u === u && e.v === v)?.weight || 0
        sptEdges.push({ u, v, weight })
        steps.push(createStep('spt-build', `Added edge (${u}, ${v}) to Shortest Path Tree.`, 5, nodes, null, false))
      }
    }

    steps.push(createStep('done', `Bellman-Ford algorithm complete. Shortest Path Tree built.`, 5, nodes, null, false))
  }

  return { steps, answer: distances }
}

export function runFloydWarshall(nodes: number, edges: Edge[]): { steps: GraphStep[]; answer: number[][] } {
  const steps: GraphStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const matrix: number[][] = Array.from({ length: nodes }, () => Array(nodes).fill(Infinity))
  
  for (let i = 0; i < nodes; i++) {
    matrix[i][i] = 0
  }
  
  for (const edge of edges) {
    matrix[edge.u][edge.v] = edge.weight
    // If undirected, add reverse edge too. Assuming directed here for FW generally.
  }

  const createStep = (stepType: GraphStep['stepType'], note: string, activeLine: number, k: number, i: number, j: number, previousValue: number, newValue: number, improved: boolean): GraphStep => {
    return {
      type: 'floyd-warshall',
      stepType,
      note,
      activeLine,
      comparisons, operations, statesExplored, memoryUsage: nodes * nodes * 8,
      data: {
        matrix: matrix.map(row => [...row]),
        k, i, j, previousValue, newValue, improved
      }
    }
  }

  steps.push(createStep('init', `Initialized distance matrix with edge weights.`, 1, -1, -1, -1, 0, 0, false))

  for (let k = 0; k < nodes; k++) {
    statesExplored++
    steps.push(createStep('process', `Considering node ${k} as an intermediate vertex.`, 2, k, -1, -1, 0, 0, false))
    
    for (let i = 0; i < nodes; i++) {
      for (let j = 0; j < nodes; j++) {
        comparisons++
        operations++
        
        if (matrix[i][k] !== Infinity && matrix[k][j] !== Infinity) {
          const candidate = matrix[i][k] + matrix[k][j]
          const current = matrix[i][j]
          
          steps.push(createStep('check', `Checking if path from ${i} to ${j} via ${k} (${candidate}) is better than current (${current}).`, 5, k, i, j, current, candidate, false))

          if (candidate < current) {
            matrix[i][j] = candidate
            steps.push(createStep('update', `Improved path from ${i} to ${j} via ${k}. New cost: ${candidate}.`, 6, k, i, j, current, candidate, true))
          }
        }
      }
    }
  }

  steps.push(createStep('done', `Floyd-Warshall algorithm complete. All-pairs shortest paths computed.`, 6, nodes, -1, -1, 0, 0, false))
  return { steps, answer: matrix }
}
