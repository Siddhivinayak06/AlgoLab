import { AlgorithmTheory, QuizQuestion } from '@/components/algorithm-page-layout';

export const ALGORITHM_THEORY: Record<string, AlgorithmTheory> = {
  'bubble': {
    simpleExplanation: "Bubble sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted. The algorithm, which is a comparison sort, is named for the way smaller or larger elements 'bubble' to the top of the list.",
    realLifeExample: "People standing in a line randomly and trying to organize themselves by height. Each person compares themselves to the person next to them and swaps places if they are taller.",
    useCases: "Educational purposes, small datasets, or nearly sorted arrays where it only takes one pass (O(n) best case) to verify it's sorted.",
    advantages: ["Extremely simple to understand and implement.", "In-place sorting algorithm (requires O(1) memory).", "Stable sort (maintains relative order of equal elements)."],
    disadvantages: ["Extremely slow for large datasets.", "High number of swaps can be costly in some systems."],
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)"
  },
  'quick': {
    simpleExplanation: "Quick sort picks an element as a 'pivot' and partitions the given array around the picked pivot. It places the pivot in its correct position in the sorted array, and places all smaller elements to the left of the pivot, and all greater elements to the right of the pivot. It then recursively sorts the sub-arrays.",
    realLifeExample: "Sorting a stack of test papers alphabetically. You pick a random paper (e.g., 'M'), put all papers starting with A-L in one pile, N-Z in another, and then repeat this process for each smaller pile.",
    useCases: "General purpose sorting in standard libraries (like C's qsort, Java's Arrays.sort for primitives) because it's very fast in practice.",
    advantages: ["Very fast in practice with O(n log n) average time.", "In-place sorting algorithm.", "Cache-friendly."],
    disadvantages: ["Worst-case is O(n²) if the pivot choices are poor (e.g. array is already sorted and we pick the last element).", "Not a stable sort."],
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
    spaceComplexity: "O(log n) recursive stack"
  },
  // Add placeholders for others to keep it concise for now
  'selection': {
    simpleExplanation: "Selection sort repeatedly finds the minimum element from the unsorted part and puts it at the beginning.",
    realLifeExample: "Sorting a deck of cards by looking through the whole deck to find the lowest card, pulling it out, and placing it in a new sorted pile.",
    useCases: "When memory write operations are extremely costly (it only makes O(n) swaps).",
    advantages: ["Never makes more than O(n) swaps.", "In-place sorting algorithm."],
    disadvantages: ["O(n²) time complexity even if the array is already sorted.", "Not a stable sort."],
    timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)"
  },
  'insertion': {
    simpleExplanation: "Builds the sorted array one item at a time. It takes each element and inserts it into its correct position in the already-sorted part of the array.",
    realLifeExample: "Sorting playing cards in your hand. You pick up one card at a time and insert it into the correct position among the cards you're already holding.",
    useCases: "Small datasets, or datasets that are already mostly sorted.",
    advantages: ["Efficient for small data sets.", "Adaptive: O(n) time when substantially sorted.", "Stable sort."],
    disadvantages: ["O(n²) time complexity makes it slow for large datasets."],
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)"
  },
  'merge': {
    simpleExplanation: "Divide and conquer algorithm that splits the array in half, recursively sorts the two halves, and then merges the sorted halves together.",
    realLifeExample: "Two people separately sorting half a stack of papers each, and then a third person combines the two sorted stacks into one perfectly sorted stack.",
    useCases: "Sorting linked lists, external sorting (datasets too large to fit in RAM).",
    advantages: ["Guaranteed O(n log n) time complexity.", "Stable sort."],
    disadvantages: ["Requires O(n) extra space to hold the merged arrays.", "Slower than QuickSort in practice for arrays due to memory allocations."],
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(n)"
  },
  'heap': {
    simpleExplanation: "Converts the array into a max-heap data structure. The largest element is at the root. It swaps the root with the last element, shrinks the heap size, and 'heapifies' the root to maintain the heap property. Repeats until sorted.",
    useCases: "When consistent O(n log n) time is required with strictly O(1) auxiliary space.",
    advantages: ["Guaranteed O(n log n) performance.", "In-place algorithm."],
    realLifeExample: "Organizing a tournament bracket where the winner always rises to the top, then extracting the winner and re-running the tournament for the rest.",
    disadvantages: ["Not stable.", "Slower in practice than QuickSort due to poor cache locality."],
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(1)"
  },
  'shell': {
    simpleExplanation: "An optimization of insertion sort that allows the exchange of items that are far apart. It sorts elements separated by a 'gap', gradually reducing the gap until it becomes 1 (which is just standard insertion sort).",
    realLifeExample: "Doing a rough sort by organizing items into broad categories first, then doing a fine sort within those categories.",
    useCases: "Medium-sized arrays where setting up QuickSort's recursion stack might be overkill.",
    advantages: ["Faster than O(n²) algorithms.", "In-place sorting.", "Adaptive."],
    disadvantages: ["Performance heavily depends on the gap sequence used.", "Not stable."],
    timeComplexity: { best: "O(n log n)", average: "Depends on gap sequence", worst: "O(n^(4/3)) or O(n^(3/2))" },
    spaceComplexity: "O(1)"
  },
  'counting': {
    simpleExplanation: "An integer sorting algorithm that works by counting the number of objects that have distinct key values, then calculating the prefix sums to determine positions.",
    realLifeExample: "Sorting a giant pile of coins by putting all pennies in one bucket, nickels in another, dimes in another, then lining them up.",
    useCases: "When the range of input keys is not significantly greater than the number of objects to be sorted.",
    advantages: ["O(n + k) linear time complexity where k is the range of inputs.", "Stable sort."],
    disadvantages: ["Only works for integers or discrete values.", "Requires O(n + k) extra space.", "Terrible if the range k is very large (e.g. sorting 1 and 1,000,000)."],
    timeComplexity: { best: "O(n + k)", average: "O(n + k)", worst: "O(n + k)" },
    spaceComplexity: "O(n + k)"
  },
  'radix': {
    simpleExplanation: "Sorts numbers digit by digit, starting from the least significant digit to the most significant digit, using a stable sort like counting sort as a subroutine.",
    realLifeExample: "Sorting zip codes: first sort everyone by the last digit of their zip code, then by the second-to-last digit, and so on.",
    useCases: "Sorting large lists of integers or strings of fixed length.",
    advantages: ["Linear time complexity O(d * (n + b)) where d is digits, b is base.", "Stable sort."],
    disadvantages: ["Requires extra space.", "Performance depends heavily on the length of the keys (d)."],
    timeComplexity: { best: "O(d * (n + b))", average: "O(d * (n + b))", worst: "O(d * (n + b))" },
    spaceComplexity: "O(n + b)"
  },
  'bucket': {
    simpleExplanation: "Distributes elements into a number of 'buckets'. Each bucket is then sorted individually, either using a different sorting algorithm or recursively applying bucket sort.",
    realLifeExample: "Sorting mail in a post office: first throw mail into bins based on zip code prefix, then individually sort the mail within each bin.",
    useCases: "When input is uniformly distributed over a range (like floating point numbers between 0.0 and 1.0).",
    advantages: ["Average time is O(n + k).", "Can be very fast for uniformly distributed data."],
    disadvantages: ["Worst case is O(n²) if all elements fall into a single bucket.", "Requires extra space for buckets."],
    timeComplexity: { best: "O(n + k)", average: "O(n + k)", worst: "O(n²)" },
    spaceComplexity: "O(n + k)"
  }
};

