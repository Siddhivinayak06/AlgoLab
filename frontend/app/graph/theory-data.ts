import { AlgorithmTheory, QuizQuestion } from '@/components/algorithm-page-layout';

export const GRAPH_THEORY: Record<string, AlgorithmTheory> = {
  'multistage': {
    simpleExplanation: "Multistage graph finds the shortest path in a directed graph where vertices are divided into stages. Edges only go from one stage to the next. We calculate the shortest path backwards from the destination stage to the start.",
    realLifeExample: "Planning a cross-country trip where you must stop at specific cities on designated days, choosing the cheapest flight options between consecutive stages.",
    useCases: "Resource allocation, dynamic programming problems that can be represented as multistage decision processes.",
    advantages: ["Solves the problem linearly with respect to vertices and edges by exploiting the graph's structure.", "Avoids recomputing overlapping subproblems."],
    disadvantages: ["Only works for graphs strictly divided into sequential stages with no backward or intra-stage edges."],
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V)"
  },
  'bellman-ford': {
    simpleExplanation: "Bellman-Ford finds the shortest paths from a single source vertex to all other vertices. Unlike Dijkstra's, it works with negative edge weights by repeatedly relaxing all edges (V-1) times.",
    realLifeExample: "Finding the most profitable currency exchange arbitrage route, where some 'distances' (exchange rates) might result in a negative overall cost (a profit loop).",
    useCases: "Distance-vector routing protocols (like RIP), detecting negative weight cycles in graphs, currency arbitrage.",
    advantages: ["Handles negative weight edges.", "Can detect negative weight cycles (which indicate no shortest path exists)."],
    disadvantages: ["Much slower than Dijkstra's algorithm for graphs with only positive weights."],
    timeComplexity: { best: "O(E)", average: "O(V * E)", worst: "O(V * E)" },
    spaceComplexity: "O(V)"
  },
  'floyd-warshall': {
    simpleExplanation: "Floyd-Warshall finds the shortest paths between ALL pairs of vertices simultaneously. It systematically builds up the shortest paths by checking if passing through an intermediate vertex 'k' makes the path between 'i' and 'j' shorter.",
    realLifeExample: "Creating a mileage chart for a road atlas showing the shortest driving distance between every major city pair in the country.",
    useCases: "Network routing, all-pairs shortest paths, checking bipartite-ness or transitivity, finding graph diameter.",
    advantages: ["Finds shortest paths for all pairs at once.", "Very simple to implement (just 3 nested loops).", "Works with negative weights."],
    disadvantages: ["Very slow for large graphs due to O(V³) time complexity.", "Uses a lot of memory (V² matrix)."],
    timeComplexity: { best: "O(V³)", average: "O(V³)", worst: "O(V³)" },
    spaceComplexity: "O(V²)"
  }
};

export const GRAPH_NAMES: Record<string, string> = {
  'multistage': 'Multistage Graph',
  'bellman-ford': 'Bellman-Ford',
  'floyd-warshall': 'Floyd-Warshall'
};

