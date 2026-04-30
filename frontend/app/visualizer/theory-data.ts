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
  bubble: {
    java: `public void bubbleSort(int arr[]) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`,
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`,
    c: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1]) {
                int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;
            }
}`
  },
  selection: {
    java: `public void selectionSort(int arr[]) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++) {
        int minIdx = i;
        for (int j = i+1; j < n; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}`,
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
    c: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        int min = i;
        for (int j = i+1; j < n; j++)
            if (arr[j] < arr[min]) min = j;
        int t = arr[min]; arr[min] = arr[i]; arr[i] = t;
    }
}`
  },
  insertion: {
    java: `public void insertionSort(int arr[]) {
    int n = arr.length;
    for (int i = 1; i < n; ++i) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
}`,
    python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key`,
    c: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
  },
  merge: {
    java: `public void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}
void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int[] L = new int[n1], R = new int[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2)
        arr[k++] = L[i] <= R[j] ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`,
    python: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L, R = arr[:mid], arr[mid:]
        merge_sort(L)
        merge_sort(R)
        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] <= R[j]:
                arr[k] = L[i]; i += 1
            else:
                arr[k] = R[j]; j += 1
            k += 1
        while i < len(L): arr[k] = L[i]; i += 1; k += 1
        while j < len(R): arr[k] = R[j]; j += 1; k += 1`,
    c: `void merge(int arr[], int l, int m, int r) {
    int n1 = m-l+1, n2 = r-m, i, j, k;
    int L[n1], R[n2];
    for (i=0; i<n1; i++) L[i] = arr[l+i];
    for (j=0; j<n2; j++) R[j] = arr[m+1+j];
    i=0; j=0; k=l;
    while (i<n1 && j<n2) arr[k++] = L[i]<=R[j] ? L[i++] : R[j++];
    while (i<n1) arr[k++] = L[i++];
    while (j<n2) arr[k++] = R[j++];
}
void mergeSort(int arr[], int l, int r) {
    if (l<r) { int m=l+(r-l)/2; mergeSort(arr,l,m); mergeSort(arr,m+1,r); merge(arr,l,m,r); }
}`
  },
  quick: {
    java: `public void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
