export interface SortStep {
  array: number[]
  comparing: number[]
  swapped?: boolean
  operations: number
  comparisons: number
  note?: string
  stepType?: 'compare' | 'swap' | 'write' | 'copy' | 'pivot' | 'done'
  pivotIndex?: number
  pivotValue?: number
  activeRange?: [number, number]
  writeIndex?: number
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
  getSpeed?: () => number
}

export class SortAbortedError extends Error {
  constructor() {
    super('Sort aborted')
    this.name = 'SortAbortedError'
  }
}

async function waitForControl(
  speed: number,
  control?: SortExecutionControl,
  stepType?: SortStep['stepType']
) {
  let elapsed = 0

  while (true) {
    const liveSpeed = control?.getSpeed?.() ?? speed
    const delay = speedToDelayMs(liveSpeed, stepType)

    if (elapsed >= delay) {
      break
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

export function speedToDelayMs(speed: number, stepType?: SortStep['stepType']) {
  const clampedSpeed = Math.max(1, Math.min(100, speed))
  const normalized = (clampedSpeed - 1) / 99
  const slowestDelay = 900
  const fastestDelay = 8
  const eased = (1 - normalized) ** 2

  const baseDelay = Math.round(fastestDelay + eased * (slowestDelay - fastestDelay))

  switch (stepType) {
    case 'swap':
    case 'pivot':
      return Math.round(baseDelay * 1.2)
    case 'write':
    case 'copy':
      return Math.round(baseDelay * 1.1)
    default:
      return baseDelay
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
      const leftValue = arr[j]
      const rightValue = arr[j + 1]

      comparisons++
      operations++

      onStep({
        array: [...arr],
        comparing: [j, j + 1],
        swapped: false,
        operations,
        comparisons,
        note: `Compare ${leftValue} and ${rightValue}.`,
        stepType: 'compare',
        activeRange: [j, j + 1],
      })

      await waitForControl(speed, control, 'compare')

      if (leftValue > rightValue) {
        // Swap
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        operations += 3 // 3 operations for swap

        onStep({
          array: [...arr],
          comparing: [j, j + 1],
          swapped: true,
          operations,
          comparisons,
          note: `Swap ${leftValue} and ${rightValue} because ${leftValue} is greater.`,
          stepType: 'swap',
          activeRange: [j, j + 1],
        })

        await waitForControl(speed, control, 'swap')
      }
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
      const currentValue = arr[j]

      comparisons++
      operations++

      onStep({
        array: [...arr],
        comparing: [j, high],
        swapped: false,
        operations,
        comparisons,
        note: `Compare ${currentValue} with pivot ${pivot}.`,
        stepType: 'compare',
        pivotIndex: high,
        pivotValue: pivot,
        activeRange: [low, high],
      })

      await waitForControl(speed, control, 'compare')

      if (currentValue < pivot) {
        i++
        const leftValue = arr[i]

        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        operations += 3

        onStep({
          array: [...arr],
          comparing: [i, j],
          swapped: true,
          operations,
          comparisons,
          note:
            i === j
              ? `${currentValue} is already in the left partition.`
              : `Move ${currentValue} left of pivot by swapping with ${leftValue}.`,
          stepType: 'swap',
          pivotIndex: high,
          pivotValue: pivot,
          activeRange: [low, high],
        })

        await waitForControl(speed, control, 'swap')
      }
    }

    const pivotTargetIndex = i + 1
    const displacedValue = arr[pivotTargetIndex]

    ;[arr[pivotTargetIndex], arr[high]] = [arr[high], arr[pivotTargetIndex]]
    operations += 3

    onStep({
      array: [...arr],
      comparing: [pivotTargetIndex, high],
      swapped: true,
      operations,
      comparisons,
      note:
        pivotTargetIndex === high
          ? `Pivot ${pivot} is already in its final position.`
          : `Place pivot ${pivot} at index ${pivotTargetIndex} by swapping with ${displacedValue}.`,
      stepType: 'pivot',
      pivotIndex: pivotTargetIndex,
      pivotValue: pivot,
      activeRange: [low, high],
    })

    await waitForControl(speed, control, 'pivot')
    return pivotTargetIndex
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
      const leftIndex = left + i
      const rightIndex = mid + 1 + j
      const leftValue = leftArr[i]
      const rightValue = rightArr[j]

      comparisons++
      operations++

      onStep({
        array: [...arr],
        comparing: [],
        swapped: false,
        operations,
        comparisons,
        note: `Compare ${leftValue} and ${rightValue} while merging partitions.`,
        stepType: 'compare',
        activeRange: [left, right],
      })

      await waitForControl(speed, control, 'compare')

      const shouldTakeLeft = leftValue <= rightValue
      const valueToWrite = shouldTakeLeft ? leftValue : rightValue

      arr[k] = valueToWrite
      operations++

      onStep({
        array: [...arr],
        comparing: [k],
        swapped: true,
        operations,
        comparisons,
        note: `Write ${valueToWrite} to index ${k}.`,
        stepType: 'write',
        writeIndex: k,
        activeRange: [left, right],
      })

      await waitForControl(speed, control, 'write')

      if (shouldTakeLeft) {
        i++
      } else {
        j++
      }

      k++
    }

    while (i < leftArr.length) {
      const valueToWrite = leftArr[i]
      arr[k] = valueToWrite
      operations++

      onStep({
        array: [...arr],
        comparing: [k],
        swapped: true,
        operations,
        comparisons,
        note: `Copy remaining ${valueToWrite} to index ${k}.`,
        stepType: 'copy',
        writeIndex: k,
        activeRange: [left, right],
      })

      await waitForControl(speed, control, 'copy')

      i++
      k++
    }

    while (j < rightArr.length) {
      const valueToWrite = rightArr[j]
      arr[k] = valueToWrite
      operations++

      onStep({
        array: [...arr],
        comparing: [k],
        swapped: true,
        operations,
        comparisons,
        note: `Copy remaining ${valueToWrite} to index ${k}.`,
        stepType: 'copy',
        writeIndex: k,
        activeRange: [left, right],
      })

      await waitForControl(speed, control, 'copy')

      j++
      k++
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
      stepType: 'compare',
      activeRange: [left, right],
      note: `Search between indices ${left} and ${right}; check middle value ${sortedArr[mid]} at index ${mid}.`,
    })

    await waitForControl(speed, control, 'compare')

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
