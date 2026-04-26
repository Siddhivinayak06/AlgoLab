import { AlgorithmTheory, QuizQuestion } from '@/components/algorithm-page-layout';

export const DP_THEORY: Record<string, AlgorithmTheory> = {
  'lcs': {
    simpleExplanation: "Longest Common Subsequence (LCS) finds the longest sequence of characters that appear in the same order in two different strings, but not necessarily consecutively. It works by building a 2D table where each cell represents the LCS of the prefixes of the two strings.",
    realLifeExample: "Comparing two text files to find what stayed the same between them (like how 'git diff' works to find added/removed lines while keeping common ones).",
    useCases: "Version control systems (diff), DNA sequence alignment in bioinformatics, spell checkers.",
    advantages: ["Guarantees the optimal solution.", "Can be optimized for space complexity to only use two rows of the DP table if we just need the length."],
    disadvantages: ["Takes O(m*n) time and space, which can be slow and memory-intensive for very long strings."],
    timeComplexity: { best: "O(m*n)", average: "O(m*n)", worst: "O(m*n)" },
    spaceComplexity: "O(m*n)"
  },
  'knapsack': {
    simpleExplanation: "The 0/1 Knapsack problem asks: given a backpack with a weight limit, and items with weights and values, how do you maximize the value without exceeding the weight limit? You either take an item completely (1) or leave it (0). DP solves it by considering the maximum value for every possible capacity up to the limit.",
    realLifeExample: "You are a thief robbing a store with a small bag. You can't fit a huge TV, so you take a laptop and a watch which together are worth more than the TV and fit in the bag.",
    useCases: "Resource allocation, budget planning, selecting the most profitable projects to fund under a budget.",
    advantages: ["Finds the absolute optimal combination of items.", "Space complexity can be optimized to O(W) where W is the capacity."],
    disadvantages: ["Pseudo-polynomial time complexity: it scales with the capacity, so it's very slow if the capacity is a huge number.", "Cannot handle fractional items (unlike the Greedy approach)."],
    timeComplexity: { best: "O(n*W)", average: "O(n*W)", worst: "O(n*W)" },
    spaceComplexity: "O(n*W) normally, O(W) optimized"
  }
};

export const DP_NAMES: Record<string, string> = {
  'lcs': 'Longest Common Subsequence',
  'knapsack': '0/1 Knapsack'
};

export const DP_CODE: Record<string, Record<string, string>> = {
  'lcs': {
    'java': `public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length();
    int n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}`,
    'python': `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
                
    return dp[m][n]`,
    'c': `int longestCommonSubsequence(char * text1, char * text2) {
    int m = strlen(text1);
    int n = strlen(text2);
    int dp[m + 1][n + 1];
    
    for (int i = 0; i <= m; i++) {
        for (int j = 0; j <= n; j++) {
            if (i == 0 || j == 0) {
                dp[i][j] = 0;
            } else if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                int max = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
                dp[i][j] = max;
            }
        }
    }
    
    return dp[m][n];
}`
  },
  'knapsack': {
    'java': `public int knapsack(int W, int[] wt, int[] val, int n) {
    int[][] dp = new int[n + 1][W + 1];
    
    for (int i = 0; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            if (i == 0 || w == 0)
                dp[i][w] = 0;
            else if (wt[i - 1] <= w)
                dp[i][w] = Math.max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);
            else
                dp[i][w] = dp[i - 1][w];
        }
    }
    
    return dp[n][W];
}`,
    'python': `def knapsack(W, wt, val, n):
    dp = [[0 for _ in range(W + 1)] for _ in range(n + 1)]
    
    for i in range(n + 1):
        for w in range(W + 1):
            if i == 0 or w == 0:
                dp[i][w] = 0
            elif wt[i - 1] <= w:
                dp[i][w] = max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]
                
    return dp[n][W]`,
    'c': `int knapsack(int W, int wt[], int val[], int n) {
    int dp[n + 1][W + 1];
    
    for (int i = 0; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            if (i == 0 || w == 0) {
                dp[i][w] = 0;
            } else if (wt[i - 1] <= w) {
                int incl = val[i - 1] + dp[i - 1][w - wt[i - 1]];
                int excl = dp[i - 1][w];
                dp[i][w] = incl > excl ? incl : excl;
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    return dp[n][W];
}`
  }
};

export const DP_QUIZ: Record<string, QuizQuestion[]> = {
  'lcs': [
    {
      question: "What is the key principle behind Dynamic Programming in LCS?",
      options: ["Choosing the locally optimal path", "Sorting the strings first", "Breaking the problem into smaller overlapping subproblems", "Random sampling"],
      answer: 2
    },
    {
      question: "If text1='abc' and text2='def', what is the length of their LCS?",
      options: ["3", "1", "0", "6"],
      answer: 2
    },
    {
      question: "Which of the following problems is LCS most directly useful for?",
      options: ["Shortest path in a graph", "File difference tools (diff)", "Sorting an array", "Finding prime numbers"],
      answer: 1
    }
  ],
  'knapsack': [
    {
      question: "Why is it called '0/1' Knapsack?",
      options: ["It only works with weights of 0 or 1", "You either take an item entirely or leave it entirely", "The time complexity is O(0/1)", "It uses binary arrays"],
      answer: 1
    },
    {
      question: "Can 0/1 Knapsack be solved using a Greedy approach?",
      options: ["Yes, always", "No, greedy approach may yield sub-optimal results", "Only if weights are negative", "Yes, but it takes O(N!) time"],
      answer: 1
    },
    {
      question: "What does pseudo-polynomial time complexity mean for 0/1 Knapsack?",
      options: ["It runs in polynomial time relative to the number of items", "It runs in exponential time", "Its runtime depends on the numeric value of the capacity, not just the number of inputs", "It is O(1) in practice"],
      answer: 2
    }
  ]
};