int partition(int arr[], int low, int high) {
    int pivot = arr[high], i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
    }
    int t = arr[i+1]; arr[i+1] = arr[high]; arr[high] = t;
    return i + 1;
}`,
    python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1`,
    c: `void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi-1);
        quickSort(arr, pi+1, high);
    }
}
int partition(int arr[], int low, int high) {
    int pivot = arr[high], i = low-1;
    for (int j = low; j < high; j++)
        if (arr[j] < pivot) { i++; int t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
    int t = arr[i+1]; arr[i+1] = arr[high]; arr[high] = t;
    return i+1;
}`
  },
  heap: {
    java: `public void heapSort(int arr[]) {
    int n = arr.length;
    for (int i = n/2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n-1; i > 0; i--) {
        int t = arr[0]; arr[0] = arr[i]; arr[i] = t;
        heapify(arr, i, 0);
    }
}
void heapify(int arr[], int n, int i) {
    int largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        int t = arr[i]; arr[i] = arr[largest]; arr[largest] = t;
        heapify(arr, n, largest);
    }
}`,
    python: `def heap_sort(arr):
    n = len(arr)
    for i in range(n//2-1, -1, -1): heapify(arr, n, i)
    for i in range(n-1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)

def heapify(arr, n, i):
    largest, l, r = i, 2*i+1, 2*i+2
    if l < n and arr[l] > arr[largest]: largest = l
    if r < n and arr[r] > arr[largest]: largest = r
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`,
    c: `void heapify(int arr[], int n, int i) {
    int largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        int t = arr[i]; arr[i] = arr[largest]; arr[largest] = t;
        heapify(arr, n, largest);
    }
}
void heapSort(int arr[], int n) {
    for (int i = n/2-1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n-1; i > 0; i--) {
        int t = arr[0]; arr[0] = arr[i]; arr[i] = t;
        heapify(arr, i, 0);
    }
}`
  },
  shell: {
    java: `public void shellSort(int arr[]) {
    int n = arr.length;
    for (int gap = n/2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i], j;
            for (j = i; j >= gap && arr[j-gap] > temp; j -= gap)
                arr[j] = arr[j - gap];
            arr[j] = temp;
        }
    }
}`,
    python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2`,
    c: `void shellSort(int arr[], int n) {
    for (int gap = n/2; gap > 0; gap /= 2)
        for (int i = gap; i < n; i++) {
            int temp = arr[i], j;
            for (j = i; j >= gap && arr[j-gap] > temp; j -= gap)
                arr[j] = arr[j-gap];
            arr[j] = temp;
        }
}`
  },
  counting: {
    java: `public void countingSort(int arr[]) {
    int max = Arrays.stream(arr).max().getAsInt();
    int[] count = new int[max + 1];
    int[] output = new int[arr.length];
    for (int val : arr) count[val]++;
    for (int i = 1; i <= max; i++) count[i] += count[i-1];
    for (int i = arr.length-1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    System.arraycopy(output, 0, arr, 0, arr.length);
}`,
    python: `def counting_sort(arr):
    max_val = max(arr)
    count = [0] * (max_val + 1)
    output = [0] * len(arr)
    for val in arr: count[val] += 1
    for i in range(1, max_val + 1): count[i] += count[i-1]
    for i in range(len(arr)-1, -1, -1):
        output[count[arr[i]] - 1] = arr[i]
        count[arr[i]] -= 1
    for i in range(len(arr)): arr[i] = output[i]`,
    c: `void countingSort(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > max) max = arr[i];
    int count[max+1], output[n];
    memset(count, 0, sizeof(count));
    for (int i = 0; i < n; i++) count[arr[i]]++;
    for (int i = 1; i <= max; i++) count[i] += count[i-1];
    for (int i = n-1; i >= 0; i--) { output[count[arr[i]]-1] = arr[i]; count[arr[i]]--; }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}`
  },
  radix: {
    java: `public void radixSort(int arr[]) {
    int max = Arrays.stream(arr).max().getAsInt();
    for (int exp = 1; max / exp > 0; exp *= 10)
        countSortByDigit(arr, exp);
}
void countSortByDigit(int arr[], int exp) {
    int n = arr.length;
    int[] output = new int[n], count = new int[10];
    for (int val : arr) count[(val/exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i-1];
    for (int i = n-1; i >= 0; i--) {
        output[count[(arr[i]/exp)%10] - 1] = arr[i];
        count[(arr[i]/exp)%10]--;
    }
    System.arraycopy(output, 0, arr, 0, n);
}`,
    python: `def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_by_digit(arr, exp)
        exp *= 10

def counting_sort_by_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for val in arr: count[(val // exp) % 10] += 1
    for i in range(1, 10): count[i] += count[i-1]
    for i in range(n-1, -1, -1):
        idx = (arr[i] // exp) % 10
        output[count[idx] - 1] = arr[i]
        count[idx] -= 1
    for i in range(n): arr[i] = output[i]`,
    c: `void countSort(int arr[], int n, int exp) {
    int output[n], count[10] = {0};
    for (int i = 0; i < n; i++) count[(arr[i]/exp)%10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i-1];
    for (int i = n-1; i >= 0; i--) { output[count[(arr[i]/exp)%10]-1] = arr[i]; count[(arr[i]/exp)%10]--; }
    for (int i = 0; i < n; i++) arr[i] = output[i];
}
void radixSort(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > max) max = arr[i];
    for (int exp = 1; max/exp > 0; exp *= 10) countSort(arr, n, exp);
}`
  },
  bucket: {
    java: `public void bucketSort(float arr[]) {
    int n = arr.length;
    List<Float>[] buckets = new ArrayList[n];
    for (int i = 0; i < n; i++) buckets[i] = new ArrayList<>();
    for (float val : arr) buckets[(int)(n * val)].add(val);
    for (List<Float> b : buckets) Collections.sort(b);
    int idx = 0;
    for (List<Float> b : buckets)
        for (float val : b) arr[idx++] = val;
}`,
    python: `def bucket_sort(arr):
    n = len(arr)
    buckets = [[] for _ in range(n)]
    for val in arr:
        idx = int(n * val)
        if idx == n: idx -= 1
        buckets[idx].append(val)
    for bucket in buckets:
        bucket.sort()
    result = []
    for bucket in buckets:
        result.extend(bucket)
    return result`,
    c: `// Bucket Sort for integers 0..max
void bucketSort(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > max) max = arr[i];
    int bucketCount = max/10 + 1;
    // Create buckets, distribute, sort each, concatenate
    // Uses insertion sort within each bucket
}`
  },
};

export const ALGORITHM_QUIZ: Record<string, QuizQuestion[]> = {
  bubble: [
    { question: "What is the best-case time complexity of Bubble Sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"], answer: 0 },
    { question: "Is Bubble Sort a stable sorting algorithm?", options: ["Yes", "No", "Depends on data", "Only for integers"], answer: 0 },
    { question: "Which scenario causes worst-case for Bubble Sort?", options: ["Already sorted", "Random order", "Reverse sorted", "Duplicates"], answer: 2 },
  ],
  selection: [
    { question: "How many swaps does Selection Sort make at most?", options: ["O(n²)", "O(n)", "O(n log n)", "O(1)"], answer: 1 },
    { question: "Is Selection Sort stable?", options: ["Yes", "No", "Sometimes", "Depends on implementation"], answer: 1 },
    { question: "Selection Sort's time complexity is always:", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: 2 },
  ],
  insertion: [
    { question: "What is the best-case time complexity of Insertion Sort?", options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"], answer: 2 },
    { question: "Insertion Sort is most efficient for:", options: ["Large random arrays", "Nearly sorted arrays", "Reverse sorted arrays", "Arrays with all equal elements"], answer: 1 },
    { question: "Is Insertion Sort stable?", options: ["Yes", "No", "Only for integers", "Depends on pivot"], answer: 0 },
  ],
  merge: [
    { question: "What is Merge Sort's space complexity?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: 2 },
    { question: "Is Merge Sort stable?", options: ["Yes", "No", "Depends on implementation", "Only for linked lists"], answer: 0 },
    { question: "Merge Sort's time complexity is:", options: ["O(n²) in all cases", "O(n log n) in all cases", "O(n) best, O(n²) worst", "O(n log n) average, O(n²) worst"], answer: 1 },
  ],
  quick: [
    { question: "What is the worst-case time complexity of Quick Sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"], answer: 2 },
    { question: "How can worst-case Quick Sort be avoided?", options: ["Middle pivot", "Random pivot", "Median-of-Three", "All of the above"], answer: 3 },
    { question: "Is Quick Sort in-place?", options: ["Yes, completely", "Yes, but O(log n) stack space", "No, O(n) extra", "No, O(n²) extra"], answer: 1 },
  ],
  heap: [
    { question: "What data structure does Heap Sort use?", options: ["Stack", "Queue", "Binary Heap", "Hash Table"], answer: 2 },
    { question: "Is Heap Sort stable?", options: ["Yes", "No", "Sometimes", "Only for integers"], answer: 1 },
    { question: "Heap Sort's time complexity is:", options: ["O(n) all cases", "O(n log n) all cases", "O(n²) worst", "O(n log n) avg, O(n²) worst"], answer: 1 },
  ],
  shell: [
    { question: "Shell Sort is an optimization of which algorithm?", options: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort"], answer: 2 },
    { question: "What concept does Shell Sort introduce?", options: ["Pivot element", "Gap sequence", "Heap property", "Divide and conquer"], answer: 1 },
    { question: "Is Shell Sort stable?", options: ["Yes", "No", "Depends on gap sequence", "Only for small arrays"], answer: 1 },
  ],
  counting: [
    { question: "What type of data can Counting Sort handle?", options: ["Any data type", "Only integers/discrete values", "Only strings", "Only floating point"], answer: 1 },
    { question: "Counting Sort's time complexity is:", options: ["O(n log n)", "O(n²)", "O(n + k)", "O(n)"], answer: 2 },
    { question: "Is Counting Sort a comparison-based sort?", options: ["Yes", "No", "Sometimes", "Only for small ranges"], answer: 1 },
  ],
  radix: [
    { question: "Radix Sort processes digits from:", options: ["Most significant to least", "Least significant to most", "Random order", "Middle outward"], answer: 1 },
    { question: "Which sort does Radix Sort typically use as a subroutine?", options: ["Quick Sort", "Merge Sort", "Counting Sort", "Bubble Sort"], answer: 2 },
    { question: "Is Radix Sort a comparison-based sort?", options: ["Yes", "No", "Depends on implementation", "Only for integers"], answer: 1 },
  ],
  bucket: [
    { question: "When does Bucket Sort perform best?", options: ["Reverse sorted data", "Uniformly distributed data", "Data with many duplicates", "Already sorted data"], answer: 1 },
    { question: "What is Bucket Sort's worst-case complexity?", options: ["O(n)", "O(n log n)", "O(n²)", "O(n + k)"], answer: 2 },
    { question: "Bucket Sort distributes elements into:", options: ["Sub-arrays (buckets)", "A binary tree", "A hash table", "A linked list"], answer: 0 },
  ],
};

