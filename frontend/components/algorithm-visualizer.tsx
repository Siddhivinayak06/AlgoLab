'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  bubbleSort,
  quickSort,
  mergeSort,
  isSortAbortedError,
  speedToDelayMs,
  type SortStep,
} from '@/lib/algorithms'
import { saveExperiment } from '@/lib/experiment-tracker'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ArrowLeftRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Pause,
  Play,
  Redo2,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react'
import {
  DatasetGenerator,
  type DatasetGeneratorMeta,
  type DatasetType,
} from './dataset-generator'

type SupportedAlgorithm = 'bubble' | 'quick' | 'merge'

interface AlgorithmInfo {
  name: string
  description: string
  worstCase: string
  averageCase: string
  bestCase: string
  spaceComplexity: string
}

type VisualStepType = NonNullable<SortStep['stepType']>

const HOW_TO_STEPS = [
  {
    title: 'Generate Dataset',
    detail: 'Choose a dataset type, then generate values to visualize.',
  },
  {
    title: 'Select Algorithm',
    detail: 'Pick Bubble, Quick, or Merge Sort from the controls.',
  },
  {
    title: 'Adjust Speed',
    detail: 'Move speed between Slow and Fast based on your learning pace.',
  },
  {
    title: 'Start Visualization',
    detail: 'Run, pause, and step through each operation with explanations.',
  },
]

