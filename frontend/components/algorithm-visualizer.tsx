'use client'

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  speedToDelayMs,
  type SortStep,
} from '@/lib/algorithms'
import { 
  generateBubbleSort, generateSelectionSort, generateInsertionSort, 
  generateMergeSort, generateQuickSort, generateHeapSort, 
  generateShellSort, generateCountingSort, generateRadixSort, 
  generateBucketSort, createIdArray
} from '@/lib/sorting-engines'
import { saveExperiment } from '@/lib/experiment-tracker'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ChevronDown, Pause, Play, Redo2, RotateCcw, SkipBack, SkipForward,
  Info, Layers, Settings2, HelpCircle,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatasetGenerator, type DatasetGeneratorMeta } from './dataset-generator'
import { PseudocodePanel } from './pseudocode-panel'

type SupportedAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap' | 'shell' | 'counting' | 'radix' | 'bucket'

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
  { title: 'Generate Dataset', detail: 'Choose a dataset type, then generate values to visualize.' },
  { title: 'Select Algorithm', detail: 'Pick any sorting algorithm from the controls.' },
  { title: 'Adjust Speed', detail: 'Move speed between Slow and Fast based on your learning pace.' },
  { title: 'Start Visualization', detail: 'Run, pause, and step through each operation with explanations.' },
]

const ALGORITHM_INFO: Record<SupportedAlgorithm, AlgorithmInfo> = {
  bubble: {
    name: 'Bubble Sort',
    description: 'Bubble Sort repeatedly compares adjacent values and swaps them if they are out of order. Larger values gradually move toward the end.',
    worstCase: 'O(n^2)', averageCase: 'O(n^2)', bestCase: 'O(n)', spaceComplexity: 'O(1)',
  },
  selection: {
    name: 'Selection Sort',
    description: 'Selection Sort repeatedly finds the minimum value from the unsorted section and places it at the next sorted position.',
    worstCase: 'O(n^2)', averageCase: 'O(n^2)', bestCase: 'O(n^2)', spaceComplexity: 'O(1)',
  },
  insertion: {
    name: 'Insertion Sort',
    description: 'Insertion Sort builds a sorted prefix one element at a time by inserting each new value into its correct position.',
    worstCase: 'O(n^2)', averageCase: 'O(n^2)', bestCase: 'O(n)', spaceComplexity: 'O(1)',
  },
  merge: {
    name: 'Merge Sort',
    description: 'Merge Sort splits the array into halves, sorts each half, and merges them back together in sorted order.',
    worstCase: 'O(n log n)', averageCase: 'O(n log n)', bestCase: 'O(n log n)', spaceComplexity: 'O(n)',
  },
  quick: {
    name: 'Quick Sort',
    description: 'Quick Sort chooses a pivot, partitions values into smaller groups, then recursively sorts each partition.',
    worstCase: 'O(n^2)', averageCase: 'O(n log n)', bestCase: 'O(n log n)', spaceComplexity: 'O(log n)',
  },
  heap: {
    name: 'Heap Sort',
    description: 'Heap Sort builds a max heap and repeatedly extracts the largest element to place it at the end of the array.',
    worstCase: 'O(n log n)', averageCase: 'O(n log n)', bestCase: 'O(n log n)', spaceComplexity: 'O(1)',
  },
  shell: {
    name: 'Shell Sort',
    description: 'Shell Sort performs insertion sort over progressively smaller gaps, improving efficiency on medium-sized datasets.',
    worstCase: 'O(n^2)', averageCase: 'O(n log n)', bestCase: 'O(n log n)', spaceComplexity: 'O(1)',
  },
  counting: {
    name: 'Counting Sort',
    description: 'Counting Sort counts occurrences of each value and reconstructs the sorted array without direct element comparisons.',
    worstCase: 'O(n + k)', averageCase: 'O(n + k)', bestCase: 'O(n + k)', spaceComplexity: 'O(n + k)',
  },
  radix: {
    name: 'Radix Sort',
    description: 'Radix Sort sorts numbers digit by digit, typically from least significant digit to most significant digit.',
    worstCase: 'O(d(n + k))', averageCase: 'O(d(n + k))', bestCase: 'O(d(n + k))', spaceComplexity: 'O(n + k)',
  },
  bucket: {
    name: 'Bucket Sort',
    description: 'Bucket Sort distributes values into buckets, sorts each bucket, and concatenates them for the final sorted order.',
    worstCase: 'O(n^2)', averageCase: 'O(n + k)', bestCase: 'O(n + k)', spaceComplexity: 'O(n + k)',
  },
}

