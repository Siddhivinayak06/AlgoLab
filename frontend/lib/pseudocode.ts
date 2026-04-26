export const ALGORITHM_PSEUDOCODE: Record<string, string[]> = {
  bubble: [
    'for i from 0 to n - 1',
    '  for j from 0 to n - i - 1',
    '    if arr[j] > arr[j + 1]',
    '      swap arr[j] and arr[j + 1]'
  ],
  selection: [
    'for i from 0 to n - 1',
    '  minIndex = i',
    '  for j from i + 1 to n',
    '    if arr[j] < arr[minIndex]',
    '      minIndex = j',
    '  swap arr[i] and arr[minIndex]'
  ],
  insertion: [
    'for i from 1 to n',
    '  key = arr[i]',
    '  j = i - 1',
    '  while j >= 0 and arr[j] > key',
    '    arr[j + 1] = arr[j]',
    '    j = j - 1',
    '  arr[j + 1] = key'
  ],
  quick: [
    'function partition(low, high)',
    '  pivot = arr[high]',
    '  for j from low to high - 1',
    '    if arr[j] < pivot',
    '      swap arr[i] and arr[j]',
    '  swap arr[i + 1] and arr[high]',
    'function quickSort(low, high)',
    '  if low < high',
    '    pi = partition(low, high)',
    '    quickSort(low, pi - 1)',
    '    quickSort(pi + 1, high)'
  ],
  merge: [
    'function mergeSort(left, right)',
    '  if left < right',
    '    mid = (left + right) / 2',
    '    mergeSort(left, mid)',
    '    mergeSort(mid + 1, right)',
    '    merge(left, mid, right)',
    'function merge(left, mid, right)',
    '  while i < left_len and j < right_len',
    '    if left[i] <= right[j]',
    '      arr[k] = left[i]',
    '    else',
    '      arr[k] = right[j]',
    '  copy remaining elements'
  ],
  heap: [
    'function heapSort(arr)',
    '  buildMaxHeap(arr)',
    '  for end from n - 1 down to 1',
    '    swap arr[0] and arr[end]',
    '    heapify(end, 0)',
    'function heapify(size, root)',
    '  largest = root',
    '  if left < size and arr[left] > arr[largest]',
    '    largest = left',
    '  if right < size and arr[right] > arr[largest]',
    '    largest = right',
    '  if largest != root',
    '    swap arr[root] and arr[largest]',
    '    heapify(size, largest)'
  ],
  shell: [
    'gap = floor(n / 2)',
    'while gap > 0',
    '  for i from gap to n',
    '    temp = arr[i]',
    '    j = i',
    '    while j >= gap and arr[j - gap] > temp',
    '      arr[j] = arr[j - gap]',
    '      j -= gap',
    '    arr[j] = temp',
    '  gap = floor(gap / 2)'
  ],
  counting: [
    'function countingSort(arr)',
    '  max = findMax(arr)',
    '  count = array of size max + 1',
    '  for i from 0 to n',
    '    count[arr[i]]++',
    '  for i from 1 to max',
    '    count[i] += count[i - 1]',
    '  for i from n - 1 down to 0',
    '    output[count[arr[i]] - 1] = arr[i]',
    '    count[arr[i]]--',
    '  copy output to arr'
  ],
  radix: [
    'function radixSort(arr)',
    '  max = findMax(arr)',
    '  for exp = 1; max / exp > 0; exp *= 10',
    '    countSortByDigit(arr, exp)',
    'function countSortByDigit(arr, exp)',
    '  count occurrences of each digit',
    '  calculate prefix sums',
    '  build output array based on prefix sums',
    '  copy output array back to arr'
  ],
  bucket: [
    'function bucketSort(arr)',
    '  create n empty buckets',
    '  for i from 0 to n',
    '    insert arr[i] into bucket[n * arr[i]]',
    '  for i from 0 to n',
    '    sort bucket[i]',
    '  concatenate all buckets into arr'
  ]
}
