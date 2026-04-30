import { AlgorithmTheory, QuizQuestion } from '@/components/algorithm-page-layout';

export const BACKTRACKING_THEORY: Record<string, AlgorithmTheory> = {
  'n-queens': {
    simpleExplanation: "The N-Queens puzzle is the problem of placing N chess queens on an N×N chessboard so that no two queens threaten each other. Backtracking explores all potential arrangements, placing queens row by row. If a placement leads to a conflict later on, it 'backtracks', removes the last placed queen, and tries the next safe spot.",
    realLifeExample: "Trying to seat guests at a dinner party where certain people hate each other. You seat them one by one, and if you realize the current arrangement will inevitably seat enemies together, you ask the last person to move to a different seat.",
    useCases: "Solving constraint satisfaction problems (like Sudoku, crosswords), scheduling, and circuit design.",
    advantages: ["Guarantees finding all possible solutions (or the best one).", "Much faster than brute-force because it eliminates invalid branches early (pruning)."],
    disadvantages: ["Still has exponential time complexity O(N!), making it too slow for very large values of N.", "Can consume a lot of stack memory due to deep recursion."],
    timeComplexity: { best: "O(N!)", average: "O(N!)", worst: "O(N!)" },
    spaceComplexity: "O(N) for recursion stack and board state"
  },
  'sum-of-subsets': {
    simpleExplanation: "Given a set of non-negative integers and a target sum, find all subsets that add up to exactly the target sum. Backtracking systematically includes or excludes each number from the set. If the running sum exceeds the target, it immediately backtracks.",
    realLifeExample: "Trying to exactly spend a specific gift card balance by trying different combinations of items in a store, putting items back on the shelf if your cart goes over the balance.",
    useCases: "Cryptography (knapsack cryptosystem), subset sum problem, resource allocation where exact amounts are required.",
    advantages: ["Finds all possible combinations.", "Pruning makes it significantly faster than pure brute-force O(2^N)."],
    disadvantages: ["Exponential time complexity in the worst case (when target sum is large and many subsets exist)."],
    timeComplexity: { best: "O(2^N)", average: "O(2^N)", worst: "O(2^N)" },
    spaceComplexity: "O(N) for recursion stack"
  },
  'graph-coloring': {
    simpleExplanation: "Assign colors to the vertices of a graph such that no two adjacent vertices share the same color, using at most 'm' colors. Backtracking tries coloring vertices one by one. If a vertex cannot be colored without conflicting, it backtracks and changes the color of the previous vertex.",
    realLifeExample: "Coloring a political map so no two bordering countries have the same color, or scheduling exams so no student has two exams at the same time.",
    useCases: "Map coloring, scheduling problems, register allocation in compilers, frequency assignment in cellular networks.",
    advantages: ["Solves the m-coloring problem exactly.", "Early pruning prevents checking clearly invalid colorings."],
    disadvantages: ["Finding the chromatic number (minimum colors needed) is NP-hard. Worst-case is O(m^V)."],
    timeComplexity: { best: "O(m^V)", average: "O(m^V)", worst: "O(m^V)" },
    spaceComplexity: "O(V) for the color array and recursion stack"
  },
  'tsp': {
    simpleExplanation: "The Traveling Salesperson Problem asks: given a list of cities and the distances between them, what is the shortest possible route that visits each city exactly once and returns to the origin city? Backtracking tries all valid paths and keeps track of the minimum cost found so far.",
    realLifeExample: "A delivery driver trying to find the most fuel-efficient route to drop off packages at 10 different houses and return to the warehouse.",
    useCases: "Logistics and routing, manufacturing (drilling holes in circuit boards), DNA sequencing.",
    advantages: ["Guarantees the exact optimal route (unlike greedy nearest-neighbor which only approximates)."],
    disadvantages: ["Extremely slow. O(N!) complexity makes it impossible to use for anything more than ~20 cities without advanced Branch & Bound optimizations."],
    timeComplexity: { best: "O(N!)", average: "O(N!)", worst: "O(N!)" },
    spaceComplexity: "O(N) for recursion stack"
  }
};

export const BACKTRACKING_NAMES: Record<string, string> = {
  'n-queens': 'N-Queens Problem',
  'sum-of-subsets': 'Sum of Subsets',
  'graph-coloring': 'Graph Coloring',
  'tsp': 'Traveling Salesperson (TSP)'
};