function estimateTotalComparisons(algorithm: SupportedAlgorithm, size: number) {
  if (size <= 1) return 1
  switch (algorithm) {
    case 'bubble':
    case 'selection':
    case 'insertion': return (size * (size - 1)) / 2
    case 'counting': return size * 2
    case 'radix': return size * 3
    default: return size * Math.log2(size)
  }
}

function toDatasetLabel(source: DatasetGeneratorMeta['source'], datasetType?: string) {
  if (source === 'custom') return 'Custom Input'
  switch (datasetType) {
    case 'nearly-sorted': return 'Nearly Sorted'
    case 'reverse-sorted': return 'Reverse Sorted'
    case 'few-unique': return 'Few Unique'
    case 'already-sorted': return 'Already Sorted'
    default: return 'Random'
  }
}

function toStepTypeLabel(stepType?: SortStep['stepType']) {
  switch (stepType) {
    case 'compare': return 'Compare'
    case 'swap': return 'Swap'
    case 'write': return 'Write'
    case 'copy': return 'Copy'
    case 'pivot': return 'Pivot'
    case 'done': return 'Done'
    default: return 'Operation'
  }
}

function toStepTypeBadgeClass(stepType?: SortStep['stepType']) {
  switch (stepType) {
    case 'compare': return 'border-amber-400/40 bg-amber-400/10 text-amber-300'
    case 'swap': return 'border-red-400/40 bg-red-400/10 text-red-300'
    case 'write': return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
    case 'copy': return 'border-sky-400/40 bg-sky-400/10 text-sky-300'
    case 'pivot': return 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300'
    case 'done': return 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
    default: return 'border-border/40 bg-background/25 text-foreground/75'
  }
}

