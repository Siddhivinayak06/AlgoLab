import { AlgorithmTheory, QuizQuestion } from '@/components/algorithm-page-layout';

export const GREEDY_THEORY: Record<string, AlgorithmTheory> = {
  'dijkstra': {
    simpleExplanation: "Dijkstra's algorithm finds the shortest path from a starting node to all other nodes in a graph. It works greedily by always visiting the closest unvisited node next, and updating the distances to its neighbors.",
    realLifeExample: "GPS navigation finding the fastest route home. It always looks at the next closest intersection rather than exploring roads going in the opposite direction.",
    useCases: "Routing protocols (OSPF), maps/navigation, finding shortest paths in social networks.",
    advantages: ["Guarantees the shortest path in graphs with non-negative edge weights.", "Can stop early if you only need the path to a specific target."],
    disadvantages: ["Fails if the graph has negative edge weights.", "Can be slow (explores blindly in all directions) compared to A* which uses heuristics."],
    timeComplexity: { best: "O((V+E) log V)", average: "O((V+E) log V)", worst: "O(V²)" },
    spaceComplexity: "O(V) for the priority queue and distance array"
  },
  'knapsack': {
    simpleExplanation: "Fractional Knapsack maximizes the value of items placed in a knapsack of limited capacity. Unlike 0/1 knapsack, you can take fractions of items. The greedy approach sorts items by their value-to-weight ratio and takes as much of the highest-ratio items as possible.",
    realLifeExample: "Filling a bag with valuable powders (like gold dust or flour) where you can scoop out exact amounts, prioritizing the most expensive powder per ounce.",
    useCases: "Resource allocation where resources are continuous (liquid, weight, time), maximizing return on continuous investments.",
    advantages: ["Optimal for the fractional knapsack problem.", "Very fast, mostly just sorting the items."],
    disadvantages: ["Does NOT work for the 0/1 Knapsack problem (where you must take whole items)."],
    timeComplexity: { best: "O(N log N)", average: "O(N log N)", worst: "O(N log N)" },
    spaceComplexity: "O(1) if sorting in-place, O(N) otherwise"
  },
  'job-scheduling': {
    simpleExplanation: "Job Sequencing with Deadlines schedules a set of jobs, each taking 1 unit of time and having a deadline and a profit. The goal is to maximize total profit by doing jobs before their deadlines. The greedy choice is to sort jobs by profit (descending) and schedule them as close to their deadlines as possible.",
    realLifeExample: "Prioritizing high-paying freelance gigs with approaching deadlines over lower-paying ones, doing the most lucrative ones first on the last possible day to leave earlier days open.",
    useCases: "Task scheduling in operating systems, manufacturing plant schedules, maximizing revenue in time-constrained environments.",
    advantages: ["Simple and fast heuristic for finding maximum profit.", "Optimal if all jobs take exactly 1 unit of time."],
    disadvantages: ["Not optimal if jobs take different amounts of time.", "Requires keeping track of free time slots."],
    timeComplexity: { best: "O(N log N)", average: "O(N²)", worst: "O(N²)" },
    spaceComplexity: "O(N) to store the schedule slots"
  },
  'prim': {
    simpleExplanation: "Prim's algorithm finds a Minimum Spanning Tree (MST) for a weighted undirected graph. It builds the tree one vertex at a time, from an arbitrary starting vertex, at each step adding the cheapest possible connection from the tree to another vertex.",
    realLifeExample: "Connecting a new neighborhood to the power grid using the least amount of expensive copper wire, expanding from the main generator one house at a time.",
    useCases: "Network design (LAN, water, electrical), clustering algorithms, approximating the Traveling Salesperson Problem.",
    advantages: ["Guarantees finding the Minimum Spanning Tree.", "Faster than Kruskal's for dense graphs (many edges)."],
    disadvantages: ["Harder to parallelize than Kruskal's.", "Only works on connected graphs (or finds MST for one connected component)."],
    timeComplexity: { best: "O((V+E) log V)", average: "O((V+E) log V)", worst: "O(V²)" },
    spaceComplexity: "O(V) for tracking included vertices and priority queue"
  },
  'kruskal': {
    simpleExplanation: "Kruskal's algorithm also finds a Minimum Spanning Tree. It sorts all edges in the graph from lowest weight to highest weight, and iteratively adds the next lowest edge to the tree as long as it doesn't create a cycle.",
    realLifeExample: "Building a network of roads between isolated towns, starting by paving the shortest dirt paths first, and skipping any path that connects towns already linked indirectly.",
    useCases: "Network design, clustering (like single-linkage clustering), used when edges are already sorted or easily sortable.",
    advantages: ["Guarantees finding the Minimum Spanning Tree.", "Great for sparse graphs.", "Naturally finds Minimum Spanning Forests if the graph is disconnected."],
    disadvantages: ["Requires sorting all edges first.", "Requires a Disjoint-Set (Union-Find) data structure to efficiently check for cycles."],
    timeComplexity: { best: "O(E log E)", average: "O(E log E)", worst: "O(E log E)" },
    spaceComplexity: "O(V) for the Union-Find data structure"
  }
};

