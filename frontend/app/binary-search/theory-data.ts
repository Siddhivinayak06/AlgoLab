import { AlgorithmTheory, QuizQuestion } from '@/components/algorithm-page-layout';

export const SEARCH_NAMES: Record<string, string> = {
  binary: 'Binary Search',
  linear: 'Linear Search',
  jump: 'Jump Search',
  interpolation: 'Interpolation Search',
  exponential: 'Exponential Search',
  fibonacci: 'Fibonacci Search',
  bfs: 'Breadth-First Search',
  dfs: 'Depth-First Search',
};

export const SEARCH_THEORY: Record<string, AlgorithmTheory> = {
  binary: {
    simpleExplanation: "Binary Search finds an item in a sorted list by repeatedly dividing the search interval in half. It compares the target to the middle element — if smaller, search the left half; if larger, search the right half.",
    realLifeExample: "Looking up a word in a dictionary. You open to the middle, check if your word comes before or after, then repeat with the remaining half.",
    useCases: "Searching in databases, finding elements in sorted arrays, debugging with git bisect, implementing autocomplete suggestions.",
    advantages: ["Extremely fast — O(log n) for large datasets.", "Requires no extra memory when implemented iteratively.", "Simple to implement and understand."],
    disadvantages: ["Requires the array to be sorted first.", "Not suitable for linked lists (no random access).", "Overhead of sorting may negate benefits for small or frequently-changing datasets."],
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
    spaceComplexity: "O(1) iterative, O(log n) recursive"
  },
  linear: {
    simpleExplanation: "Linear Search checks each element one by one from the beginning until the target is found or the end of the list is reached. It is the simplest search algorithm.",
    realLifeExample: "Looking for a specific card by flipping through a deck one card at a time from top to bottom.",
    useCases: "Small datasets, unsorted arrays, linked lists, or when simplicity is more important than speed.",
    advantages: ["Works on both sorted and unsorted data.", "No preprocessing required.", "Simple to implement.", "Works on any data structure (arrays, linked lists, etc.)."],
    disadvantages: ["Very slow for large datasets — O(n).", "Checks every element in the worst case.", "Inefficient compared to logarithmic search algorithms."],
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(1)"
  },
  jump: {
    simpleExplanation: "Jump Search works on sorted arrays by jumping ahead by fixed-size blocks (√n), then performing a linear search backward within the block where the target might exist.",
    realLifeExample: "Reading page numbers in a book: you skip every 10 pages until you overshoot, then go back and check page by page.",
    useCases: "Sorted arrays where binary search's overhead isn't justified, systems where jumping forward is cheaper than random access.",
    advantages: ["Faster than linear search on sorted data.", "Simpler than binary search to implement.", "Optimal block size of √n gives O(√n) complexity."],
    disadvantages: ["Only works on sorted arrays.", "Slower than binary search.", "Performance depends heavily on choosing the right block size."],
    timeComplexity: { best: "O(1)", average: "O(√n)", worst: "O(√n)" },
    spaceComplexity: "O(1)"
  },
  interpolation: {
    simpleExplanation: "Interpolation Search improves on binary search for uniformly distributed sorted data. Instead of always checking the middle, it estimates the target's position based on its value relative to the range.",
    realLifeExample: "Looking for 'Apple' in a phone book — you'd open near the beginning, not the middle, because 'A' is at the start of the alphabet.",
    useCases: "Uniformly distributed sorted datasets, database indexing, large datasets with predictable value distribution.",
    advantages: ["Can be faster than binary search — O(log log n) for uniform data.", "Adapts probe position based on target value.", "Excellent for uniformly distributed data."],
    disadvantages: ["Degrades to O(n) for non-uniform distributions.", "Requires sorted data.", "More complex to implement than binary search.", "Can be slower than binary search if data is skewed."],
    timeComplexity: { best: "O(1)", average: "O(log log n)", worst: "O(n)" },
    spaceComplexity: "O(1)"
  },
  exponential: {
    simpleExplanation: "Exponential Search finds the range where the target might exist by exponentially increasing the search range (1, 2, 4, 8, 16...), then applies binary search within that range.",
    realLifeExample: "Searching for a house number on a long street: you drive 1 block, then 2, then 4, then 8 blocks until you pass the number, then you go back and look carefully in that area.",
    useCases: "Unbounded or infinite sorted lists, when the target is likely near the beginning, online algorithms.",
    advantages: ["Very efficient when target is near the beginning — O(log i) where i is the position.", "Works well for unbounded/infinite arrays.", "Combines benefits of exponential growth and binary search."],
    disadvantages: ["Requires sorted data.", "Slightly more complex than binary search.", "Two-phase approach has higher constant factor."],
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
    spaceComplexity: "O(1)"
  },
  fibonacci: {
    simpleExplanation: "Fibonacci Search uses Fibonacci numbers to divide the array into unequal parts and narrow down the search range. It uses addition and subtraction instead of division, making it efficient on some hardware.",
    realLifeExample: "Like binary search, but instead of splitting in half, you split at Fibonacci number positions (e.g., 1, 1, 2, 3, 5, 8, 13...) — the 'golden ratio' division.",
    useCases: "Systems where division is expensive (old CPUs), sorted arrays, when cache performance matters due to sequential access patterns.",
    advantages: ["Uses only addition/subtraction — avoids costly division.", "O(log n) time complexity.", "Better cache performance than binary search in some scenarios."],
    disadvantages: ["Requires sorted data.", "More complex to implement than binary search.", "Requires pre-computing Fibonacci numbers.", "Rarely faster than binary search on modern hardware."],
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
    spaceComplexity: "O(1)"
  },
  bfs: {
    simpleExplanation: "Breadth-First Search explores an implicit binary tree view of the array level by level using a queue. It visits all nodes at the current depth before moving to the next depth level.",
    realLifeExample: "Searching floor by floor in a building — you check every room on the first floor before going up to the second floor.",
    useCases: "Finding shortest paths in unweighted graphs, web crawling, social network analysis, level-order tree traversal, puzzle solving.",
    advantages: ["Guarantees finding the shortest path in unweighted graphs.", "Complete — will always find a solution if one exists.", "Good for exploring nearby nodes first."],
    disadvantages: ["High memory usage — O(n) for the queue.", "Can be slow on deep or wide trees.", "Not optimal for weighted graphs."],
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(n)"
  },
  dfs: {
    simpleExplanation: "Depth-First Search explores an implicit binary tree view of the array by going as deep as possible along each branch before backtracking. It uses a stack (or recursion) to track the path.",
    realLifeExample: "Exploring a maze by always turning left at every junction — you go as deep as possible before backtracking and trying other paths.",
    useCases: "Cycle detection in graphs, topological sorting, solving puzzles (mazes, Sudoku), checking connectivity, pathfinding in games.",
    advantages: ["Low memory usage — O(log n) for balanced trees.", "Simple to implement with recursion.", "Good for deep searches and exhaustive exploration."],
    disadvantages: ["Does not guarantee shortest path.", "Can get stuck in infinite loops without cycle detection.", "May explore unnecessary deep branches before finding a nearby solution."],
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
    spaceComplexity: "O(n)"
  },
};

