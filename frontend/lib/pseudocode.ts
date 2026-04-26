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
  ],
  'n-queens': [
    'function solveNQueens(board, row)',
    '  for col from 0 to N - 1',
    '    if isSafe(board, row, col)',
    '      placeQueen(board, row, col)',
    '      solveNQueens(board, row + 1)',
    '      if row == N → SOLUTION FOUND',
    '      removeQueen(board, row, col)',
    '    // try next column'
  ],
  'sum-of-subsets': [
    'function subsetSum(idx, sum, remaining)',
    '  include items[idx] → sum += items[idx]',
    '  exclude items[idx] → move to next',
    '  if sum == target → SOLUTION',
    '  if sum > target → PRUNE',
    '  if sum + remaining < target → PRUNE',
    '  return all valid subsets'
  ],
  'graph-coloring': [
    'function colorGraph(node)',
    '  for color from 0 to M - 1',
    '    if conflicts with neighbor → skip',
    '    assignColor(node, color)',
    '    colorGraph(node + 1)',
    '    if all nodes colored → SOLUTION',
    '    removeColor(node)'
  ],
  tsp: [
    'function solveTSP(city, count, cost)',
    '  visit next unvisited city',
    '  add edge cost to running total',
    '  if cost ≥ bestCost → PRUNE',
    '  if all cities visited → check return',
    '  if cost < bestCost → NEW BEST',
    '  unvisit city, backtrack',
    '  return best tour'
  ],
  // Graph Algorithms
  multistage: [
    'function multistageGraph(stages, edges)',
    '  for i from stages - 2 down to 0',
    '    for each node u in stage i',
    '      minCost = Infinity',
    '      for each edge (u, v)',
    '        if weight(u, v) + cost(v) < minCost',
    '          minCost = weight(u, v) + cost(v)',
    '      cost(u) = minCost'
  ],
  'bellman-ford': [
    'function bellmanFord(nodes, edges, src)',
    '  initialize distances to Infinity, src to 0',
    '  for i from 1 to V - 1',
    '    for each edge (u, v)',
    '      if dist[u] + weight < dist[v]',
    '        dist[v] = dist[u] + weight',
    '  for each edge (u, v)',
    '    if dist[u] + weight < dist[v]',
    '      return Negative Cycle Detected!'
  ],
  'floyd-warshall': [
    'function floydWarshall(nodes, edges)',
    '  initialize distance matrix with edge weights',
    '  for k from 0 to V - 1',
    '    for i from 0 to V - 1',
    '      for j from 0 to V - 1',
    '        if matrix[i][k] + matrix[k][j] < matrix[i][j]',
    '          matrix[i][j] = matrix[i][k] + matrix[k][j]'
  ],
  // Greedy Algorithms
  dijkstra: [
    'function dijkstra(nodes, edges, src)',
    '  initialize distances to Infinity, src to 0',
    '  while Priority Queue is not empty',
    '    extract min node u',
    '    if u is visited, skip',
    '    mark u as visited',
    '    for each neighbor v of u',
    '      if dist[u] + weight < dist[v]',
    '        dist[v] = dist[u] + weight, push to PQ'
  ],
  'fractional-knapsack': [
    'function fractionalKnapsack(items, capacity)',
    '  sort items by value/weight ratio descending',
    '  for each item in sorted items',
    '    if item.weight <= capacity',
    '      take entire item, reduce capacity',
    '    else',
    '      take fraction of item, capacity = 0',
    '      break'
  ],
  'job-scheduling': [
    'function jobScheduling(jobs)',
    '  sort jobs by profit descending',
    '  for each job in sorted jobs',
    '    find free slot from min(deadline, max_slot) down to 1',
    '    if free slot found',
    '      schedule job',
    '    else',
    '      reject job'
  ],
  prims: [
    'function prims(nodes, edges)',
    '  initialize Priority Queue with starting node 0',
    '  while Priority Queue is not empty',
    '    extract min edge (u, v)',
    '    if v is in MST, skip',
    '    add v and edge (u, v) to MST',
    '    for each neighbor w of v',
    '      if w is not in MST',
    '        push edge (v, w) to PQ'
  ],
  kruskals: [
    'function kruskals(nodes, edges)',
    '  sort edges by weight ascending',
    '  initialize Union-Find data structure',
    '  for each edge (u, v) in sorted edges',
    '    if find(u) != find(v)',
    '      union(u, v)',
    '      add edge to MST',
    '    else',
    '      skip edge (cycle)'
  ],
  // Branch & Bound Algorithms
  '15-puzzle': [
    'function solve15Puzzle(initialBoard)',
    '  initialize Priority Queue with initial state',
    '  while Priority Queue is not empty',
    '    extract state with lowest cost (g + h)',
    '    if h == 0',
    '      return SOLUTION',
    '    for each valid move (UP, DOWN, LEFT, RIGHT)',
    '      generate new board state',
    '      if new state is unexplored',
    '        calculate new g and h, push to PQ'
  ]
}