export const GREEDY_NAMES: Record<string, string> = {
  'dijkstra': "Dijkstra's Shortest Path",
  'knapsack': 'Fractional Knapsack',
  'job-scheduling': 'Job Scheduling',
  'prim': "Prim's MST",
  'kruskal': "Kruskal's MST"
};

export const GREEDY_CODE: Record<string, Record<string, string>> = {
  'dijkstra': {
    'java': `public void dijkstra(int graph[][], int src) {
    int V = graph.length;
    int dist[] = new int[V];
    Boolean sptSet[] = new Boolean[V];

    for (int i = 0; i < V; i++) {
        dist[i] = Integer.MAX_VALUE;
        sptSet[i] = false;
    }
    dist[src] = 0;

    for (int count = 0; count < V - 1; count++) {
        int u = minDistance(dist, sptSet, V);
        sptSet[u] = true;
        for (int v = 0; v < V; v++)
            if (!sptSet[v] && graph[u][v] != 0 && dist[u] != Integer.MAX_VALUE 
                && dist[u] + graph[u][v] < dist[v])
                dist[v] = dist[u] + graph[u][v];
    }
}`,
    'python': `import heapq

def dijkstra(graph, src):
    V = len(graph)
    dist = [float('inf')] * V
    dist[src] = 0
    pq = [(0, src)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue

        for v in range(V):
            weight = graph[u][v]
            if weight > 0 and dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
    return dist`,
    'c': `void dijkstra(int graph[100][100], int V, int src) {
    int dist[100];
    bool sptSet[100];

    for (int i = 0; i < V; i++) {
        dist[i] = INT_MAX;
        sptSet[i] = false;
    }
    dist[src] = 0;

    for (int count = 0; count < V - 1; count++) {
        int min = INT_MAX, u = -1;
        for (int v = 0; v < V; v++)
            if (sptSet[v] == false && dist[v] <= min)
                min = dist[v], u = v;

        sptSet[u] = true;

        for (int v = 0; v < V; v++)
            if (!sptSet[v] && graph[u][v] && dist[u] != INT_MAX 
                && dist[u] + graph[u][v] < dist[v])
                dist[v] = dist[u] + graph[u][v];
    }
}`
  },
  'knapsack': {
    'java': `class Item {
    int value, weight;
    Item(int v, int w) { value = v; weight = w; }
}

public double getMaxValue(Item[] items, int capacity) {
    Arrays.sort(items, (a, b) -> Double.compare((double)b.value/b.weight, (double)a.value/a.weight));
    double totalValue = 0d;
    
    for (Item i : items) {
        int curWt = i.weight;
        int curVal = i.value;
        if (capacity - curWt >= 0) {
            capacity -= curWt;
            totalValue += curVal;
        } else {
            totalValue += curVal * ((double)capacity / curWt);
            break;
        }
    }
    return totalValue;
}`,
    'python': `def fractional_knapsack(value, weight, capacity):
    index = list(range(len(value)))
    ratio = [v/w for v, w in zip(value, weight)]
    index.sort(key=lambda i: ratio[i], reverse=True)
    
    max_value = 0
    for i in index:
        if weight[i] <= capacity:
            max_value += value[i]
            capacity -= weight[i]
        else:
            max_value += value[i] * (capacity / weight[i])
            break
    return max_value`,
    'c': `struct Item { int value, weight; };

int cmp(const void *a, const void *b) {
    struct Item *a1 = (struct Item *)a;
    struct Item *a2 = (struct Item *)b;
    double r1 = (double)a1->value / a1->weight;
    double r2 = (double)a2->value / a2->weight;
    return (r1 < r2) ? 1 : -1;
}

double fractionalKnapsack(int W, struct Item arr[], int n) {
    qsort(arr, n, sizeof(arr[0]), cmp);
    double finalvalue = 0.0;
    
    for (int i = 0; i < n; i++) {
        if (arr[i].weight <= W) {
            W -= arr[i].weight;
            finalvalue += arr[i].value;
        } else {
            finalvalue += arr[i].value * ((double)W / arr[i].weight);
            break;
        }
    }
    return finalvalue;
}`
  },
  'job-scheduling': {
    'java': `// Example coming soon`,
    'python': `// Example coming soon`,
    'c': `// Example coming soon`
  },
  'prim': {
    'java': `// Example coming soon`,
    'python': `// Example coming soon`,
    'c': `// Example coming soon`
  },
  'kruskal': {
    'java': `// Example coming soon`,
    'python': `// Example coming soon`,
    'c': `// Example coming soon`
  }
};