export const SEARCH_CODE: Record<string, Record<string, string>> = {
  binary: {
    java: `public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    c: `int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
  },
  linear: {
    java: `public int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
    python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
    c: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`
  },
  jump: {
    java: `public int jumpSearch(int[] arr, int target) {
    int n = arr.length;
    int step = (int) Math.sqrt(n);
    int prev = 0;
    while (arr[Math.min(step, n) - 1] < target) {
        prev = step;
        step += (int) Math.sqrt(n);
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == Math.min(step, n)) return -1;
    }
    if (arr[prev] == target) return prev;
    return -1;
}`,
    python: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
    if arr[prev] == target:
        return prev
    return -1`,
    c: `int jumpSearch(int arr[], int n, int target) {
    int step = (int)sqrt(n);
    int prev = 0;
    while (arr[step < n ? step : n - 1] < target) {
        prev = step;
        step += (int)sqrt(n);
        if (prev >= n) return -1;
    }
    while (arr[prev] < target) {
        prev++;
        if (prev == (step < n ? step : n))
            return -1;
    }
    if (arr[prev] == target) return prev;
    return -1;
}`
  },
  interpolation: {
    java: `public int interpolationSearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        if (lo == hi) {
            if (arr[lo] == target) return lo;
            return -1;
        }
        int pos = lo + ((target - arr[lo]) * (hi - lo))
                     / (arr[hi] - arr[lo]);
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) lo = pos + 1;
        else hi = pos - 1;
    }
    return -1;
}`,
    python: `def interpolation_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi and target >= arr[lo] and target <= arr[hi]:
        if lo == hi:
            return lo if arr[lo] == target else -1
        pos = lo + ((target - arr[lo]) * (hi - lo)
                     // (arr[hi] - arr[lo]))
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            lo = pos + 1
        else:
            hi = pos - 1
    return -1`,
    c: `int interpolationSearch(int arr[], int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
        if (lo == hi) return arr[lo] == target ? lo : -1;
        int pos = lo + ((double)(target - arr[lo]) * (hi - lo))
                     / (arr[hi] - arr[lo]);
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) lo = pos + 1;
        else hi = pos - 1;
    }
    return -1;
}`
  },
  exponential: {
    java: `public int exponentialSearch(int[] arr, int target) {
    int n = arr.length;
    if (arr[0] == target) return 0;
    int i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    // Binary search in range [i/2, min(i, n-1)]
    int lo = i / 2, hi = Math.min(i, n - 1);
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
    python: `def exponential_search(arr, target):
    n = len(arr)
    if arr[0] == target:
        return 0
    i = 1
    while i < n and arr[i] <= target:
        i *= 2
    lo, hi = i // 2, min(i, n - 1)
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    c: `int exponentialSearch(int arr[], int n, int target) {
    if (arr[0] == target) return 0;
    int i = 1;
    while (i < n && arr[i] <= target) i *= 2;
    int lo = i / 2, hi = i < n ? i : n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`
  },
  fibonacci: {
    java: `public int fibonacciSearch(int[] arr, int target) {
    int n = arr.length;
    int fib2 = 0, fib1 = 1, fib = fib2 + fib1;
    while (fib < n) { fib2 = fib1; fib1 = fib; fib = fib2 + fib1; }
    int offset = -1;
    while (fib > 1) {
        int i = Math.min(offset + fib2, n - 1);
        if (arr[i] < target) {
            fib = fib1; fib1 = fib2; fib2 = fib - fib1;
            offset = i;
        } else if (arr[i] > target) {
            fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;
        } else return i;
    }
    if (fib1 == 1 && offset + 1 < n && arr[offset + 1] == target)
        return offset + 1;
    return -1;
}`,
    python: `def fibonacci_search(arr, target):
    n = len(arr)
    fib2, fib1 = 0, 1
    fib = fib2 + fib1
    while fib < n:
        fib2, fib1 = fib1, fib
        fib = fib2 + fib1
    offset = -1
    while fib > 1:
        i = min(offset + fib2, n - 1)
        if arr[i] < target:
            fib, fib1, fib2 = fib1, fib2, fib1 - fib2
            offset = i
        elif arr[i] > target:
            fib, fib1, fib2 = fib2, fib1 - fib2, fib - fib1
        else:
            return i
    if fib1 and offset + 1 < n and arr[offset + 1] == target:
        return offset + 1
    return -1`,
    c: `int fibonacciSearch(int arr[], int n, int target) {
    int fib2 = 0, fib1 = 1, fib = fib2 + fib1;
    while (fib < n) { fib2 = fib1; fib1 = fib; fib = fib2 + fib1; }
    int offset = -1;
    while (fib > 1) {
        int i = offset + fib2 < n - 1 ? offset + fib2 : n - 1;
        if (arr[i] < target) {
            fib = fib1; fib1 = fib2; fib2 = fib - fib1;
            offset = i;
        } else if (arr[i] > target) {
            fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;
        } else return i;
    }
    if (fib1 && offset + 1 < n && arr[offset + 1] == target)
        return offset + 1;
    return -1;
}`
  },
  bfs: {
    java: `// BFS on implicit binary tree view of array
public int bfsSearch(int[] arr, int target) {
    Queue<Integer> queue = new LinkedList<>();
    queue.add(0);
    while (!queue.isEmpty()) {
        int idx = queue.poll();
        if (idx >= arr.length) continue;
        if (arr[idx] == target) return idx;
        int left = 2 * idx + 1;
        int right = 2 * idx + 2;
        if (left < arr.length) queue.add(left);
        if (right < arr.length) queue.add(right);
    }
    return -1;
}`,
    python: `from collections import deque

def bfs_search(arr, target):
    queue = deque([0])
    while queue:
        idx = queue.popleft()
        if idx >= len(arr):
            continue
        if arr[idx] == target:
            return idx
        left = 2 * idx + 1
        right = 2 * idx + 2
        if left < len(arr):
            queue.append(left)
        if right < len(arr):
            queue.append(right)
    return -1`,
    c: `int bfsSearch(int arr[], int n, int target) {
    int queue[n], front = 0, rear = 0;
    queue[rear++] = 0;
    while (front < rear) {
        int idx = queue[front++];
        if (idx >= n) continue;
        if (arr[idx] == target) return idx;
        int left = 2 * idx + 1;
        int right = 2 * idx + 2;
        if (left < n) queue[rear++] = left;
        if (right < n) queue[rear++] = right;
    }
    return -1;
}`
  },
  dfs: {
    java: `// DFS on implicit binary tree view of array
public int dfsSearch(int[] arr, int target) {
    Stack<Integer> stack = new Stack<>();
    stack.push(0);
    while (!stack.isEmpty()) {
        int idx = stack.pop();
        if (idx >= arr.length) continue;
        if (arr[idx] == target) return idx;
        int right = 2 * idx + 2;
        int left = 2 * idx + 1;
        if (right < arr.length) stack.push(right);
        if (left < arr.length) stack.push(left);
    }
    return -1;
}`,
    python: `def dfs_search(arr, target):
    stack = [0]
    while stack:
        idx = stack.pop()
        if idx >= len(arr):
            continue
        if arr[idx] == target:
            return idx
        right = 2 * idx + 2
        left = 2 * idx + 1
        if right < len(arr):
            stack.append(right)
        if left < len(arr):
            stack.append(left)
    return -1`,
    c: `int dfsSearch(int arr[], int n, int target) {
    int stack[n], top = 0;
    stack[top++] = 0;
    while (top > 0) {
        int idx = stack[--top];
        if (idx >= n) continue;
        if (arr[idx] == target) return idx;
        int right = 2 * idx + 2;
        int left = 2 * idx + 1;
        if (right < n) stack[top++] = right;
        if (left < n) stack[top++] = left;
    }
    return -1;
}`
  },
};

export const SEARCH_QUIZ: Record<string, QuizQuestion[]> = {
  binary: [
    { question: "What is the worst-case time complexity of Binary Search?", options: ["O(1)", "O(n)", "O(n log n)", "O(log n)"], answer: 3 },
    { question: "What is a prerequisite for Binary Search?", options: ["Array must have positive numbers", "Array must be sorted", "Array must have no duplicates", "Array length must be power of 2"], answer: 1 },
    { question: "Why use 'mid = left + (right - left) / 2' instead of '(left + right) / 2'?", options: ["Faster execution", "Prevents integer overflow", "Looks cleaner", "Supports floating point"], answer: 1 },
  ],
  linear: [
    { question: "What is the best-case time complexity of Linear Search?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], answer: 2 },
    { question: "Does Linear Search require sorted data?", options: ["Yes, always", "No, it works on unsorted data", "Only for integers", "Only for strings"], answer: 1 },
    { question: "When is Linear Search preferred over Binary Search?", options: ["For large sorted datasets", "For small or unsorted datasets", "Never — Binary Search is always better", "Only for linked lists"], answer: 1 },
  ],
  jump: [
    { question: "What is the optimal block size for Jump Search?", options: ["n", "n/2", "√n", "log n"], answer: 2 },
    { question: "What type of search does Jump Search perform within a block?", options: ["Binary Search", "Linear Search", "Interpolation Search", "Exponential Search"], answer: 1 },
    { question: "Does Jump Search require sorted data?", options: ["No", "Yes", "Only for numbers", "Only in descending order"], answer: 1 },
  ],
  interpolation: [
    { question: "When does Interpolation Search perform best?", options: ["Random data", "Uniformly distributed sorted data", "Reverse sorted data", "Data with many duplicates"], answer: 1 },
    { question: "What is the worst-case time complexity of Interpolation Search?", options: ["O(1)", "O(log n)", "O(log log n)", "O(n)"], answer: 3 },
    { question: "How does Interpolation Search estimate the position?", options: ["Always picks the middle", "Uses Fibonacci numbers", "Uses value distribution to estimate position", "Picks randomly"], answer: 2 },
  ],
  exponential: [
    { question: "What does Exponential Search do first?", options: ["Sort the array", "Find a range by doubling the index", "Binary search the whole array", "Linear search from the end"], answer: 1 },
    { question: "Exponential Search is particularly useful for:", options: ["Unsorted arrays", "Arrays where target is near the beginning", "Very small arrays", "Arrays with negative numbers only"], answer: 1 },
    { question: "What algorithm runs in the second phase of Exponential Search?", options: ["Linear Search", "Jump Search", "Binary Search", "Interpolation Search"], answer: 2 },
  ],
  fibonacci: [
    { question: "What mathematical concept does Fibonacci Search use?", options: ["Prime numbers", "Fibonacci numbers", "Powers of 2", "Factorials"], answer: 1 },
    { question: "Why might Fibonacci Search be preferred over Binary Search?", options: ["It's always faster", "It avoids division operations", "It works on unsorted data", "It uses less memory"], answer: 1 },
    { question: "What is the time complexity of Fibonacci Search?", options: ["O(n)", "O(√n)", "O(log n)", "O(log log n)"], answer: 2 },
  ],
  bfs: [
    { question: "Which data structure does BFS use?", options: ["Stack", "Queue", "Priority Queue", "Hash Map"], answer: 1 },
    { question: "BFS explores nodes in what order?", options: ["Deepest first", "Random order", "Level by level (breadth-first)", "Alphabetical order"], answer: 2 },
    { question: "What is a key advantage of BFS?", options: ["Low memory usage", "Finds shortest path in unweighted graphs", "Works only on sorted data", "Always faster than DFS"], answer: 1 },
  ],
  dfs: [
    { question: "Which data structure does DFS use?", options: ["Queue", "Stack (or recursion)", "Priority Queue", "Linked List"], answer: 1 },
    { question: "DFS explores nodes in what order?", options: ["Level by level", "As deep as possible before backtracking", "Left to right only", "Randomly"], answer: 1 },
    { question: "What is a disadvantage of DFS compared to BFS?", options: ["Uses more memory", "Cannot find any path", "Does not guarantee shortest path", "Cannot handle cycles"], answer: 2 },
  ],
};
