export interface SortStep {
  array: number[]
  comparing: number[]
  swapped?: boolean
  operations: number
  comparisons: number
}

export interface SortMetrics {
  startTime: number
  endTime?: number
  totalTime?: number
  comparisons: number
  swaps: number
  arrayAccesses: number
}

export interface SortExecutionControl {
  shouldPause?: () => boolean
  shouldStop?: () => boolean
}

export class SortAbortedError extends Error {
  constructor() {
    super('Sort aborted')
    this.name = 'SortAbortedError'
  }
}

async function waitForControl(speed: number, control?: SortExecutionControl) {
  const delay = Math.max(1, 101 - speed)
  let elapsed = 0

  while (elapsed < delay) {
    while (control?.shouldPause?.()) {
      if (control?.shouldStop?.()) {
        throw new SortAbortedError()
      }

      await sleep(20)
    }

    if (control?.shouldStop?.()) {
      throw new SortAbortedError()
    }

    const slice = Math.min(16, delay - elapsed)
    await sleep(slice)
    elapsed += slice
  }

  while (control?.shouldPause?.()) {
    if (control?.shouldStop?.()) {
      throw new SortAbortedError()
    }

    await sleep(20)
  }

  if (control?.shouldStop?.()) {
    throw new SortAbortedError()
  }
}

export function isSortAbortedError(error: unknown): error is SortAbortedError {
  return error instanceof SortAbortedError
}

// Bubble Sort with step tracking
export async function bubbleSort(
  array: number[],
  onStep: (step: SortStep) => void,
  speed: number = 50,
  control?: SortExecutionControl
) {
  const arr = [...array]
  let comparisons = 0
  let operations = 0
  const n = arr.length

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++
      operations++

      if (arr[j] > arr[j + 1]) {
        // Swap
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        operations += 3 // 3 operations for swap

        onStep({
          array: [...arr],
          comparing: [j, j + 1],
          swapped: true,
          operations,
          comparisons,
        })
      } else {
        onStep({
          array: [...arr],
          comparing: [j, j + 1],
          swapped: false,
          operations,
          comparisons,
        })
      }

      await waitForControl(speed, control)
    }
  }

  return { array: arr, comparisons, operations }
}

// Quick Sort with step tracking
export async function quickSort(
  array: number[],
  onStep: (step: SortStep) => void,
  speed: number = 50,
  control?: SortExecutionControl
) {
  const arr = [...array]
  let comparisons = 0
  let operations = 0

  async function partition(low: number, high: number): Promise<number> {
    const pivot = arr[high]
    let i = low - 1

    for (let j = low; j < high; j++) {
      comparisons++
      operations++

      if (arr[j] < pivot) {
        i++
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        operations += 3

        onStep({
          array: [...arr],
          comparing: [i, j],
          swapped: true,
          operations,
          comparisons,
        })

        await waitForControl(speed, control)
      }
    }

    ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
    operations += 3

    onStep({
      array: [...arr],
      comparing: [i + 1, high],
      swapped: true,
      operations,
      comparisons,
    })

    await waitForControl(speed, control)
    return i + 1
  }

  async function quickSortHelper(low: number, high: number): Promise<void> {
    if (low < high) {
      const pi = await partition(low, high)
      await quickSortHelper(low, pi - 1)
      await quickSortHelper(pi + 1, high)
    }
  }

  await quickSortHelper(0, arr.length - 1)
  return { array: arr, comparisons, operations }
}

// Merge Sort with step tracking
export async function mergeSort(
  array: number[],
  onStep: (step: SortStep) => void,
  speed: number = 50,
  control?: SortExecutionControl
) {
  const arr = [...array]
  let comparisons = 0
  let operations = 0

  async function merge(
    left: number,
    mid: number,
    right: number
  ): Promise<void> {
    const leftArr = arr.slice(left, mid + 1)
    const rightArr = arr.slice(mid + 1, right + 1)

    let i = 0,
      j = 0,
      k = left

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++
      operations++

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i]
        i++
      } else {
        arr[k] = rightArr[j]
        j++
      }

      k++

      onStep({
        array: [...arr],
        comparing: [left + i, mid + 1 + j],
        swapped: true,
        operations,
        comparisons,
      })

      await waitForControl(speed, control)
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i]
      i++
      k++
      operations++
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j]
      j++
      k++
      operations++
    }
  }

  async function mergeSortHelper(
    left: number,
    right: number
  ): Promise<void> {
    if (left < right) {
      const mid = Math.floor((left + right) / 2)
      await mergeSortHelper(left, mid)
      await mergeSortHelper(mid + 1, right)
      await merge(left, mid, right)
    }
  }

  await mergeSortHelper(0, arr.length - 1)
  return { array: arr, comparisons, operations }
}

// Binary Search
export async function binarySearch(
  array: number[],
  target: number,
  onStep: (step: SortStep) => void,
  speed: number = 50,
  control?: SortExecutionControl
) {
  const sortedArr = [...array].sort((a, b) => a - b)
  let comparisons = 0
  let operations = 0
  let left = 0
  let right = sortedArr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    comparisons++
    operations++

    onStep({
      array: sortedArr,
      comparing: [left, right, mid],
      swapped: false,
      operations,
      comparisons,
    })

    await waitForControl(speed, control)

    if (sortedArr[mid] === target) {
      return { found: true, index: mid, comparisons, operations }
    } else if (sortedArr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return { found: false, index: -1, comparisons, operations }
}

// Helper function to delay execution
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Generate random array
export function generateRandomArray(size: number, max: number = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1)
}

// Generate sorted array
export function generateSortedArray(size: number, max: number = 100): number[] {
  return Array.from({ length: size }, (_, i) =>
    Math.floor((i / size) * max) + 1
  )
}

// Generate reverse sorted array
export function generateReverseSortedArray(
  size: number,
  max: number = 100
): number[] {
  return Array.from({ length: size }, (_, i) =>
    Math.floor(((size - i) / size) * max) + 1
  )
}

// Generate nearly sorted array
export function generateNearlySortedArray(
  size: number,
  max: number = 100,
  swapCount: number = 5
): number[] {
  const arr = generateSortedArray(size, max)
  for (let i = 0; i < swapCount; i++) {
    const idx1 = Math.floor(Math.random() * size)
    const idx2 = Math.floor(Math.random() * size)
    ;[arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]]
  }
  return arr
}