const ALGORITHM_INFO: Record<SupportedAlgorithm, AlgorithmInfo> = {
  bubble: {
    name: 'Bubble Sort',
    description:
      'Bubble Sort repeatedly compares adjacent values and swaps them if they are out of order. Larger values gradually move toward the end.',
    worstCase: 'O(n^2)',
    averageCase: 'O(n^2)',
    bestCase: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  quick: {
    name: 'Quick Sort',
    description:
      'Quick Sort chooses a pivot, partitions values into smaller groups, then recursively sorts each partition.',
    worstCase: 'O(n^2)',
    averageCase: 'O(n log n)',
    bestCase: 'O(n log n)',
    spaceComplexity: 'O(log n)',
  },
  merge: {
    name: 'Merge Sort',
    description:
      'Merge Sort splits the array into halves, sorts each half, and merges them back together in sorted order.',
    worstCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    bestCase: 'O(n log n)',
    spaceComplexity: 'O(n)',
  },
}

const EXPLANATION_SPEED_THRESHOLD = 65
const FAST_PACE_MESSAGE =
  `Fast pace is active. Lower speed to ${EXPLANATION_SPEED_THRESHOLD} or below for detailed explanations.`

function estimateBubblePass(comparisons: number, size: number) {
  if (size <= 1) {
    return 1
  }

  let remainingComparisons = comparisons

  for (let pass = 1; pass <= size - 1; pass += 1) {
    const comparisonsInPass = size - pass

    if (remainingComparisons <= comparisonsInPass) {
      return pass
    }

    remainingComparisons -= comparisonsInPass
  }

  return size - 1
}

function estimateTotalComparisons(algorithm: SupportedAlgorithm, size: number) {
  if (size <= 1) {
    return 1
  }

  if (algorithm === 'bubble') {
    return (size * (size - 1)) / 2
  }

  return size * Math.log2(size)
}

function toDatasetLabel(source: DatasetGeneratorMeta['source'], datasetType?: DatasetType) {
  if (source === 'custom') {
    return 'Custom Input'
  }

  switch (datasetType) {
    case 'nearly-sorted':
      return 'Nearly Sorted'
    case 'reverse-sorted':
      return 'Reverse Sorted'
    case 'few-unique':
      return 'Few Unique'
    case 'already-sorted':
      return 'Already Sorted'
    default:
      return 'Random'
  }
}

function buildStepExplanation(step: SortStep, algorithm: SupportedAlgorithm) {
  if (step.note) {
    return step.note
  }

  const [leftIndex, rightIndex] = step.comparing
  const leftValue = typeof leftIndex === 'number' ? step.array[leftIndex] : undefined
  const rightValue = typeof rightIndex === 'number' ? step.array[rightIndex] : undefined

  if (typeof leftValue === 'number' && typeof rightValue === 'number') {
    if (algorithm === 'bubble') {
      const pass = estimateBubblePass(step.comparisons, step.array.length)

      if (step.swapped) {
        return `Pass ${pass} of Bubble Sort: swapping elements ${leftValue} and ${rightValue}.`
      }

      return `Pass ${pass} of Bubble Sort: comparing elements ${leftValue} and ${rightValue}.`
    }

    if (step.swapped) {
      return `Swapping elements ${leftValue} and ${rightValue} to improve order.`
    }

    return `Comparing elements ${leftValue} and ${rightValue}.`
  }

  return step.swapped
    ? 'Swapping elements to maintain sorted order.'
    : 'Comparing elements to determine the next move.'
}

function toStepTypeLabel(stepType?: SortStep['stepType']) {
  switch (stepType) {
    case 'compare':
      return 'Compare'
    case 'swap':
      return 'Swap'
    case 'write':
      return 'Write'
    case 'copy':
      return 'Copy'
    case 'pivot':
      return 'Pivot'
    case 'done':
      return 'Done'
    default:
      return 'Operation'
  }
}

function toStepTypeBadgeClass(stepType?: SortStep['stepType']) {
  switch (stepType) {
    case 'compare':
      return 'border-amber-400/40 bg-amber-400/10 text-amber-300'
    case 'swap':
      return 'border-red-400/40 bg-red-400/10 text-red-300'
    case 'write':
      return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
    case 'copy':
      return 'border-sky-400/40 bg-sky-400/10 text-sky-300'
    case 'pivot':
      return 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300'
    case 'done':
      return 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
    default:
      return 'border-border/40 bg-background/25 text-foreground/75'
  }
}

function toCompactStepSummary(stepMessage: string, maxLength: number = 92) {
  const normalized = stepMessage.replace(/^Review mode:\s*/i, '').replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`
}

export function AlgorithmVisualizer() {
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [arraySize, setArraySize] = useState(30)
  const [algorithm, setAlgorithm] = useState<SupportedAlgorithm>('bubble')
  const [dataType, setDataType] = useState('Random')
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [array, setArray] = useState<number[]>([])
  const [initialDataset, setInitialDataset] = useState<number[]>([])
  const [datasetLoaded, setDatasetLoaded] = useState(false)
  const [comparing, setComparing] = useState<number[]>([])
  const [isSwapStep, setIsSwapStep] = useState(false)
  const [sortedIndices, setSortedIndices] = useState<number[]>([])
  const [stepMessage, setStepMessage] = useState('Choose a dataset method to begin.')
  const [speed, setSpeed] = useState(35)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)
  const [stepType, setStepType] = useState<VisualStepType | null>(null)
  const [activeRange, setActiveRange] = useState<[number, number] | null>(null)
  const [pivotIndex, setPivotIndex] = useState<number | null>(null)
  const [writeIndex, setWriteIndex] = useState<number | null>(null)
  const [stats, setStats] = useState({
    comparisons: 0,
    swaps: 0,
    operations: 0,
    time: 0,
  })
  const [isSorted, setIsSorted] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)
  const stopRequestedRef = useRef(false)
  const stepForwardBudgetRef = useRef(0)
  const historyRef = useRef<SortStep[]>([])
  const swapsRef = useRef(0)
  const speedRef = useRef(speed)

  const algorithmInfo = ALGORITHM_INFO[algorithm]

  const applyHistoryFrame = useCallback(
    (requestedIndex: number) => {
      const timeline = historyRef.current
      if (timeline.length === 0) {
        return
      }

      const safeIndex = Math.max(0, Math.min(requestedIndex, timeline.length - 1))
      const frame = timeline[safeIndex]
      const swapsUntilFrame = timeline
        .slice(0, safeIndex + 1)
        .reduce((count, item) => count + (item.swapped ? 1 : 0), 0)

      setArray(frame.array)
      setComparing(frame.comparing)
      setIsSwapStep(Boolean(frame.swapped))
      setStats((previous) => ({
        ...previous,
        comparisons: frame.comparisons,
        swaps: swapsUntilFrame,
        operations: frame.operations,
      }))
      setProgress(Math.round(((safeIndex + 1) / timeline.length) * 100))
      setCurrentHistoryIndex(safeIndex)
      setCurrentStep(safeIndex + 1)
      setStepType(frame.stepType ?? null)
      setActiveRange(frame.activeRange ?? null)
      setPivotIndex(typeof frame.pivotIndex === 'number' ? frame.pivotIndex : null)
      setWriteIndex(typeof frame.writeIndex === 'number' ? frame.writeIndex : null)
      setStepMessage(`Review mode: ${buildStepExplanation(frame, algorithm)}`)
    },
    [algorithm]
  )

  const reset = useCallback(() => {
    stopRequestedRef.current = true
    isPausedRef.current = false
    stepForwardBudgetRef.current = 0
    historyRef.current = []
    swapsRef.current = 0

    const restored = initialDataset.length > 0 ? [...initialDataset] : []

    setArray(restored)
    setComparing([])
    setIsSwapStep(false)
    setSortedIndices([])
    if (restored.length > 0) {
      setArraySize(restored.length)
    }
    setStats({ comparisons: 0, swaps: 0, operations: 0, time: 0 })
    setProgress(0)
    setCurrentStep(0)
    setCurrentHistoryIndex(-1)
    setStepType(null)
    setActiveRange(null)
    setPivotIndex(null)
    setWriteIndex(null)
    setIsRunning(false)
    setIsPaused(false)
    setIsSorted(false)
    setDatasetLoaded(restored.length > 0)
    setStepMessage(
      restored.length > 0
        ? 'Visualization reset. Dataset is ready to run.'
        : 'Choose a dataset method to begin.'
    )
    startTimeRef.current = null
  }, [initialDataset])

  const handleDatasetReady = useCallback((dataset: number[], meta: DatasetGeneratorMeta) => {
    stopRequestedRef.current = true
    isPausedRef.current = false
    stepForwardBudgetRef.current = 0
    historyRef.current = []
    swapsRef.current = 0

    const nextDataset = [...dataset]

    setInitialDataset(nextDataset)
    setArray(nextDataset)
    setArraySize(nextDataset.length)
    setDataType(toDatasetLabel(meta.source, meta.datasetType))
    setDatasetLoaded(nextDataset.length > 0)
    setComparing([])
    setIsSwapStep(false)
    setSortedIndices([])
    setStats({ comparisons: 0, swaps: 0, operations: 0, time: 0 })
    setProgress(0)
    setCurrentStep(0)
    setCurrentHistoryIndex(-1)
    setStepType(null)
    setActiveRange(null)
    setPivotIndex(null)
    setWriteIndex(null)
    setIsRunning(false)
    setIsPaused(false)
    setIsSorted(false)
    setStepMessage(
      meta.source === 'custom'
        ? `Custom dataset loaded with ${nextDataset.length} values.`
        : `${toDatasetLabel(meta.source, meta.datasetType)} dataset generated with ${nextDataset.length} values.`
    )
    startTimeRef.current = null
  }, [])

  const handleAlgorithmChange = useCallback((value: string) => {
    const nextAlgorithm = value as SupportedAlgorithm

    if (nextAlgorithm === algorithm) {
      return
    }

    setAlgorithm(nextAlgorithm)

    stopRequestedRef.current = true
    isPausedRef.current = false
    stepForwardBudgetRef.current = 0
    historyRef.current = []
    swapsRef.current = 0

    const restored = initialDataset.length > 0 ? [...initialDataset] : []

    setArray(restored)
    setComparing([])
    setIsSwapStep(false)
    setSortedIndices([])
    setStats({ comparisons: 0, swaps: 0, operations: 0, time: 0 })
    setProgress(0)
    setCurrentStep(0)
    setCurrentHistoryIndex(-1)
    setStepType(null)
    setActiveRange(null)
    setPivotIndex(null)
    setWriteIndex(null)
    setIsRunning(false)
    setIsPaused(false)
    setIsSorted(false)
    startTimeRef.current = null

    setStepMessage(
      datasetLoaded
        ? `${ALGORITHM_INFO[nextAlgorithm].name} selected. Press Start to run step-by-step.`
        : 'Choose a dataset method to begin.'
    )
  }, [algorithm, datasetLoaded, initialDataset])

  const handleVisualizerStep = useCallback((step: SortStep) => {
    historyRef.current = [...historyRef.current, step]
    const latestHistoryIndex = historyRef.current.length - 1

    if (step.swapped) {
      swapsRef.current += 1
    }

    setArray(step.array)
    setComparing(step.comparing)
    setIsSwapStep(Boolean(step.swapped))

    setCurrentHistoryIndex(latestHistoryIndex)
    setCurrentStep(latestHistoryIndex + 1)
    setStepType(step.stepType ?? null)
    setActiveRange(step.activeRange ?? null)
    setPivotIndex(typeof step.pivotIndex === 'number' ? step.pivotIndex : null)
    setWriteIndex(typeof step.writeIndex === 'number' ? step.writeIndex : null)

    const estimatedTotal = estimateTotalComparisons(algorithm, step.array.length)
    const nextProgress = Math.min(100, Math.round((step.comparisons / estimatedTotal) * 100))
    setProgress(nextProgress)

    const detailedExplanationEnabled =
      speedRef.current <= EXPLANATION_SPEED_THRESHOLD ||
      isPausedRef.current ||
      stepForwardBudgetRef.current > 0 ||
      step.stepType === 'done'

    if (detailedExplanationEnabled) {
      setStepMessage(buildStepExplanation(step, algorithm))
    } else {
      setStepMessage((previous) =>
        previous === FAST_PACE_MESSAGE ? previous : FAST_PACE_MESSAGE
      )
    }

    setStats({
      comparisons: step.comparisons,
      swaps: swapsRef.current,
      operations: step.operations,
      time: startTimeRef.current ? Date.now() - startTimeRef.current : 0,
    })

    if (stepForwardBudgetRef.current > 0) {
      stepForwardBudgetRef.current -= 1

      if (stepForwardBudgetRef.current === 0) {
        isPausedRef.current = true
        setIsPaused(true)
      }
    }
  }, [algorithm])

  const handleSpeedChange = useCallback((values: number[]) => {
    const nextSpeed = values[0] ?? 50
    setSpeed(nextSpeed)
    speedRef.current = nextSpeed
  }, [])

  const runSort = useCallback(async () => {
    if (!datasetLoaded || array.length === 0 || isRunning) {
      return
    }

    const baseArray = initialDataset.length > 0 ? [...initialDataset] : [...array]

    setIsRunning(true)
    setIsPaused(false)
    setIsSorted(false)
    setSortedIndices([])
    setArray(baseArray)
    setProgress(0)
    setCurrentStep(0)
    setCurrentHistoryIndex(-1)
    setStepType(null)
    setActiveRange(null)
    setPivotIndex(null)
    setWriteIndex(null)
    setStats({ comparisons: 0, swaps: 0, operations: 0, time: 0 })
    setStepMessage('Sorting started. Follow comparisons and swaps in real time.')

    isPausedRef.current = false
    stopRequestedRef.current = false
    stepForwardBudgetRef.current = 0
    historyRef.current = []
    swapsRef.current = 0
    speedRef.current = speed

    startTimeRef.current = Date.now()
    const arrayCopy = [...baseArray]

    try {
      let result: { array: number[]; comparisons: number; operations: number } | undefined

      const control = {
        shouldPause: () => isPausedRef.current && stepForwardBudgetRef.current <= 0,
        shouldStop: () => stopRequestedRef.current,
        getSpeed: () => speedRef.current,
      }

      if (algorithm === 'bubble') {
        result = await bubbleSort(arrayCopy, handleVisualizerStep, speed, control)
      } else if (algorithm === 'quick') {
        result = await quickSort(arrayCopy, handleVisualizerStep, speed, control)
      } else if (algorithm === 'merge') {
        result = await mergeSort(arrayCopy, handleVisualizerStep, speed, control)
      }

      if (result && !stopRequestedRef.current) {
        const totalTime = startTimeRef.current ? Date.now() - startTimeRef.current : 0

        const finalFrame: SortStep = {
          array: [...result.array],
          comparing: [],
          swapped: false,
          comparisons: result.comparisons,
          operations: result.operations,
          stepType: 'done',
          note: 'Sorting complete. All elements are in non-decreasing order.',
        }

        const lastFrame = historyRef.current[historyRef.current.length - 1]
        const hasMatchingFinalFrame =
          Boolean(lastFrame) &&
          lastFrame.comparisons === finalFrame.comparisons &&
          lastFrame.operations === finalFrame.operations &&
          lastFrame.array.length === finalFrame.array.length &&
          lastFrame.array.every((value, index) => value === finalFrame.array[index])

        if (!hasMatchingFinalFrame) {
          historyRef.current = [...historyRef.current, finalFrame]
        }

        setArray(result.array)
        setSortedIndices(Array.from({ length: result.array.length }, (_, i) => i))
        setStats({
          comparisons: result.comparisons,
          swaps: swapsRef.current,
          operations: result.operations,
          time: totalTime,
        })
        setCurrentHistoryIndex(historyRef.current.length - 1)
        setCurrentStep(historyRef.current.length)
        setStepType('done')
        setActiveRange(null)
        setPivotIndex(null)
        setWriteIndex(null)
        setProgress(100)
        setIsSorted(true)
        setStepMessage('Sorting complete. All elements are in non-decreasing order.')

        try {
          await saveExperiment({
            algorithm,
            mode: 'visualizer',
            arraySize: result.array.length,
            executionTime: totalTime,
            comparisons: result.comparisons,
            operations: result.operations,
            dataType: dataType.toLowerCase(),
            metadata: {
              speed: speedRef.current,
              totalSteps: historyRef.current.length,
            },
          })
        } catch (error) {
          toast.error('Sorting finished, but experiment could not be saved')
          console.error(error)
        }
      } else if (stopRequestedRef.current) {
        setStepMessage('Visualization stopped. You can review recorded steps or reset.')
      }
    } catch (error) {
      if (!isSortAbortedError(error)) {
        toast.error('Sorting failed')
        console.error(error)
      }
    } finally {
      setIsRunning(false)
      stepForwardBudgetRef.current = 0

      if (!stopRequestedRef.current) {
        setIsPaused(false)
        isPausedRef.current = false
        setComparing([])
        setIsSwapStep(false)
      }
    }
  }, [array, algorithm, speed, handleVisualizerStep, isRunning, dataType, datasetLoaded, initialDataset])

  const pauseSort = useCallback(() => {
    if (!isRunning || isPaused) {
      return
    }

    setIsPaused(true)
    isPausedRef.current = true
    setStepMessage('Paused. Use Resume or Step Forward to continue.')
  }, [isPaused, isRunning])

  const resumeSort = useCallback(() => {
    if (!isRunning || !isPaused) {
      return
    }

    stepForwardBudgetRef.current = 0
    setIsPaused(false)
    isPausedRef.current = false
    setStepMessage('Resumed. Watching next operation...')
  }, [isPaused, isRunning])

  const stepForward = useCallback(() => {
    if (isRunning) {
      if (!isPaused) {
        setStepMessage('Pause the run before stepping forward.')
        return
      }

      stepForwardBudgetRef.current = 1
      setIsPaused(false)
      isPausedRef.current = false
      setStepMessage('Stepping forward by one operation...')
      return
    }

    if (historyRef.current.length === 0) {
      setStepMessage('No timeline available. Start visualization first.')
      return
    }

    if (currentHistoryIndex >= historyRef.current.length - 1) {
      setStepMessage('Already on the latest recorded step.')
      return
    }

    applyHistoryFrame(currentHistoryIndex + 1)
  }, [applyHistoryFrame, currentHistoryIndex, isPaused, isRunning])

  const stepBackward = useCallback(() => {
    if (historyRef.current.length === 0) {
      setStepMessage('No timeline available. Start visualization first.')
      return
    }

    if (isRunning && !isPaused) {
      setStepMessage('Pause the run before stepping backward.')
      return
    }

    if (currentHistoryIndex <= 0) {
      applyHistoryFrame(0)
      setStepMessage('Already at the first recorded step.')
      return
    }

    if (isRunning) {
      stopRequestedRef.current = true
      isPausedRef.current = false
      setIsPaused(false)
    }

    setIsSorted(false)
    setSortedIndices([])
    applyHistoryFrame(currentHistoryIndex - 1)
  }, [applyHistoryFrame, currentHistoryIndex, isPaused, isRunning])

  const maxValue = array.length > 0 ? Math.max(...array.map((value) => Math.abs(value))) : 1
  const barGapClass = array.length > 80 ? 'gap-px' : array.length > 45 ? 'gap-[2px]' : 'gap-0.5'
  const sortedLookup = new Set(sortedIndices)
  const operationLabel = toStepTypeLabel(stepType ?? undefined)
  const compactStepSummary = toCompactStepSummary(stepMessage)
  const currentDelayMs = speedToDelayMs(speed)
  const isFastExplanationMode = isRunning && !isPaused && speed > EXPLANATION_SPEED_THRESHOLD
  const speedLabel =
    speed <= 25
      ? 'Teacher Pace'
      : speed <= 50
        ? 'Classroom Pace'
        : speed <= 75
          ? 'Balanced Pace'
          : 'Fast Demo Pace'
  const labelInterval =
    array.length <= 24 ? 1 : array.length <= 40 ? 2 : array.length <= 70 ? 4 : 6

  return (
    <div className="space-y-4">
      <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <Card className="glass-card gap-3 p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/85">How to Use</h2>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-primary/35 bg-primary/10 text-primary hover:bg-primary/20">
                Beginner Guide
                <ChevronDown className={cn('ml-1.5 size-4 transition-transform', isGuideOpen && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
              {HOW_TO_STEPS.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-border/40 bg-background/25 p-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Step {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-xs text-foreground/70">{step.detail}</p>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(360px,35%)_minmax(0,65%)]">
        <div className="order-2 space-y-4 xl:order-1">
          <DatasetGenerator onDatasetReady={handleDatasetReady} disabled={isRunning} />

          <Card className="glass-card gap-4 p-4">
            <h2 className="text-lg font-bold text-foreground">Visualization Controls</h2>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label className="text-foreground">Algorithm</Label>
                <Select
                  value={algorithm}
                  onValueChange={handleAlgorithmChange}
                  disabled={isRunning}
                >
                  <SelectTrigger className="h-9 bg-input/45 border-border/50 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50">
                    <SelectItem value="bubble">Bubble Sort</SelectItem>
                    <SelectItem value="quick">Quick Sort</SelectItem>
                    <SelectItem value="merge">Merge Sort</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Speed</Label>
                <Slider
                  value={[speed]}
                  onValueChange={handleSpeedChange}
                  min={1}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-foreground/70">
                  <span>Slow</span>
                  <span className="font-mono tracking-wide text-foreground/60">&larr;─────●─────&rarr;</span>
                  <span>Fast</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-foreground/70">
                  <span>{speedLabel}</span>
                  <span>~{currentDelayMs} ms/step</span>
                </div>
                {isFastExplanationMode && (
                  <p className="text-[11px] text-amber-300/90">
                    Detailed explanation pauses in fast mode. Reduce speed to {EXPLANATION_SPEED_THRESHOLD} or below.
                  </p>
                )}
                <p className="text-[11px] text-foreground/60">Speed changes apply immediately during playback.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 2xl:grid-cols-3">
              <Button
                onClick={() => void runSort()}
                disabled={!datasetLoaded || array.length === 0 || isRunning}
                className="h-10 justify-center rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Play className="mr-2 size-4" />
                Start
              </Button>

              <Button
                onClick={pauseSort}
                disabled={!isRunning || isPaused}
                variant="outline"
                className="h-10 justify-center rounded-lg border-border/50 text-foreground hover:bg-card/50"
              >
                <Pause className="mr-2 size-4" />
                Pause
              </Button>

              <Button
                onClick={resumeSort}
                disabled={!isRunning || !isPaused}
                variant="outline"
                className="h-10 justify-center rounded-lg border-border/50 text-foreground hover:bg-card/50"
              >
                <Redo2 className="mr-2 size-4" />
                Resume
              </Button>

              <Button
                onClick={stepForward}
                variant="outline"
                disabled={(!isPaused && isRunning) || (!isRunning && currentHistoryIndex >= historyRef.current.length - 1)}
                className="h-10 justify-center rounded-lg border-border/50 text-foreground hover:bg-card/50"
              >
                <SkipForward className="mr-2 size-4" />
                <span className="hidden sm:inline">Step Forward</span>
                <span className="sm:hidden">Forward</span>
              </Button>

              <Button
                onClick={stepBackward}
                variant="outline"
                disabled={historyRef.current.length === 0 || currentHistoryIndex <= 0 || (isRunning && !isPaused)}
                className="h-10 justify-center rounded-lg border-border/50 text-foreground hover:bg-card/50"
              >
                <SkipBack className="mr-2 size-4" />
                <span className="hidden sm:inline">Step Backward</span>
                <span className="sm:hidden">Backward</span>
              </Button>

              <Button
                onClick={reset}
                disabled={!datasetLoaded}
                variant="outline"
                className="h-10 justify-center rounded-lg border-border/50 text-foreground hover:bg-card/50"
              >
                <RotateCcw className="mr-2 size-4" />
                Reset
              </Button>
            </div>

            {!datasetLoaded && (
              <p className="text-xs text-foreground/60">
                Start stays disabled until a dataset is generated or loaded.
              </p>
            )}
          </Card>

          <Card className="glass-card gap-3 p-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">Live Metrics</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-border/35 bg-background/25 p-2.5">
                <p className="text-[11px] text-foreground/60">Comparisons</p>
                <p className="text-lg font-semibold text-primary">{stats.comparisons}</p>
              </div>
              <div className="rounded-lg border border-border/35 bg-background/25 p-2.5">
                <p className="text-[11px] text-foreground/60">Swaps</p>
                <p className="text-lg font-semibold text-orange-400">{stats.swaps}</p>
              </div>
              <div className="rounded-lg border border-border/35 bg-background/25 p-2.5">
                <p className="text-[11px] text-foreground/60">Operations</p>
                <p className="text-lg font-semibold text-accent">{stats.operations}</p>
              </div>
              <div className="rounded-lg border border-border/35 bg-background/25 p-2.5">
                <p className="text-[11px] text-foreground/60">Execution Time</p>
                <p className="text-lg font-semibold text-secondary">{stats.time}ms</p>
              </div>
              <div className="rounded-lg border border-border/35 bg-background/25 p-2.5">
                <p className="text-[11px] text-foreground/60">Array Size</p>
                <p className="text-lg font-semibold text-foreground">{arraySize}</p>
              </div>
              <div className="rounded-lg border border-border/35 bg-background/25 p-2.5">
                <p className="text-[11px] text-foreground/60">Progress %</p>
                <p className="text-lg font-semibold text-emerald-400">{progress}%</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card gap-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/80">
                Current Step Explanation
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-xs', toStepTypeBadgeClass(stepType ?? undefined))}>
                  {operationLabel}
                </Badge>
                <Badge variant="outline" className="border-border/40 bg-background/25 text-foreground/75">
                  Step {currentStep}
                </Badge>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-foreground/85">{stepMessage}</p>
            {algorithm === 'merge' && stepType === 'compare' && (
              <p className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-100/90">
                Merge Sort compares values from temporary partitions before writing into the main array.
              </p>
            )}
            <p className="text-xs text-foreground/65">
              Dataset Type: <span className="font-semibold text-foreground/85">{dataType}</span>
            </p>

            <div className="grid grid-cols-1 gap-2 text-xs text-foreground/75 sm:grid-cols-3">
              <div className="rounded-md border border-border/35 bg-background/20 px-2 py-1.5">
                Active Range:{' '}
                <span className="font-semibold text-foreground/90">
                  {activeRange ? `${activeRange[0]}-${activeRange[1]}` : 'N/A'}
                </span>
              </div>
              <div className="rounded-md border border-border/35 bg-background/20 px-2 py-1.5">
                Pivot Index:{' '}
                <span className="font-semibold text-foreground/90">
                  {typeof pivotIndex === 'number' ? pivotIndex : 'N/A'}
                </span>
              </div>
              <div className="rounded-md border border-border/35 bg-background/20 px-2 py-1.5">
                Write Index:{' '}
                <span className="font-semibold text-foreground/90">
                  {typeof writeIndex === 'number' ? writeIndex : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-1">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/65">Color Legend</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 p-2 text-xs text-foreground/80">
                  <Circle className="size-4 text-blue-500" />
                  <span>Blue: Normal</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 p-2 text-xs text-foreground/80">
                  <ArrowLeftRight className="size-4 text-yellow-400" />
                  <span>Yellow: Comparing</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 p-2 text-xs text-foreground/80">
                  <ArrowLeftRight className="size-4 text-red-500" />
                  <span>Red: Swapping</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 p-2 text-xs text-foreground/80">
                  <Circle className="size-4 text-fuchsia-400" />
                  <span>Pink: Pivot</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 p-2 text-xs text-foreground/80">
                  <Circle className="size-4 text-cyan-400" />
                  <span>Cyan: Merge Write</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-background/20 p-2 text-xs text-foreground/80">
                  <CheckCircle2 className="size-4 text-green-500" />
                  <span>Green: Sorted</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="order-1 self-start xl:order-2 xl:sticky xl:top-24">
          <Card className="glass-card gap-3 p-4 shadow-[0_10px_34px_rgba(76,29,149,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-foreground">Visualization</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                  {algorithmInfo.name}
                </Badge>
                <Badge variant="outline" className="border-border/40 bg-background/20 text-foreground/75">
                  {progress}%
                </Badge>
              </div>
            </div>

            <div className="space-y-1.5 rounded-lg border border-border/30 bg-background/20 p-3">
              <div className="flex items-center justify-between text-xs text-foreground/75">
                <span>Sorting Progress</span>
                <span>{progress}% complete</span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </div>

            <div className="space-y-1 rounded-lg border border-border/30 bg-background/20 p-3">
              <div className="flex items-center justify-between text-[11px] text-foreground/70">
                <span>Step Summary</span>
                <span>{operationLabel}</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/85">{compactStepSummary}</p>
            </div>

            <div className={cn('flex min-h-[420px] h-[450px] xl:h-[500px] items-end justify-center rounded-xl border border-border/35 bg-input/20 p-4 shadow-inner', barGapClass)}>
              {array.length === 0 ? (
                <p className="text-sm text-foreground/60">
                  Generate a dataset on the left, then start visualization.
                </p>
              ) : (
                array.map((value, idx) => {
                  const isComparing = comparing.includes(idx)
                  const isSortedIdx = sortedLookup.has(idx)
                  const isPivotIdx = typeof pivotIndex === 'number' && pivotIndex === idx
                  const isWriteIdx = typeof writeIndex === 'number' && writeIndex === idx
                  const isInActiveRange =
                    !activeRange || (idx >= activeRange[0] && idx <= activeRange[1])
                  const normalizedValue = Math.abs(value)
                  const shouldShowLabel =
                    idx % labelInterval === 0 || isComparing || isSortedIdx || idx === array.length - 1

                  return (
                    <div
                      key={idx}
                      className="relative flex h-full min-w-0 flex-1 items-end pb-5"
                      style={{
                        flex: '1',
                      }}
                    >
                      <motion.div
                        className="w-full rounded-t"
                        title={`Index ${idx + 1}: ${value}`}
                        animate={{
                          height: `${(normalizedValue / maxValue) * 100}%`,
                          backgroundColor: isSortedIdx
                            ? 'rgb(34, 197, 94)'
                            : isPivotIdx
                              ? 'rgb(232, 121, 249)'
                              : isWriteIdx
                                ? 'rgb(34, 211, 238)'
                            : isComparing && isSwapStep
                              ? 'rgb(239, 68, 68)'
                              : isComparing
                                ? 'rgb(250, 204, 21)'
                                : 'rgb(59, 130, 246)',
                          boxShadow: isComparing
                            ? '0 0 16px rgba(250, 204, 21, 0.48)'
                            : isPivotIdx
                              ? '0 0 16px rgba(232, 121, 249, 0.45)'
                              : isWriteIdx
                                ? '0 0 16px rgba(34, 211, 238, 0.45)'
                            : isSortedIdx
                              ? '0 0 16px rgba(34, 197, 94, 0.45)'
                              : '0 0 0 rgba(0,0,0,0)',
                          opacity: isInActiveRange ? 1 : 0.45,
                        }}
                        transition={{
                          type: 'spring',
                          damping: 18,
                          stiffness: 230,
                          mass: 0.4,
                        }}
                      />

                      {shouldShowLabel && (
                        <span className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-medium text-foreground/70">
                          {value}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {isSorted && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-primary/45 bg-primary/15 px-3 py-2 text-center"
              >
                <p className="text-sm font-semibold text-primary">Sorting complete. All elements are ordered.</p>
              </motion.div>
            )}
          </Card>
        </div>
      </div>

      <Card className="glass-card gap-4 p-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Algorithm Information</h2>
          <Badge variant="outline" className="mt-2 border-primary/40 bg-primary/10 text-primary">
            {algorithmInfo.name}
          </Badge>
          <p className="mt-1.5 text-sm text-foreground/75">{algorithmInfo.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/30 bg-background/25 p-3">
            <p className="text-xs text-foreground/60">Worst Case</p>
            <p className="mt-1 text-base font-semibold text-foreground">{algorithmInfo.worstCase}</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/25 p-3">
            <p className="text-xs text-foreground/60">Average Case</p>
            <p className="mt-1 text-base font-semibold text-foreground">{algorithmInfo.averageCase}</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/25 p-3">
            <p className="text-xs text-foreground/60">Best Case</p>
            <p className="mt-1 text-base font-semibold text-foreground">{algorithmInfo.bestCase}</p>
          </div>
          <div className="rounded-lg border border-border/30 bg-background/25 p-3">
            <p className="text-xs text-foreground/60">Space Complexity</p>
            <p className="mt-1 text-base font-semibold text-foreground">{algorithmInfo.spaceComplexity}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