export const GREEDY_QUIZ: Record<string, QuizQuestion[]> = {
  'dijkstra': [
    {
      question: "What is the defining characteristic of Dijkstra's algorithm?",
      options: ["It works with negative weights", "It uses a greedy approach picking the minimum distance node next", "It finds shortest paths between all pairs", "It uses dynamic programming"],
      answer: 1
    },
    {
      question: "Which data structure is most commonly used to optimize Dijkstra's algorithm?",
      options: ["Stack", "Hash Map", "Priority Queue / Min-Heap", "Linked List"],
      answer: 2
    },
    {
      question: "What happens if a graph has negative edge weights in Dijkstra's algorithm?",
      options: ["It runs faster", "It converts them to positive", "It may produce incorrect shortest paths", "It detects the negative cycle and aborts"],
      answer: 2
    }
  ],
  'knapsack': [
    {
      question: "How does the Greedy approach solve the Fractional Knapsack problem?",
      options: ["By picking items with the lowest weight first", "By picking items with the highest value first", "By picking items based on the highest value-to-weight ratio", "By picking items randomly"],
      answer: 2
    },
    {
      question: "What is the time complexity of the Fractional Knapsack algorithm (assuming sorting is required)?",
      options: ["O(N)", "O(N log N)", "O(N^2)", "O(W) where W is capacity"],
      answer: 1
    },
    {
      question: "Why does the Greedy approach fail for 0/1 Knapsack?",
      options: ["Because you cannot take fractions, leaving empty wasted space", "Because negative weights exist", "Because the items are infinite", "Because it is an NP-hard problem"],
      answer: 0
    }
  ],
  'job-scheduling': [
    {
      question: "In Job Sequencing with Deadlines, what is the greedy choice?",
      options: ["Sort jobs by deadline", "Sort jobs by profit descending", "Sort jobs by profit ascending", "Sort jobs by duration"],
      answer: 1
    },
    {
      question: "Where should you ideally schedule a job to maximize the availability for other jobs?",
      options: ["At the very beginning (time 0)", "As close to its deadline as possible", "Exactly in the middle", "It doesn't matter"],
      answer: 1
    }
  ],
  'prim': [
    {
      question: "Prim's algorithm builds the Minimum Spanning Tree by:",
      options: ["Sorting all edges", "Adding the cheapest edge connected to the growing tree", "Removing the most expensive edge", "Connecting all vertices simultaneously"],
      answer: 1
    },
    {
      question: "Prim's algorithm is functionally very similar to which other algorithm?",
      options: ["Kruskal's Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm", "Bellman-Ford Algorithm"],
      answer: 1
    }
  ],
  'kruskal': [
    {
      question: "What is the first step in Kruskal's algorithm?",
      options: ["Pick a random vertex", "Sort all edges by weight", "Initialize a distance array", "Create a matrix"],
      answer: 1
    },
    {
      question: "Which data structure is essential for efficiently detecting cycles in Kruskal's algorithm?",
      options: ["Priority Queue", "Adjacency List", "Disjoint Set (Union-Find)", "Binary Search Tree"],
      answer: 2
    }
  ]
};