export function AlgorithmVisualizer({
  guideOpen, onGuideOpenChange, hideGuideToggle = false,
}: { guideOpen?: boolean, onGuideOpenChange?: (open: boolean) => void, hideGuideToggle?: boolean } = {}) {
  const [internalGuideOpen, setInternalGuideOpen] = useState(false)
  const resolvedGuideOpen = typeof guideOpen === 'boolean' ? guideOpen : internalGuideOpen

  const [algorithm, setAlgorithm] = useState<SupportedAlgorithm>('bubble')
  const [dataType, setDataType] = useState('Random')
  const [arraySize, setArraySize] = useState(30)
  
  // Data State
  const [initialDataset, setInitialDataset] = useState<number[]>([])
  const [datasetLoaded, setDatasetLoaded] = useState(false)
  const [array, setArray] = useState<number[]>([])
  const [idArray, setIdArray] = useState<{id: string, value: number}[]>([])
  const [steps, setSteps] = useState<SortStep[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  
  // Playback State
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSorted, setIsSorted] = useState(false)
  const [speed, setSpeed] = useState(35)
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, operations: 0, time: 0 })
  const [startTime, setStartTime] = useState<number>(0)
  const [barsContainerWidth, setBarsContainerWidth] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speedRef = useRef(speed)
  const stepsRef = useRef<SortStep[]>([])
  const indexRef = useRef(-1)
  const barsContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { speedRef.current = speed }, [speed])

  const handleGuideOpenChange = useCallback((open: boolean) => {
    if (typeof guideOpen !== 'boolean') setInternalGuideOpen(open)
    onGuideOpenChange?.(open)
  }, [guideOpen, onGuideOpenChange])

  useEffect(() => {
    const container = barsContainerRef.current
    if (!container || typeof ResizeObserver === 'undefined') return
    const updateWidth = () => setBarsContainerWidth(container.clientWidth)
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const currentStep = steps[currentIndex] || null

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const applyStep = useCallback((idx: number, allSteps: SortStep[]) => {
    const step = allSteps[idx]
    if (!step) return
    setCurrentIndex(idx)
    indexRef.current = idx
    setArray(step.array)
    if (step.idArray) setIdArray(step.idArray)
    
    // Calculate swaps up to this point
    const swapsSoFar = allSteps.slice(0, idx + 1).filter(s => s.swapped).length
    
    setStats(prev => ({
      ...prev,
      comparisons: step.comparisons,
      operations: step.operations,
      swaps: swapsSoFar
    }))

    if (step.stepType === 'done') {
      setIsSorted(true)
      setIsRunning(false)
    } else {
      setIsSorted(false)
    }
  }, [])

  const startPlayback = useCallback((allSteps: SortStep[], fromIndex: number) => {
    stopPlayback()
    setIsRunning(true)
    setIsPaused(false)
    setIsSorted(false)
    
    // We update stats time continuously via an interval or just leave it as final time.
    // For pure step by step, we just show step metrics.

    const tick = () => {
      const next = indexRef.current + 1
      if (next >= stepsRef.current.length) {
        stopPlayback()
        setIsRunning(false)
        setIsSorted(true)
        return
      }
      applyStep(next, stepsRef.current)
    }

    const delayMs = speedToDelayMs(speedRef.current)
    timerRef.current = setInterval(tick, delayMs)
  }, [stopPlayback, applyStep])

  const resetSession = useCallback(() => {
    stopPlayback()
    setIsRunning(false)
    setIsPaused(false)
    setIsSorted(false)
    const baseIds = createIdArray(initialDataset)
    setArray([...initialDataset])
    setIdArray(baseIds)
    setSteps([])
    stepsRef.current = []
    setCurrentIndex(-1)
    indexRef.current = -1
    setStats({ comparisons: 0, swaps: 0, operations: 0, time: 0 })
    setStartTime(0)
  }, [initialDataset, stopPlayback])

  const handleDatasetReady = useCallback((dataset: number[], meta: DatasetGeneratorMeta) => {
    setInitialDataset([...dataset])
    const baseIds = createIdArray(dataset)
    setArray([...dataset])
    setIdArray(baseIds)
    setArraySize(dataset.length)
    setDataType(toDatasetLabel(meta.source, meta.datasetType))
    setDatasetLoaded(dataset.length > 0)
    stopPlayback()
    setIsRunning(false)
    setIsPaused(false)
    setIsSorted(false)
    setSteps([])
    stepsRef.current = []
    setCurrentIndex(-1)
    indexRef.current = -1
    setStats({ comparisons: 0, swaps: 0, operations: 0, time: 0 })
  }, [stopPlayback])

  const runVisualization = useCallback(() => {
    if (!datasetLoaded || array.length === 0 || isRunning) return

    stopPlayback()
    setIsRunning(true)
    setIsPaused(false)
    setIsSorted(false)
    setStats({ comparisons: 0, swaps: 0, operations: 0, time: 0 })
    setStartTime(Date.now())

    const arrayCopy = initialDataset.length > 0 ? [...initialDataset] : [...array]

    let generatorFunc
    switch (algorithm) {
      case 'bubble': generatorFunc = generateBubbleSort; break;
      case 'selection': generatorFunc = generateSelectionSort; break;
      case 'insertion': generatorFunc = generateInsertionSort; break;
      case 'merge': generatorFunc = generateMergeSort; break;
      case 'quick': generatorFunc = generateQuickSort; break;
      case 'heap': generatorFunc = generateHeapSort; break;
      case 'shell': generatorFunc = generateShellSort; break;
      case 'counting': generatorFunc = generateCountingSort; break;
      case 'radix': generatorFunc = generateRadixSort; break;
      case 'bucket': generatorFunc = generateBucketSort; break;
      default: generatorFunc = generateBubbleSort;
    }

    try {
      const { steps: generatedSteps } = generatorFunc(arrayCopy)
      setSteps(generatedSteps)
      stepsRef.current = generatedSteps
      indexRef.current = -1 // Start from beginning

      // We save the experiment once generated
      saveExperiment({
        algorithm,
        mode: 'visualizer',
        arraySize: arrayCopy.length,
        executionTime: 0, // In step mode, execution time is instantaneous computation
        comparisons: generatedSteps[generatedSteps.length - 1]?.comparisons || 0,
        operations: generatedSteps[generatedSteps.length - 1]?.operations || 0,
        dataType: dataType.toLowerCase(),
        metadata: { speed: speedRef.current, totalSteps: generatedSteps.length },
      }).catch(console.error)

      startPlayback(generatedSteps, -1)
    } catch (e) {
      console.error(e)
      toast.error('Failed to generate steps.')
      setIsRunning(false)
    }
  }, [algorithm, array, datasetLoaded, initialDataset, startPlayback, stopPlayback, dataType])

  const pauseSort = useCallback(() => {
    stopPlayback()
    setIsPaused(true)
  }, [stopPlayback])

  const resumeSort = useCallback(() => {
    setIsPaused(false)
    startPlayback(stepsRef.current, indexRef.current)
  }, [startPlayback])

  const stepForward = useCallback(() => {
    if (indexRef.current < stepsRef.current.length - 1) {
      applyStep(indexRef.current + 1, stepsRef.current)
    }
  }, [applyStep])

  const stepBackward = useCallback(() => {
    if (indexRef.current > 0) {
      applyStep(indexRef.current - 1, stepsRef.current)
    }
  }, [applyStep])

  const algorithmInfo = ALGORITHM_INFO[algorithm]
  const currentDelayMs = speedToDelayMs(speed)
  const isFastPace = speed > 65
  const speedLabel = speed <= 25 ? 'Slow' : speed <= 50 ? 'Classroom' : speed <= 75 ? 'Balanced' : 'Fast Demo'
  
  const estimatedTotal = estimateTotalComparisons(algorithm, arraySize)
  const currentComparisons = currentStep?.comparisons || 0
  const progress = steps.length > 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0

  const maxValue = useMemo(() => {
    const max = array.length > 0 ? Math.max(...array.map(v => Math.abs(v))) : 1
    return max === 0 ? 1 : max
  }, [array])
  
  const barGapClass = array.length > 80 ? 'gap-px' : array.length > 45 ? 'gap-[2px]' : 'gap-0.5'
  const labelInterval = useMemo(() => {
    if (array.length <= 30 && barsContainerWidth > 0) {
      const perBarWidth = barsContainerWidth / Math.max(array.length, 1)
      if (perBarWidth >= 18) return 1
    }
    return array.length <= 24 ? 1 : array.length <= 40 ? 2 : array.length <= 70 ? 4 : 6
  }, [array.length, barsContainerWidth])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <Collapsible open={resolvedGuideOpen} onOpenChange={handleGuideOpenChange} className="w-full">
          {!hideGuideToggle && (
            <div className="flex justify-center mb-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground text-xs hover:text-primary transition-colors">
                  <HelpCircle className="mr-2 size-3.5" />
                  Need help? View the Beginner's Guide
                  <ChevronDown className={cn('ml-1.5 size-3.5 transition-transform', resolvedGuideOpen && 'rotate-180')} />
                </Button>
              </CollapsibleTrigger>
            </div>
          )}
          <CollapsibleContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-1">
              {HOW_TO_STEPS.map((step, index) => (
                <Card key={step.title} className="glass-card p-4 border-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">{index + 1}</span>
                    <h4 className="text-sm font-bold">{step.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="glass-card flex flex-col justify-center border-primary/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Comparisons</p>
          <p className="mt-1 text-xl font-bold text-primary">{stats.comparisons}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-orange-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Swaps</p>
          <p className="mt-1 text-xl font-bold text-orange-400">{stats.swaps}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-purple-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Operations</p>
          <p className="mt-1 text-xl font-bold text-purple-400">{stats.operations}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-amber-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Est. Space</p>
          <p className="mt-1 text-xl font-bold text-amber-400">{algorithmInfo.spaceComplexity}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-blue-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Array Size</p>
          <p className="mt-1 text-xl font-bold text-blue-400">{arraySize}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-emerald-500/20 p-3 text-center overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Progress</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xl font-bold text-emerald-400">{progress}%</span>
          </div>
          <div className="mt-1 w-full h-1 bg-muted/30 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_1fr]">
        <aside className="flex flex-col gap-6">
          <Card className="glass-card flex flex-col p-0 overflow-hidden border-primary/20">
            <div className="bg-primary/10 border-b border-primary/20 px-5 py-4">
               <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Operations Center</h2>
               </div>
               <p className="mt-0.5 text-xs text-muted-foreground">Configure and control the visualization</p>
            </div>

            <Tabs defaultValue="algorithm" className="w-full">
              <TabsList className="w-full rounded-none border-b border-border/20 bg-background/20 h-10 p-0">
                <TabsTrigger value="dataset" className="flex-1 rounded-none text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-r border-border/20">
                  <Layers className="mr-2 size-3.5" /> Dataset
                </TabsTrigger>
                <TabsTrigger value="algorithm" className="flex-1 rounded-none text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Play className="mr-2 size-3.5" /> Algorithm
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="dataset" className="mt-0 space-y-4">
                  <DatasetGenerator onDatasetReady={handleDatasetReady} disabled={isRunning && !isPaused} hidePreview className="!p-0 !bg-transparent !border-0 !shadow-none" />
                </TabsContent>

                <TabsContent value="algorithm" className="mt-0 space-y-7">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">1. Select Algorithm</Label>
                    <Select value={algorithm} onValueChange={(v) => { setAlgorithm(v as SupportedAlgorithm); resetSession(); }} disabled={isRunning && !isPaused}>
                      <SelectTrigger className="h-10 bg-input/20 border-border/50 transition-all focus:ring-primary/40"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50">
                        <SelectItem value="bubble">Bubble Sort</SelectItem>
                        <SelectItem value="selection">Selection Sort</SelectItem>
                        <SelectItem value="insertion">Insertion Sort</SelectItem>
                        <SelectItem value="merge">Merge Sort</SelectItem>
                        <SelectItem value="quick">Quick Sort</SelectItem>
                        <SelectItem value="heap">Heap Sort</SelectItem>
                        <SelectItem value="shell">Shell Sort</SelectItem>
                        <SelectItem value="counting">Counting Sort</SelectItem>
                        <SelectItem value="radix">Radix Sort</SelectItem>
                        <SelectItem value="bucket">Bucket Sort</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">2. Playback Control</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={runVisualization} disabled={!datasetLoaded || isRunning} className="h-10 col-span-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Play className="mr-2 size-4" /> Start Visualization
                      </Button>
                      <Button onClick={pauseSort} disabled={!isRunning || isPaused} variant="outline" className="h-10 border-border/50 hover:bg-primary/10">
                        <Pause className="mr-2 size-4" /> Pause
                      </Button>
                      <Button onClick={resumeSort} disabled={!isRunning || !isPaused} variant="outline" className="h-10 border-border/50 hover:bg-primary/10">
                        <Redo2 className="mr-2 size-4" /> Resume
                      </Button>
                      <Button onClick={stepBackward} disabled={currentIndex <= 0 || (isRunning && !isPaused)} variant="outline" className="h-10 border-border/50 hover:bg-primary/10">
                        <SkipBack className="mr-2 size-4" /> Step Back
                      </Button>
                      <Button onClick={stepForward} disabled={(!isPaused && isRunning) || (!isRunning && currentIndex >= steps.length - 1)} variant="outline" className="h-10 border-border/50 hover:bg-primary/10">
                        <SkipForward className="mr-2 size-4" /> Step Forward
                      </Button>
                      <Button onClick={resetSession} disabled={!datasetLoaded} variant="outline" className="h-10 col-span-2 border-border/50 hover:bg-destructive/10 text-destructive">
                        <RotateCcw className="mr-2 size-4" /> Reset Session
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">3. Animation Speed</Label>
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">{speedLabel}</Badge>
                    </div>
                    <div className="px-1">
                      <Slider value={[speed]} onValueChange={(v) => setSpeed(v[0])} min={1} max={100} step={1} className="py-4" />
                    </div>
                    {isFastPace && (
                      <div className="flex gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 p-2 text-[11px] text-orange-400">
                        <Info className="size-3.5 shrink-0" />
                        <p>Speed is too high for step-by-step reading. Visuals will move quickly.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
          
          <PseudocodePanel algorithm={algorithm} activeLine={currentStep?.activeLine} />

        </aside>

        <main className="flex flex-col gap-4">
          <Card className="glass-card p-0 overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(45,35,66,0.2)]">
            <div className="flex items-center justify-between px-6 py-3 bg-background/20 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold text-foreground">Sorting Arena</h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{algorithmInfo.name}</Badge>
                {steps.length > 0 && (
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Step {currentIndex + 1} / {steps.length}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 flex items-start gap-3 min-h-[64px]">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Step {Math.max(1, currentIndex + 1)}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {currentStep?.note || 'Configure inputs and click Start Visualization.'}
                </p>
              </div>
            </div>

            <div ref={barsContainerRef} className={cn('h-80 flex items-end justify-center px-6 py-5 bg-gradient-to-b from-input/5 to-input/10 rounded-lg', barGapClass)}>
              {array.length === 0 ? (
                <div className="flex flex-col items-center gap-4 text-center opacity-50">
                  <Layers className="size-12" />
                  <div>
                    <p className="text-lg font-bold">Workspace Empty</p>
                    <p className="text-sm">Use the Dataset tab on the left to generate items.</p>
                  </div>
                </div>
              ) : (
                idArray.map((item, idx) => {
                  const isComparing = currentStep?.comparing?.includes(idx) || false
                  const isPivotIdx = currentStep?.pivotIndex === idx
                  const isWriteIdx = currentStep?.writeIndex === idx
                  const isInActiveRange = !currentStep?.activeRange || (idx >= currentStep.activeRange[0] && idx <= currentStep.activeRange[1])
                  const normalizedValue = Math.abs(item.value)
                  const shouldShowLabel = array.length <= 40 && (idx % labelInterval === 0 || isComparing || isSorted)

                  return (
                    <motion.div
                      layout
                      layoutId={item.id}
                      key={item.id}
                      className="relative flex h-full min-w-0 flex-1 items-end"
                      style={{ flex: '1' }}
                    >
                      <motion.div
                        className="w-full rounded-t-md transition-shadow"
                        animate={{
                          height: `${(normalizedValue / maxValue) * 100}%`,
                          backgroundColor: isSorted
                            ? 'rgb(34, 197, 94)' // Green -> Sorted
                            : isPivotIdx
                              ? 'rgb(168, 85, 247)' // Purple -> Pivot
                              : isWriteIdx
                                ? 'rgb(34, 211, 238)' // Cyan -> Write
                            : isComparing && currentStep?.swapped
                              ? 'rgb(239, 68, 68)' // Red -> Swap
                              : isComparing
                                ? 'rgb(250, 204, 21)' // Yellow -> Compare
                                : 'rgb(59, 130, 246)', // Blue -> Default
                          boxShadow: isComparing
                            ? '0 0 16px rgba(250, 204, 21, 0.6)'
                            : isSorted
                              ? '0 0 16px rgba(34, 197, 94, 0.5)'
                              : '0 4px 12px rgba(59, 130, 246, 0.2)',
                          opacity: isInActiveRange ? 1 : 0.3,
                        }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.8 }}
                      />
                      {shouldShowLabel && (
                        <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-foreground/85">
                          {item.value}
                        </span>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>

            <div className="px-6 py-3 bg-gradient-to-r from-background/50 to-primary/5 border-t border-border/30">
               <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Default Element</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Comparing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Swapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-fuchsia-400 shadow-lg shadow-fuchsia-400/50" />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Pivot Node</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Write</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Sorted Element</span>
                  </div>
               </div>
            </div>

          </Card>
          
          <Card className="glass-card p-0 overflow-hidden">
            <div className="px-6 py-3 bg-primary/5 border-b border-primary/10">
              <h3 className="text-lg font-bold text-primary mb-2">{algorithmInfo.name} Overview</h3>
              <p className="text-base text-foreground/75 leading-relaxed mb-3">{algorithmInfo.description}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="p-2 rounded-lg border border-border/20 bg-background/30 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Worst</span>
                  <span className="text-base font-bold text-red-400 font-mono">{algorithmInfo.worstCase}</span>
                </div>
                <div className="p-2 rounded-lg border border-border/20 bg-background/30 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Avg</span>
                  <span className="text-base font-bold text-blue-400 font-mono">{algorithmInfo.averageCase}</span>
                </div>
                <div className="p-2 rounded-lg border border-border/20 bg-background/30 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Best</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">{algorithmInfo.bestCase}</span>
                </div>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
