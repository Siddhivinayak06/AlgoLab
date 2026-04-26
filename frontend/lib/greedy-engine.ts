export interface Edge {
  u: number
  v: number
  weight: number
}

export interface DijkstraData {
  nodes: number[]
  edges: Edge[]
  distances: number[]
  visited: boolean[]
  priorityQueue: { node: number; dist: number }[]
  currentNode: number | null
  parent: number[]
  sptEdges: Edge[]
}

export interface KnapsackItem {
  id: number
  weight: number
  value: number
  ratio: number
}

export interface KnapsackData {
  items: KnapsackItem[]
  sortedItems: KnapsackItem[]
  knapsack: { item: KnapsackItem; fraction: number }[]
  currentItem: KnapsackItem | null
  totalValue: number
  remainingCapacity: number
}

export interface Job {
  id: number
  deadline: number
  profit: number
}

export interface JobSchedulingData {
  jobs: Job[]
  timeline: (Job | null)[]
  currentJob: Job | null
  accepted: Job[]
  rejected: Job[]
}

export interface PrimsData {
  nodes: number[]
  edges: Edge[]
  mstEdges: Edge[]
  inMST: boolean[]
  priorityQueue: { node: number; parent: number; weight: number }[]
  currentNode: number | null
}

export interface KruskalsData {
  edges: Edge[]
  sortedEdges: Edge[]
  mstEdges: Edge[]
  parent: number[]
  rank: number[]
  currentEdge: Edge | null
  cycleDetected: boolean
}

export interface GreedyStep {
  type: 'dijkstra' | 'fractional-knapsack' | 'job-scheduling' | 'prims' | 'kruskals'
  stepType: 'init' | 'process' | 'update' | 'select' | 'done' | 'spt-build'
  note: string
  comparisons: number
  operations: number
  statesExplored: number
  memoryUsage: number
  data: DijkstraData | KnapsackData | JobSchedulingData | PrimsData | KruskalsData
}

export interface GreedyAlgorithmInfo {
  name: string
  description: string
  worstCase: string
  spaceComplexity: string
}

export const GREEDY_INFO: Record<string, GreedyAlgorithmInfo> = {
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: "Finds shortest paths from a source node to all other nodes in a graph with non-negative edge weights using a priority queue.",
    worstCase: "O((V + E) log V)",
    spaceComplexity: "O(V + E)",
  },
  'fractional-knapsack': {
    name: "Fractional Knapsack",
    description: "Maximizes value in a knapsack of limited capacity by taking items sorted by value-to-weight ratio. Items can be broken into fractions.",
    worstCase: "O(N log N)",
    spaceComplexity: "O(N)",
  },
  'job-scheduling': {
    name: "Job Scheduling with Deadlines",
    description: "Schedules jobs to maximize total profit, where each job takes 1 unit of time and must be finished by its deadline.",
    worstCase: "O(N^2) or O(N log N)",
    spaceComplexity: "O(N)",
  },
  prims: {
    name: "Prim's Algorithm",
    description: "Finds a Minimum Spanning Tree (MST) for a weighted undirected graph by growing a single tree one edge at a time.",
    worstCase: "O((V + E) log V)",
    spaceComplexity: "O(V + E)",
  },
  kruskals: {
    name: "Kruskal's Algorithm",
    description: "Finds a Minimum Spanning Tree (MST) by sorting edges and adding them to the forest if they don't form a cycle (using Union-Find).",
    worstCase: "O(E log E)",
    spaceComplexity: "O(V + E)",
  },
}

export function runDijkstra(nodes: number, edges: Edge[], source: number): { steps: GreedyStep[]; answer: number[] } {
  const steps: GreedyStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const adj: [number, number][][] = Array.from({ length: nodes }, () => [])
  edges.forEach(e => {
    adj[e.u].push([e.v, e.weight])
    adj[e.v].push([e.u, e.weight]) // Assuming undirected for visualizer by default unless specified
  })

  const distances = Array(nodes).fill(Infinity)
  const visited = Array(nodes).fill(false)
  const parent = Array(nodes).fill(-1)
  const sptEdges: Edge[] = []
  distances[source] = 0
  
  const pq: { node: number; dist: number }[] = [{ node: source, dist: 0 }]
  
  const createStep = (stepType: GreedyStep['stepType'], note: string, currentNode: number | null): GreedyStep => {
    return {
      type: 'dijkstra',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: nodes * 8 + edges.length * 12,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => i),
        edges,
        distances: [...distances],
        visited: [...visited],
        priorityQueue: [...pq].sort((a, b) => a.dist - b.dist),
        currentNode,
        parent: [...parent],
        sptEdges: [...sptEdges]
      }
    }
  }

  steps.push(createStep('init', `Initialized distances to Infinity, source node ${source} to 0.`, null))

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist)
    const { node: u, dist: d } = pq.shift()!
    
    statesExplored++
    operations++

    if (visited[u]) {
      steps.push(createStep('process', `Node ${u} is already visited, skipping.`, u))
      continue
    }

    visited[u] = true
    steps.push(createStep('process', `Visiting node ${u} with current shortest distance ${d}.`, u))

    for (const [v, weight] of adj[u]) {
      comparisons++
      operations++
      if (!visited[v] && distances[u] !== Infinity && distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight
        parent[v] = u
        pq.push({ node: v, dist: distances[v] })
        steps.push(createStep('update', `Relaxed edge (${u}, ${v}). New distance for ${v} is ${distances[v]}.`, v))
      }
    }
  }

  // Build Shortest Path Tree for animation
  for (let v = 0; v < nodes; v++) {
    if (parent[v] !== -1 && parent[v] !== null && parent[v] !== undefined) {
      const u = parent[v]
      const weight = adj[u].find(n => n[0] === v)?.[1] || 0
      sptEdges.push({ u, v, weight })
      steps.push(createStep('spt-build', `Added edge (${u}, ${v}) to Shortest Path Tree.`, v))
    }
  }

  steps.push(createStep('done', `Dijkstra's Algorithm complete. Shortest Path Tree built.`, null))
  return { steps, answer: distances }
}