export const BACKTRACKING_CODE: Record<string, Record<string, string>> = {
  'n-queens': {
    'java': `public class NQueens {
    public void solve(int n) {
        int[] board = new int[n];
        placeQueen(board, 0, n);
    }

    private void placeQueen(int[] board, int row, int n) {
        if (row == n) {
            printSolution(board);
            return;
        }
        for (int col = 0; col < n; col++) {
            if (isSafe(board, row, col)) {
                board[row] = col;
                placeQueen(board, row + 1, n);
            }
        }
    }

    private boolean isSafe(int[] board, int row, int col) {
        for (int i = 0; i < row; i++) {
            if (board[i] == col || Math.abs(board[i] - col) == Math.abs(i - row)) {
                return false;
            }
        }
        return true;
    }
}`,
    'python': `def solve_n_queens(n):
    def is_safe(board, row, col):
        for i in range(row):
            if board[i] == col or abs(board[i] - col) == abs(i - row):
                return False
        return True

    def place_queen(board, row):
        if row == n:
            print(board)
            return
        for col in range(n):
            if is_safe(board, row, col):
                board[row] = col
                place_queen(board, row + 1)

    place_queen([0] * n, 0)`,
    'c': `#include <stdbool.h>
#include <math.h>

bool isSafe(int board[], int row, int col) {
    for (int i = 0; i < row; i++) {
        if (board[i] == col || abs(board[i] - col) == abs(i - row))
            return false;
    }
    return true;
}

void placeQueen(int board[], int row, int n) {
    if (row == n) {
        // Print solution
        return;
    }
    for (int col = 0; col < n; col++) {
        if (isSafe(board, row, col)) {
            board[row] = col;
            placeQueen(board, row + 1, n);
        }
    }
}`
  },
  'sum-of-subsets': {
    'java': `public void sumOfSubsets(int[] set, int target) {
    Arrays.sort(set);
    solve(set, target, 0, 0, new ArrayList<>());
}
void solve(int[] set, int target, int idx, int sum, List<Integer> subset) {
    if (sum == target) { System.out.println(subset); return; }
    for (int i = idx; i < set.length; i++) {
        if (sum + set[i] > target) break;
        subset.add(set[i]);
        solve(set, target, i + 1, sum + set[i], subset);
        subset.remove(subset.size() - 1);
    }
}`,
    'python': `def sum_of_subsets(nums, target):
    nums.sort()
    result = []
    def backtrack(start, current, total):
        if total == target:
            result.append(current[:])
            return
        for i in range(start, len(nums)):
            if total + nums[i] > target:
                break
            current.append(nums[i])
            backtrack(i + 1, current, total + nums[i])
            current.pop()
    backtrack(0, [], 0)
    return result`,
    'c': `void solve(int set[], int n, int target, int idx, int sum,
           int subset[], int subSize) {
    if (sum == target) {
        for (int i = 0; i < subSize; i++) printf("%d ", subset[i]);
        printf("\\n"); return;
    }
    for (int i = idx; i < n; i++) {
        if (sum + set[i] > target) break;
        subset[subSize] = set[i];
        solve(set, n, target, i+1, sum+set[i], subset, subSize+1);
    }
}`
  },
  'graph-coloring': {
    'java': `public boolean graphColoring(int[][] graph, int m, int V) {
    int[] color = new int[V];
    return solve(graph, m, color, 0, V);
}
boolean isSafe(int[][] graph, int[] color, int v, int c, int V) {
    for (int i = 0; i < V; i++)
        if (graph[v][i] == 1 && color[i] == c) return false;
    return true;
}
boolean solve(int[][] graph, int m, int[] color, int v, int V) {
    if (v == V) return true;
    for (int c = 1; c <= m; c++) {
        if (isSafe(graph, color, v, c, V)) {
            color[v] = c;
            if (solve(graph, m, color, v + 1, V)) return true;
            color[v] = 0;
        }
    }
    return false;
}`,
    'python': `def graph_coloring(graph, m, V):
    color = [0] * V
    def is_safe(v, c):
        for i in range(V):
            if graph[v][i] == 1 and color[i] == c:
                return False
        return True
    def solve(v):
        if v == V: return True
        for c in range(1, m + 1):
            if is_safe(v, c):
                color[v] = c
                if solve(v + 1): return True
                color[v] = 0
        return False
    return solve(0)`,
    'c': `bool isSafe(int graph[100][100], int color[], int v, int c, int V) {
    for (int i = 0; i < V; i++)
        if (graph[v][i] && color[i] == c) return false;
    return true;
}
bool solve(int graph[100][100], int m, int color[], int v, int V) {
    if (v == V) return true;
    for (int c = 1; c <= m; c++) {
        if (isSafe(graph, color, v, c, V)) {
            color[v] = c;
            if (solve(graph, m, color, v+1, V)) return true;
            color[v] = 0;
        }
    }
    return false;
}`
  },
  'tsp': {
    'java': `int minCost = Integer.MAX_VALUE;
public void tsp(int[][] graph, boolean[] visited, int curr, int n, int count, int cost) {
    if (count == n && graph[curr][0] > 0) {
        minCost = Math.min(minCost, cost + graph[curr][0]);
        return;
    }
    for (int i = 0; i < n; i++) {
        if (!visited[i] && graph[curr][i] > 0) {
            visited[i] = true;
            tsp(graph, visited, i, n, count + 1, cost + graph[curr][i]);
            visited[i] = false;
        }
    }
}`,
    'python': `def tsp(graph, n):
    min_cost = [float('inf')]
    visited = [False] * n
    visited[0] = True
    def solve(curr, count, cost):
        if count == n and graph[curr][0] > 0:
            min_cost[0] = min(min_cost[0], cost + graph[curr][0])
            return
        for i in range(n):
            if not visited[i] and graph[curr][i] > 0:
                visited[i] = True
                solve(i, count + 1, cost + graph[curr][i])
                visited[i] = False
    solve(0, 1, 0)
    return min_cost[0]`,
    'c': `int minCost = INT_MAX;
void tsp(int graph[100][100], bool visited[], int curr,
         int n, int count, int cost) {
    if (count == n && graph[curr][0]) {
        if (cost + graph[curr][0] < minCost)
            minCost = cost + graph[curr][0];
        return;
    }
    for (int i = 0; i < n; i++) {
        if (!visited[i] && graph[curr][i]) {
            visited[i] = true;
            tsp(graph, visited, i, n, count+1, cost+graph[curr][i]);
            visited[i] = false;
        }
    }
}`
  }
};