export const GRAPH_CODE: Record<string, Record<string, string>> = {
  'multistage': {
    'java': `public int shortestPath(int[][] graph) {
    int n = graph.length;
    int[] dist = new int[n];
    
    // Start from destination and move backwards
    dist[n - 1] = 0;
    
    for (int i = n - 2; i >= 0; i--) {
        dist[i] = Integer.MAX_VALUE;
        for (int j = i; j < n; j++) {
            if (graph[i][j] != 0 && dist[j] != Integer.MAX_VALUE) {
                dist[i] = Math.min(dist[i], graph[i][j] + dist[j]);
            }
        }
    }
    return dist[0];
}`,
    'python': `def shortest_path(graph):
    n = len(graph)
    dist = [float('inf')] * n
    
    dist[n - 1] = 0
    
    for i in range(n - 2, -1, -1):
        for j in range(n):
            if graph[i][j] != 0:
                dist[i] = min(dist[i], graph[i][j] + dist[j])
                
    return dist[0]`,
    'c': `int shortestPath(int graph[][100], int n) {
    int dist[100];
    
    dist[n - 1] = 0;
    
    for (int i = n - 2; i >= 0; i--) {
        dist[i] = INT_MAX;
        for (int j = i; j < n; j++) {
            if (graph[i][j] != 0 && dist[j] != INT_MAX) {
                if (graph[i][j] + dist[j] < dist[i]) {
                    dist[i] = graph[i][j] + dist[j];
                }
            }
        }
    }
    return dist[0];
}`
  },
  'bellman-ford': {
    'java': `public void bellmanFord(int[][] edges, int V, int src) {
    int[] dist = new int[V];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    
    // Relax all edges V-1 times
    for (int i = 1; i < V; i++) {
        for (int[] edge : edges) {
            int u = edge[0];
            int v = edge[1];
            int weight = edge[2];
            
            if (dist[u] != Integer.MAX_VALUE && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
            }
        }
    }
    
    // Check for negative weight cycles
    for (int[] edge : edges) {
        int u = edge[0];
        int v = edge[1];
        int weight = edge[2];
        if (dist[u] != Integer.MAX_VALUE && dist[u] + weight < dist[v]) {
            System.out.println("Graph contains negative weight cycle");
            return;
        }
    }
}`,
    'python': `def bellman_ford(edges, V, src):
    dist = [float('inf')] * V
    dist[src] = 0
    
    for _ in range(V - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            print("Graph contains negative weight cycle")
            return None
            
    return dist`,
    'c': `void bellmanFord(struct Edge edges[], int V, int E, int src) {
    int dist[V];
    for (int i = 0; i < V; i++) dist[i] = INT_MAX;
    dist[src] = 0;
    
    for (int i = 1; i < V; i++) {
        for (int j = 0; j < E; j++) {
            int u = edges[j].src;
            int v = edges[j].dest;
            int weight = edges[j].weight;
            if (dist[u] != INT_MAX && dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
            }
        }
    }
    
    for (int j = 0; j < E; j++) {
        int u = edges[j].src;
        int v = edges[j].dest;
        int weight = edges[j].weight;
        if (dist[u] != INT_MAX && dist[u] + weight < dist[v]) {
            printf("Graph contains negative weight cycle\\n");
            return;
        }
    }
}`
  },
  'floyd-warshall': {
    'java': `public void floydWarshall(int[][] graph, int V) {
    int[][] dist = new int[V][V];
    
    // Initialize dist matrix
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            dist[i][j] = graph[i][j];
        }
    }
    
    // Main algorithm
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] != Integer.MAX_VALUE && 
                    dist[k][j] != Integer.MAX_VALUE && 
                    dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
}`,
    'python': `def floyd_warshall(graph, V):
    dist = [row[:] for row in graph]
    
    for k in range(V):
        for i in range(V):
            for j in range(V):
                if dist[i][k] != float('inf') and dist[k][j] != float('inf'):
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
                    
    return dist`,
    'c': `void floydWarshall(int graph[][100], int V) {
    int dist[100][100];
    
    for (int i = 0; i < V; i++)
        for (int j = 0; j < V; j++)
            dist[i][j] = graph[i][j];
            
    for (int k = 0; k < V; k++) {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                if (dist[i][k] != INT_MAX && dist[k][j] != INT_MAX && 
                    dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
}`
  }
};

export const GRAPH_QUIZ: Record<string, QuizQuestion[]> = {
  'multistage': [
    {
      question: "What defines a multistage graph?",
      options: ["A graph with multiple negative cycles", "A directed graph divided into sequential stages where edges only connect adjacent stages", "A graph solved in multiple steps", "A fully connected bipartite graph"],
      answer: 1
    },
    {
      question: "Which algorithmic paradigm is typically used to solve the Multistage Graph problem?",
      options: ["Greedy Algorithm", "Dynamic Programming", "Divide and Conquer", "Backtracking"],
      answer: 1
    },
    {
      question: "What is the time complexity of solving a multistage graph problem?",
      options: ["O(V^3)", "O(V + E)", "O(E log V)", "O(V^2)"],
      answer: 1
    }
  ],
  'bellman-ford': [
    {
      question: "What is the main advantage of Bellman-Ford over Dijkstra's algorithm?",
      options: ["It is faster", "It uses less memory", "It handles negative edge weights", "It works on unweighted graphs only"],
      answer: 2
    },
    {
      question: "How many times does Bellman-Ford relax all edges in a graph with V vertices?",
      options: ["V times", "V-1 times", "E times", "log V times"],
      answer: 1
    },
    {
      question: "How does Bellman-Ford detect a negative weight cycle?",
      options: ["By checking if a path length goes below zero", "By running an extra iteration (V-th time) and checking if any distance still updates", "By using a cycle-finding algorithm like Floyd's tortoise and hare", "It cannot detect negative weight cycles"],
      answer: 1
    },
    {
      question: "What is the worst-case time complexity of Bellman-Ford?",
      options: ["O(V + E)", "O(E log V)", "O(V^2)", "O(V * E)"],
      answer: 3
    }
  ],
  'floyd-warshall': [
    {
      question: "What is the primary purpose of the Floyd-Warshall algorithm?",
      options: ["Finding the shortest path from a single source", "Finding shortest paths between all pairs of vertices", "Finding the Minimum Spanning Tree", "Topological sorting"],
      answer: 1
    },
    {
      question: "Which programming technique does Floyd-Warshall use?",
      options: ["Dynamic Programming", "Greedy Approach", "Divide and Conquer", "Backtracking"],
      answer: 0
    },
    {
      question: "What is the time complexity of the Floyd-Warshall algorithm?",
      options: ["O(V^2)", "O(V^3)", "O(V * E)", "O(E log V)"],
      answer: 1
    },
    {
      question: "How many nested loops are required in the standard implementation of Floyd-Warshall?",
      options: ["1", "2", "3", "4"],
      answer: 2
    }
  ]
};
