import { AlgorithmTheory, QuizQuestion } from '@/components/algorithm-page-layout';

export const SEARCH_THEORY: Record<string, AlgorithmTheory> = {
  'binary-search': {
    simpleExplanation: "Binary Search is a fast algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.",
    realLifeExample: "Looking up a word in a dictionary. You open it to the middle, see if the word comes before or after that page, and then repeat the process with the remaining half of the dictionary.",
    useCases: "Searching in databases, finding elements in sorted arrays, and debugging (like git bisect to find the commit that introduced a bug).",
    advantages: ["Extremely fast for large datasets.", "Requires no extra memory (can be implemented iteratively)."],
    disadvantages: ["Requires the array to be sorted first.", "Not suitable for linked lists because you can't easily jump to the middle."],
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
    spaceComplexity: "O(1) iterative, O(log n) recursive"
  }
};

export const SEARCH_NAMES: Record<string, string> = {
  'binary-search': 'Binary Search'
};

export const SEARCH_CODE: Record<string, Record<string, string>> = {
  'binary-search': {
    'java': `public int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) {
            return mid;
        }
        
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}`,
    'python': `def binary_search(arr, target):
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
    'c': `int binarySearch(int arr[], int n, int target) {
    int left = 0;
    int right = n - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target)
            return mid;
            
        if (arr[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }
    
    return -1;
}`
  }
};

export const SEARCH_QUIZ: Record<string, QuizQuestion[]> = {
  'binary-search': [
    {
      question: "What is the worst-case time complexity of Binary Search?",
      options: ["O(1)", "O(n)", "O(n log n)", "O(log n)"],
      answer: 3
    },
    {
      question: "What is a prerequisite for using Binary Search on an array?",
      options: ["The array must contain positive numbers only", "The array must be sorted", "The array must not contain duplicates", "The array length must be a power of 2"],
      answer: 1
    },
    {
      question: "Which data structure is least suited for Binary Search?",
      options: ["Array", "Dynamic Array (ArrayList)", "Linked List", "Sorted Array"],
      answer: 2
    },
    {
      question: "Why do we use 'mid = left + (right - left) / 2' instead of 'mid = (left + right) / 2'?",
      options: ["It executes faster", "It prevents integer overflow", "It looks more professional", "It supports floating point numbers"],
      answer: 1
    }
  ]
};