export const BACKTRACKING_QUIZ: Record<string, QuizQuestion[]> = {
  'n-queens': [
    {
      question: "What is the primary optimization that Backtracking provides over brute force in N-Queens?",
      options: ["It uses dynamic programming to cache results", "It immediately stops exploring a path (prunes) as soon as a queen is threatened", "It uses greedy choice to pick the best column", "It only checks diagonals"],
      answer: 1
    },
    {
      question: "How many queens are placed on the board in the N-Queens problem?",
      options: ["8", "N-1", "N", "N^2"],
      answer: 2
    },
    {
      question: "What is the time complexity of the N-Queens backtracking algorithm?",
      options: ["O(N^2)", "O(N log N)", "O(N!)", "O(2^N)"],
      answer: 2
    }
  ],
  'sum-of-subsets': [
    {
      question: "When does the Sum of Subsets backtracking algorithm prune a branch?",
      options: ["When the current sum exactly matches the target", "When the current sum exceeds the target", "When all elements have been added", "When the array is sorted"],
      answer: 1
    },
    {
      question: "What makes Sum of Subsets an NP-Complete problem?",
      options: ["It requires sorting the input array", "There is no known polynomial-time solution for the worst case", "It uses recursion", "It only works with positive integers"],
      answer: 1
    }
  ],
  'graph-coloring': [
    {
      question: "In graph coloring, what is the 'chromatic number'?",
      options: ["The maximum number of colors allowed", "The minimum number of colors needed to color the graph without conflicts", "The number of vertices in the graph", "The number of edges connected to a vertex"],
      answer: 1
    },
    {
      question: "What is a valid constraint for Graph Coloring?",
      options: ["No two vertices can have the same color", "No two adjacent vertices can share the same color", "All vertices must use different colors", "Every color must be used at least once"],
      answer: 1
    }
  ],
  'tsp': [
    {
      question: "What is the primary goal of the Traveling Salesperson Problem?",
      options: ["Visit every city without crossing paths", "Find the shortest path visiting every city exactly once and returning to the start", "Find the longest path without cycles", "Find the cheapest direct flight between two specific cities"],
      answer: 1
    },
    {
      question: "Why is Backtracking rarely used for TSP in large real-world scenarios?",
      options: ["Because it is inaccurate", "Because it cannot handle directed graphs", "Because O(N!) time complexity makes it far too slow for N > 20", "Because Greedy algorithms always find the optimal solution faster"],
      answer: 2
    }
  ]
};
