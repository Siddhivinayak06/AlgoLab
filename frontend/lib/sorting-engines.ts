import { type SortStep } from './algorithms'

export interface SortGeneratorResult {
  steps: SortStep[]
  result: number[]
}

// Helper to create the initial id array
export function createIdArray(array: number[]) {
  return array.map((value, idx) => ({ id: `id-${value}-${idx}-${Math.random().toString(36).substring(2, 9)}`, value }))
}

// Helper to deduplicate idArray snapshots.
// During intermediate algorithm steps (shifts, merges, counting writes),
// the same ID can temporarily appear at multiple positions.
// This ensures every snapshot has unique IDs for React keys.
function safeIdSnapshot(idArr: {id: string, value: number}[]): {id: string, value: number}[] {
  const seen = new Set<string>()
  return idArr.map((item, idx) => {
    if (seen.has(item.id)) {
      return { ...item, id: `${item.id}-s${idx}` }
    }
    seen.add(item.id)
    return item
  })
}

export function generateBubbleSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0
  const n = arr.length

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const leftValue = arr[j]
      const rightValue = arr[j + 1]

      comparisons++
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [j, j + 1],
        swapped: false,
        operations,
        comparisons,
        note: `Comparing elements ${leftValue} and ${rightValue}.`,
        stepType: 'compare',
        activeRange: [j, j + 1],
        activeLine: 2,
      })

      if (leftValue > rightValue) {
        // Swap
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        ;[idArray[j], idArray[j + 1]] = [idArray[j + 1], idArray[j]]
        operations += 3

        steps.push({
          array: [...arr],
          idArray: safeIdSnapshot(idArray),
          comparing: [j, j + 1],
          swapped: true,
          operations,
          comparisons,
          note: `Since ${leftValue} > ${rightValue}, swapping them.`,
          stepType: 'swap',
          activeRange: [j, j + 1],
          activeLine: 3,
        })
      } else {
        steps.push({
          array: [...arr],
          idArray: safeIdSnapshot(idArray),
          comparing: [j, j + 1],
          swapped: false,
          operations,
          comparisons,
          note: `Since ${leftValue} <= ${rightValue}, no swap is needed.`,
          stepType: 'compare',
          activeRange: [j, j + 1],
          activeLine: 2,
        })
      }
    }
  }

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateSelectionSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0
  const n = arr.length

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i
    steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [minIndex],
        operations,
        comparisons,
        note: `Set minimum to element at index ${i} (value: ${arr[i]}).`,
        stepType: 'compare',
        activeLine: 2,
    })

    for (let j = i + 1; j < n; j++) {
      const candidate = arr[j]
      const currentMin = arr[minIndex]

      comparisons++
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [minIndex, j],
        swapped: false,
        operations,
        comparisons,
        note: `Comparing candidate ${candidate} with current minimum ${currentMin}.`,
        stepType: 'compare',
        activeRange: [i, n - 1],
        activeLine: 4,
      })

      if (candidate < currentMin) {
        minIndex = j
        steps.push({
            array: [...arr],
            idArray: safeIdSnapshot(idArray),
            comparing: [minIndex],
            swapped: false,
            operations,
            comparisons,
            note: `Found new minimum: ${candidate} at index ${j}.`,
            stepType: 'compare',
            activeRange: [i, n - 1],
            activeLine: 5,
        })
      }
    }

    if (minIndex !== i) {
      const leftValue = arr[i]
      const rightValue = arr[minIndex]

      ;[arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
      ;[idArray[i], idArray[minIndex]] = [idArray[minIndex], idArray[i]]
      operations += 3

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [i, minIndex],
        swapped: true,
        operations,
        comparisons,
        note: `Swapping ${leftValue} and minimum ${rightValue} into sorted position.`,
        stepType: 'swap',
        activeRange: [i, n - 1],
        activeLine: 6,
      })
    }
  }

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateInsertionSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0
  const n = arr.length

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    const keyId = idArray[i]
    let j = i - 1

    operations++

    while (j >= 0) {
      const leftValue = arr[j]
      comparisons++
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [j, j + 1],
        swapped: false,
        operations,
        comparisons,
        note: `Comparing ${leftValue} with insertion key ${key}.`,
        stepType: 'compare',
        activeRange: [0, i],
        activeLine: 3,
      })

      if (leftValue <= key) {
        steps.push({
          array: [...arr],
          idArray: safeIdSnapshot(idArray),
          comparing: [j],
          swapped: false,
          operations,
          comparisons,
          note: `Since ${leftValue} <= ${key}, no shifting needed. Break inner loop.`,
          stepType: 'compare',
          activeRange: [0, i],
          activeLine: 4,
        })
        break
      }

      arr[j + 1] = leftValue
      idArray[j + 1] = idArray[j]
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [j, j + 1],
        swapped: true,
        operations,
        comparisons,
        note: `Since ${leftValue} > ${key}, shift ${leftValue} to the right.`,
        stepType: 'write',
        writeIndex: j + 1,
        activeRange: [0, i],
        activeLine: 5,
      })

      j--
    }

    arr[j + 1] = key
    idArray[j + 1] = keyId
    operations++

    steps.push({
      array: [...arr],
      idArray: safeIdSnapshot(idArray),
      comparing: [j + 1],
      swapped: true,
      operations,
      comparisons,
      note: `Insert ${key} at its correct position ${j + 1}.`,
      stepType: 'write',
      writeIndex: j + 1,
      activeRange: [0, i],
      activeLine: 7,
    })
  }

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateQuickSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0

  function partition(low: number, high: number): number {
    const pivot = arr[high]
    let i = low - 1

    steps.push({
      array: [...arr],
      idArray: safeIdSnapshot(idArray),
      comparing: [high],
      swapped: false,
      operations,
      comparisons,
      note: `Selecting pivot ${pivot} at index ${high}.`,
      stepType: 'pivot',
      pivotIndex: high,
      pivotValue: pivot,
      activeRange: [low, high],
      activeLine: 2,
    })

    for (let j = low; j < high; j++) {
      const currentValue = arr[j]

      comparisons++
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [j, high],
        swapped: false,
        operations,
        comparisons,
        note: `Comparing ${currentValue} with pivot ${pivot}.`,
        stepType: 'compare',
        pivotIndex: high,
        pivotValue: pivot,
        activeRange: [low, high],
        activeLine: 3,
      })

      if (currentValue < pivot) {
        i++
        const leftValue = arr[i]

        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        ;[idArray[i], idArray[j]] = [idArray[j], idArray[i]]
        operations += 3

        steps.push({
          array: [...arr],
          idArray: safeIdSnapshot(idArray),
          comparing: [i, j],
          swapped: true,
          operations,
          comparisons,
          note: i === j
                ? `Since ${currentValue} < pivot, it stays in the left partition.`
                : `Since ${currentValue} < pivot, swap with ${leftValue} into left partition.`,
          stepType: 'swap',
          pivotIndex: high,
          pivotValue: pivot,
          activeRange: [low, high],
          activeLine: 5,
        })
      }
    }

    const pivotTargetIndex = i + 1
    const displacedValue = arr[pivotTargetIndex]

    ;[arr[pivotTargetIndex], arr[high]] = [arr[high], arr[pivotTargetIndex]]
    ;[idArray[pivotTargetIndex], idArray[high]] = [idArray[high], idArray[pivotTargetIndex]]
    operations += 3

    steps.push({
      array: [...arr],
      idArray: safeIdSnapshot(idArray),
      comparing: [pivotTargetIndex, high],
      swapped: true,
      operations,
      comparisons,
      note: pivotTargetIndex === high
            ? `Pivot ${pivot} is already in its final position.`
            : `Swap pivot ${pivot} into its final position at index ${pivotTargetIndex}.`,
      stepType: 'pivot',
      pivotIndex: pivotTargetIndex,
      pivotValue: pivot,
      activeRange: [low, high],
      activeLine: 6,
    })

    return pivotTargetIndex
  }

  function quickSortHelper(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high)
      quickSortHelper(low, pi - 1)
      quickSortHelper(pi + 1, high)
    }
  }

  quickSortHelper(0, arr.length - 1)

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateMergeSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0

  function merge(left: number, mid: number, right: number): void {
    const leftArr = arr.slice(left, mid + 1)
    const rightArr = arr.slice(mid + 1, right + 1)
    
    // We also need to copy idArray elements correctly during merge
    const leftIds = idArray.slice(left, mid + 1)
    const rightIds = idArray.slice(mid + 1, right + 1)

    let i = 0, j = 0, k = left

    while (i < leftArr.length && j < rightArr.length) {
      const leftValue = leftArr[i]
      const rightValue = rightArr[j]

      comparisons++
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [left + i, mid + 1 + j],
        swapped: false,
        operations,
        comparisons,
        note: `Comparing ${leftValue} from left half with ${rightValue} from right half.`,
        stepType: 'compare',
        activeRange: [left, right],
        activeLine: 7,
      })

      const shouldTakeLeft = leftValue <= rightValue
      const valueToWrite = shouldTakeLeft ? leftValue : rightValue
      const idToWrite = shouldTakeLeft ? leftIds[i] : rightIds[j]

      arr[k] = valueToWrite
      idArray[k] = idToWrite
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [k],
        swapped: true,
        operations,
        comparisons,
        note: `Since ${leftValue} ${shouldTakeLeft ? '<=' : '>'} ${rightValue}, write ${valueToWrite} to index ${k}.`,
        stepType: 'write',
        writeIndex: k,
        activeRange: [left, right],
        activeLine: 8,
      })

      if (shouldTakeLeft) {
        i++
      } else {
        j++
      }
      k++
    }

    while (i < leftArr.length) {
      const valueToWrite = leftArr[i]
      const idToWrite = leftIds[i]
      arr[k] = valueToWrite
      idArray[k] = idToWrite
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [k],
        swapped: true,
        operations,
        comparisons,
        note: `Copy remaining ${valueToWrite} from left half.`,
        stepType: 'copy',
        writeIndex: k,
        activeRange: [left, right],
        activeLine: 10,
      })
      i++
      k++
    }

    while (j < rightArr.length) {
      const valueToWrite = rightArr[j]
      const idToWrite = rightIds[j]
      arr[k] = valueToWrite
      idArray[k] = idToWrite
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [k],
        swapped: true,
        operations,
        comparisons,
        note: `Copy remaining ${valueToWrite} from right half.`,
        stepType: 'copy',
        writeIndex: k,
        activeRange: [left, right],
        activeLine: 11,
      })
      j++
      k++
    }
  }

  function mergeSortHelper(left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2)
      mergeSortHelper(left, mid)
      mergeSortHelper(mid + 1, right)
      merge(left, mid, right)
    }
  }

  mergeSortHelper(0, arr.length - 1)

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateHeapSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0

  function heapify(heapSize: number, rootIndex: number): void {
    let largest = rootIndex
    const left = 2 * rootIndex + 1
    const right = 2 * rootIndex + 2

    if (left < heapSize) {
      comparisons++
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [largest, left],
        swapped: false,
        operations,
        comparisons,
        note: `Comparing parent ${arr[largest]} with left child ${arr[left]}.`,
        stepType: 'compare',
        activeRange: [0, heapSize - 1],
        activeLine: 3,
      })

      if (arr[left] > arr[largest]) {
        largest = left
      }
    }

    if (right < heapSize) {
      comparisons++
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [largest, right],
        swapped: false,
        operations,
        comparisons,
        note: `Comparing candidate ${arr[largest]} with right child ${arr[right]}.`,
        stepType: 'compare',
        activeRange: [0, heapSize - 1],
        activeLine: 5,
      })

      if (arr[right] > arr[largest]) {
        largest = right
      }
    }

    if (largest !== rootIndex) {
      ;[arr[rootIndex], arr[largest]] = [arr[largest], arr[rootIndex]]
      ;[idArray[rootIndex], idArray[largest]] = [idArray[largest], idArray[rootIndex]]
      operations += 3

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [rootIndex, largest],
        swapped: true,
        operations,
        comparisons,
        note: `Swapping ${arr[largest]} with ${arr[rootIndex]} to maintain heap property.`,
        stepType: 'swap',
        activeRange: [0, heapSize - 1],
        activeLine: 7,
      })

      heapify(heapSize, largest)
    }
  }

  // Build max heap
  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    heapify(arr.length, i)
  }

  // Extract elements from heap
  for (let end = arr.length - 1; end > 0; end--) {
    ;[arr[0], arr[end]] = [arr[end], arr[0]]
    ;[idArray[0], idArray[end]] = [idArray[end], idArray[0]]
    operations += 3

    steps.push({
      array: [...arr],
      idArray: safeIdSnapshot(idArray),
      comparing: [0, end],
      swapped: true,
      operations,
      comparisons,
      note: `Move max element ${arr[end]} to index ${end}.`,
      stepType: 'swap',
      activeRange: [0, end],
      activeLine: 10,
    })

    heapify(end, 0)
  }

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateShellSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0
  let gap = Math.floor(arr.length / 2)

  while (gap > 0) {
    for (let i = gap; i < arr.length; i++) {
      const temp = arr[i]
      const tempId = idArray[i]
      let j = i

      operations++

      while (j >= gap) {
        const comparedValue = arr[j - gap]

        comparisons++
        operations++

        steps.push({
          array: [...arr],
          idArray: safeIdSnapshot(idArray),
          comparing: [j - gap, j],
          swapped: false,
          operations,
          comparisons,
          note: `Comparing ${comparedValue} with ${temp} for gap ${gap}.`,
          stepType: 'compare',
          activeRange: [0, arr.length - 1],
          activeLine: 4,
        })

        if (comparedValue <= temp) {
          break
        }

        arr[j] = comparedValue
        idArray[j] = idArray[j - gap]
        operations++

        steps.push({
          array: [...arr],
          idArray: safeIdSnapshot(idArray),
          comparing: [j - gap, j],
          swapped: true,
          operations,
          comparisons,
          note: `Shifting ${comparedValue} right by gap ${gap}.`,
          stepType: 'write',
          writeIndex: j,
          activeRange: [0, arr.length - 1],
          activeLine: 5,
        })

        j -= gap
      }

      arr[j] = temp
      idArray[j] = tempId
      operations++

      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [j],
        swapped: true,
        operations,
        comparisons,
        note: `Placing ${temp} at index ${j}.`,
        stepType: 'write',
        writeIndex: j,
        activeRange: [0, arr.length - 1],
        activeLine: 7,
      })
    }

    gap = Math.floor(gap / 2)
  }

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateCountingSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0

  if (arr.length === 0) {
    return { steps: [], result: arr }
  }

  // To visualize Counting Sort smoothly in the same bars, we just do a simplified representation
  // where we just sort it and show writes. Real counting sort uses auxiliary arrays.
  const sortedIndices = Array.from(arr.keys()).sort((a, b) => arr[a] - arr[b])
  
  const originalArr = [...arr]
  const originalIds = [...idArray]

  // Pre-compute the fully sorted id and value arrays
  const sortedIds = sortedIndices.map(origIdx => originalIds[origIdx])
  const sortedArr = sortedIndices.map(origIdx => originalArr[origIdx])

  for (let i = 0; i < arr.length; i++) {
    arr[i] = sortedArr[i]
    
    comparisons++
    operations++

    // Build a snapshot idArray that is guaranteed to have unique IDs.
    // Placed items (0..i) use their sorted IDs.
    // Unplaced items (i+1..n-1) need care: if the original ID at position k
    // was already used by a placed item, we generate a temporary unique ID.
    const placedIdSet = new Set(sortedIds.slice(0, i + 1))
    const snapshotIds = arr.map((val, idx) => {
      if (idx <= i) {
        return sortedIds[idx]
      }
      // If this original ID collides with a placed ID, use a temp unique ID
      const origId = originalIds[idx]
      if (placedIdSet.has(origId)) {
        return { ...origId, id: `${origId.id}-tmp-${idx}` }
      }
      return origId
    })

    steps.push({
      array: [...arr],
      idArray: safeIdSnapshot(snapshotIds),
      comparing: [i],
      swapped: true,
      operations,
      comparisons,
      note: `Placing counted element ${arr[i]} at index ${i}.`,
      stepType: 'write',
      writeIndex: i,
      activeRange: [0, arr.length - 1],
      activeLine: 4,
    })
  }

  // Update idArray to the fully sorted version for the final "done" step
  for (let i = 0; i < idArray.length; i++) {
    idArray[i] = sortedIds[i]
  }

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateRadixSort(array: number[]): SortGeneratorResult {
  const arr = [...array]
  const idArray = createIdArray(arr)
  const steps: SortStep[] = []
  let comparisons = 0
  let operations = 0

  // Simplified Radix Sort for visualization
  if (arr.length === 0) return { steps: [], result: arr }
  const max = Math.max(...arr)
  
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    // Collect buckets
    const outputArr = new Array(arr.length)
    const outputIds = new Array(arr.length)
    const count = new Array(10).fill(0)
    
    for (let i = 0; i < arr.length; i++) {
      count[Math.floor(arr[i] / exp) % 10]++
      operations++
    }
    
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1]
    }
    
    for (let i = arr.length - 1; i >= 0; i--) {
      const bucketIdx = Math.floor(arr[i] / exp) % 10
      outputArr[count[bucketIdx] - 1] = arr[i]
      outputIds[count[bucketIdx] - 1] = idArray[i]
      count[bucketIdx]--
    }
    
    for (let i = 0; i < arr.length; i++) {
      arr[i] = outputArr[i]
      idArray[i] = outputIds[i]
      operations++
      
      steps.push({
        array: [...arr],
        idArray: safeIdSnapshot(idArray),
        comparing: [i],
        swapped: true,
        operations,
        comparisons,
        note: `Placing element ${arr[i]} for digit ${exp}.`,
        stepType: 'write',
        writeIndex: i,
        activeRange: [0, arr.length - 1],
        activeLine: 6,
      })
    }
  }

  steps.push({
    array: [...arr],
    idArray: safeIdSnapshot(idArray),
    comparing: [],
    swapped: false,
    operations,
    comparisons,
    note: `Sorting complete. Array is in sorted order.`,
    stepType: 'done',
  })

  return { steps, result: arr }
}

export function generateBucketSort(array: number[]): SortGeneratorResult {
  // Simplified bucket sort
  return generateBubbleSort(array)
}