export function runFractionalKnapsack(items: KnapsackItem[], capacity: number): { steps: GreedyStep[]; answer: number } {
  const steps: GreedyStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const sortedItems = [...items].sort((a, b) => {
    comparisons++
    return b.ratio - a.ratio
  })
  
  operations += sortedItems.length * Math.log2(sortedItems.length || 1) // Sort approx

  let currentCapacity = capacity
  let totalValue = 0
  const knapsack: { item: KnapsackItem; fraction: number }[] = []

  const createStep = (stepType: GreedyStep['stepType'], note: string, currentItem: KnapsackItem | null): GreedyStep => {
    return {
      type: 'fractional-knapsack',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: items.length * 16,
      data: {
        items,
        sortedItems,
        knapsack: [...knapsack],
        currentItem,
        totalValue,
        remainingCapacity: currentCapacity
      }
    }
  }

  steps.push(createStep('init', `Sorted ${items.length} items by value/weight ratio. Initial capacity: ${capacity}.`, null))

  for (const item of sortedItems) {
    statesExplored++
    comparisons++
    
    if (currentCapacity === 0) {
      steps.push(createStep('done', `Knapsack is full.`, null))
      break
    }

    if (item.weight <= currentCapacity) {
      currentCapacity -= item.weight
      totalValue += item.value
      knapsack.push({ item, fraction: 1 })
      operations++
      steps.push(createStep('process', `Took entire item ${item.id} (weight: ${item.weight}, value: ${item.value}). Remaining capacity: ${currentCapacity}.`, item))
    } else {
      const fraction = currentCapacity / item.weight
      const valueAdded = item.value * fraction
      totalValue += valueAdded
      knapsack.push({ item, fraction })
      currentCapacity = 0
      operations++
      steps.push(createStep('process', `Took ${(fraction * 100).toFixed(1)}% of item ${item.id} to fill knapsack. Added value: ${valueAdded.toFixed(2)}.`, item))
    }
  }

  if (currentCapacity > 0) {
     steps.push(createStep('done', `Finished evaluating items. Knapsack not entirely full.`, null))
  }

  return { steps, answer: totalValue }
}

export function runJobScheduling(jobs: Job[]): { steps: GreedyStep[]; answer: number } {
  const steps: GreedyStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const sortedJobs = [...jobs].sort((a, b) => {
    comparisons++
    return b.profit - a.profit
  })
  
  operations += sortedJobs.length * Math.log2(sortedJobs.length || 1)

  const maxDeadline = Math.max(...jobs.map(j => j.deadline), 0)
  const timeline: (Job | null)[] = Array(maxDeadline + 1).fill(null)
  const accepted: Job[] = []
  const rejected: Job[] = []
  let totalProfit = 0

  const createStep = (stepType: GreedyStep['stepType'], note: string, currentJob: Job | null): GreedyStep => {
    return {
      type: 'job-scheduling',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: jobs.length * 12 + maxDeadline * 4,
      data: {
        jobs,
        timeline: [...timeline],
        currentJob,
        accepted: [...accepted],
        rejected: [...rejected]
      }
    }
  }

  steps.push(createStep('init', `Sorted ${jobs.length} jobs by profit descending. Max deadline is ${maxDeadline}.`, null))

  for (const job of sortedJobs) {
    statesExplored++
    let scheduled = false
    
    // Find a free slot, working backwards from deadline
    for (let j = Math.min(maxDeadline, job.deadline); j > 0; j--) {
      comparisons++
      if (timeline[j] === null) {
        timeline[j] = job
        accepted.push(job)
        totalProfit += job.profit
        scheduled = true
        operations++
        steps.push(createStep('process', `Scheduled job ${job.id} (profit: ${job.profit}) at time slot ${j}.`, job))
        break
      }
    }

    if (!scheduled) {
      rejected.push(job)
      operations++
      steps.push(createStep('process', `Could not schedule job ${job.id} by deadline ${job.deadline}. Rejected.`, job))
    }
  }

  steps.push(createStep('done', `Scheduling complete. Total profit: ${totalProfit}.`, null))
  return { steps, answer: totalProfit }
}

