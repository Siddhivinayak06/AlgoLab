import { AlgorithmTheory, QuizQuestion } from '@/components/algorithm-page-layout';

export const BRANCH_BOUND_THEORY: Record<string, AlgorithmTheory> = {
  '15-puzzle': {
    simpleExplanation: "Branch and Bound solves optimization problems by exploring a tree of possible solutions. It keeps track of the best solution found so far (the 'bound'). If it reaches a node where the best possible outcome is worse than the bound, it 'prunes' that branch and stops exploring it. For the 15-puzzle, it uses an A* search approach with a heuristic like Manhattan distance to guide the search towards the goal state efficiently.",
    realLifeExample: "Playing chess and analyzing future moves. If you realize a certain sequence of moves will definitely result in you losing your queen, you stop thinking about that sequence and focus on other, more promising moves.",
    useCases: "Solving combinatorial optimization problems like the Traveling Salesperson Problem, Knapsack, and sliding puzzles (like the 15-puzzle).",
    advantages: ["Guarantees finding the optimal solution.", "Explores far fewer states than a naive brute-force search by pruning unpromising branches."],
    disadvantages: ["Worst-case time complexity is still exponential.", "Requires finding a 'good' admissible heuristic to be efficient; a bad heuristic means it acts like a slow breadth-first search.", "Requires a lot of memory to store the priority queue of active nodes."],
    timeComplexity: { best: "O(b^d)", average: "O(b^d)", worst: "O(b^d)" }, // Where b is branching factor, d is depth
    spaceComplexity: "O(b^d)"
  }
};

export const BRANCH_BOUND_NAMES: Record<string, string> = {
  '15-puzzle': '15-Puzzle Solver'
};

export const BRANCH_BOUND_CODE: Record<string, Record<string, string>> = {
  '15-puzzle': {
    'java': `// Branch and Bound logic for 15-Puzzle
class Node implements Comparable<Node> {
    int[][] matrix;
    int cost;
    int level;
    
    // ... Node implementation details ...
    
    public int compareTo(Node other) {
        return (this.cost + this.level) - (other.cost + other.level);
    }
}

public void solve(int[][] initial, int[][] goal) {
    PriorityQueue<Node> pq = new PriorityQueue<>();
    // Add root node
    // pq.add(root);
    
    while (!pq.isEmpty()) {
        Node min = pq.poll();
        if (min.cost == 0) {
            // Found solution
            return;
        }
        // Generate children and add to PQ
        // for each valid move:
        //    Node child = newNode(min.matrix, move);
        //    pq.add(child);
    }
}`,
    'python': `import heapq

class Node:
    def __init__(self, matrix, cost, level):
        self.matrix = matrix
        self.cost = cost
        self.level = level
        
    def __lt__(self, other):
        return (self.cost + self.level) < (other.cost + other.level)

def solve(initial, goal):
    pq = []
    # heapq.heappush(pq, Node(initial, calculate_cost(initial, goal), 0))
    
    while pq:
        min_node = heapq.heappop(pq)
        
        if min_node.cost == 0:
            return "Solution Found"
            
        # Generate children
        # for child_matrix in get_children(min_node.matrix):
        #     heapq.heappush(pq, Node(child_matrix, cost, level + 1))`,
    'c': `// Example coming soon for 15-Puzzle in C`
  }
};

export const BRANCH_BOUND_QUIZ: Record<string, QuizQuestion[]> = {
  '15-puzzle': [
    {
      question: "What is the main purpose of the 'Bound' in Branch and Bound?",
      options: ["To limit the maximum depth of the search tree", "To keep track of the best solution found so far and prune worse branches", "To bound the memory usage to O(1)", "To bound the variables to positive integers only"],
      answer: 1
    },
    {
      question: "Which data structure is typically used to implement the 'Branching' step efficiently?",
      options: ["Stack", "Queue", "Priority Queue (Min-Heap)", "Hash Table"],
      answer: 2
    },
    {
      question: "For the 15-puzzle, which heuristic function provides an admissible bound?",
      options: ["Euclidean Distance", "Manhattan Distance", "Counting the number of odd pieces", "Random numbers"],
      answer: 1
    },
    {
      question: "What happens if you use a non-admissible heuristic in Branch and Bound?",
      options: ["The algorithm will crash", "The algorithm will run faster and find the optimal solution", "The algorithm might prune the optimal solution and return a sub-optimal one", "The memory usage will explode immediately"],
      answer: 2
    }
  ]
};