export const ALGORITHM_CODE: Record<string, Record<string, string>> = {
  'bubble': {
    'java': `public void bubbleSort(int arr[]) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                // swap arr[j] and arr[j+1]
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`,
    'python': `def bubble_sort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`,
    'c': `void bubbleSort(int arr[], int n) {
    int i, j;
    for (i = 0; i < n-1; i++) {
        for (j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`
  },
  'quick': {
    'java': `public void quickSort(int arr[], int begin, int end) {
    if (begin < end) {
        int partitionIndex = partition(arr, begin, end);
        quickSort(arr, begin, partitionIndex-1);
        quickSort(arr, partitionIndex+1, end);
    }
}
private int partition(int arr[], int begin, int end) {
    int pivot = arr[end];
    int i = (begin-1);
    for (int j = begin; j < end; j++) {
        if (arr[j] <= pivot) {
            i++;
            int swapTemp = arr[i];
            arr[i] = arr[j];
            arr[j] = swapTemp;
        }
    }
    int swapTemp = arr[i+1];
    arr[i+1] = arr[end];
    arr[end] = swapTemp;
    return i+1;
}`,
    'python': `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i = i + 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    'c': `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
int partition (int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return (i + 1);
}`
  }
};

export const ALGORITHM_QUIZ: Record<string, QuizQuestion[]> = {
  'bubble': [
    {
      question: "What is the best-case time complexity of Bubble Sort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
      answer: 0
    },
    {
      question: "Is Bubble Sort a stable sorting algorithm?",
      options: ["Yes", "No", "Depends on the data", "Only for integers"],
      answer: 0
    },
    {
      question: "Which scenario causes the worst-case time complexity for Bubble Sort?",
      options: ["Array is already sorted", "Array is randomly sorted", "Array is sorted in reverse order", "Array contains duplicate elements"],
      answer: 2
    }
  ],
  'quick': [
    {
      question: "What is the worst-case time complexity of Quick Sort?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
      answer: 2
    },
    {
      question: "How can the worst-case behavior of Quick Sort be avoided?",
      options: ["By choosing the middle element as pivot", "By choosing a random pivot", "By using Median-of-Three pivot", "All of the above"],
      answer: 3
    },
    {
      question: "Is Quick Sort an in-place sorting algorithm?",
      options: ["Yes, completely", "Yes, but it requires O(log n) stack space for recursion", "No, it requires O(n) extra space", "No, it requires O(n²) extra space"],
      answer: 1
    }
  ]
};