export function runPrims(nodes: number, edges: Edge[]): { steps: GreedyStep[]; answer: number } {
  const steps: GreedyStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const adj: [number, number][][] = Array.from({ length: nodes }, () => [])
  edges.forEach(e => {
    adj[e.u].push([e.v, e.weight])
    adj[e.v].push([e.u, e.weight])
  })

  const inMST = Array(nodes).fill(false)
  const mstEdges: Edge[] = []
  const pq: { node: number; parent: number; weight: number }[] = []
  let totalCost = 0

  // Start with node 0 (if exists)
  if (nodes > 0) {
    pq.push({ node: 0, parent: -1, weight: 0 })
  }

  const createStep = (stepType: GreedyStep['stepType'], note: string, currentNode: number | null): GreedyStep => {
    return {
      type: 'prims',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: nodes * 8 + edges.length * 12,
      data: {
        nodes: Array.from({ length: nodes }, (_, i) => i),
        edges,
        mstEdges: [...mstEdges],
        inMST: [...inMST],
        priorityQueue: [...pq].sort((a, b) => a.weight - b.weight),
        currentNode
      }
    }
  }

  steps.push(createStep('init', `Starting Prim's algorithm from node 0.`, 0))

  while (pq.length > 0) {
    pq.sort((a, b) => a.weight - b.weight)
    const { node: u, parent, weight } = pq.shift()!
    
    statesExplored++
    operations++

    if (inMST[u]) continue

    inMST[u] = true
    if (parent !== -1) {
      mstEdges.push({ u: parent, v: u, weight })
      totalCost += weight
      steps.push(createStep('update', `Added edge (${parent}, ${u}) with weight ${weight} to MST.`, u))
    } else {
      steps.push(createStep('process', `Added starting node ${u} to MST.`, u))
    }

    for (const [v, w] of adj[u]) {
      comparisons++
      if (!inMST[v]) {
        pq.push({ node: v, parent: u, weight: w })
        operations++
      }
    }
  }

  steps.push(createStep('done', `Prim's MST complete. Total cost: ${totalCost}.`, null))
  return { steps, answer: totalCost }
}

export function runKruskals(nodes: number, edges: Edge[]): { steps: GreedyStep[]; answer: number } {
  const steps: GreedyStep[] = []
  let comparisons = 0
  let operations = 0
  let statesExplored = 0

  const sortedEdges = [...edges].sort((a, b) => {
    comparisons++
    return a.weight - b.weight
  })
  
  operations += sortedEdges.length * Math.log2(sortedEdges.length || 1)

  const parent = Array.from({ length: nodes }, (_, i) => i)
  const rank = Array(nodes).fill(0)
  const mstEdges: Edge[] = []
  let totalCost = 0

  const find = (i: number): number => {
    operations++
    if (parent[i] === i) return i
    return parent[i] = find(parent[i])
  }

  const union = (i: number, j: number) => {
    const rootI = find(i)
    const rootJ = find(j)
    comparisons++
    if (rootI !== rootJ) {
      operations++
      if (rank[rootI] < rank[rootJ]) {
        parent[rootI] = rootJ
      } else if (rank[rootI] > rank[rootJ]) {
        parent[rootJ] = rootI
      } else {
        parent[rootJ] = rootI
        rank[rootI]++
      }
    }
  }

  const createStep = (stepType: GreedyStep['stepType'], note: string, currentEdge: Edge | null, cycleDetected: boolean): GreedyStep => {
    return {
      type: 'kruskals',
      stepType,
      note,
      comparisons, operations, statesExplored, memoryUsage: nodes * 8 + edges.length * 12,
      data: {
        edges,
        sortedEdges,
        mstEdges: [...mstEdges],
        parent: [...parent],
        rank: [...rank],
        currentEdge,
        cycleDetected
      }
    }
  }

  steps.push(createStep('init', `Sorted ${edges.length} edges by weight. Initialized Union-Find.`, null, false))

  for (const edge of sortedEdges) {
    statesExplored++
    const uRep = find(edge.u)
    const vRep = find(edge.v)
    comparisons++

    if (uRep !== vRep) {
      mstEdges.push(edge)
      totalCost += edge.weight
      union(edge.u, edge.v)
      steps.push(createStep('process', `Edge (${edge.u}, ${edge.v}) with weight ${edge.weight} connects different components. Added to MST.`, edge, false))
    } else {
      steps.push(createStep('process', `Edge (${edge.u}, ${edge.v}) forms a cycle. Skipped.`, edge, true))
    }

    if (mstEdges.length === nodes - 1) {
      break
    }
  }

  steps.push(createStep('done', `Kruskal's MST complete. Total cost: ${totalCost}.`, null, false))
  return { steps, answer: totalCost }
}
