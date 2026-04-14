'use client'

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  RotateCcw,
  Pause,
  Redo2,
  SkipBack,
  SkipForward,
  Info,
  Layers,
  Settings2,
  Search,
  Target,
  Hash,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  binarySearch,
  generateSortedArray,
  type SortStep,
  type SortExecutionControl,
  isSortAbortedError,
} from '@/lib/algorithms'
import { cn } from '@/lib/utils'
import { DatasetGenerator, type DatasetGeneratorMeta } from './dataset-generator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const HOW_TO_STEPS = [
  {
    title: 'Generate Sorted Data',
    detail: 'Binary search only works on sorted arrays. Use the Dataset tab to create one.',
  },
  {
    title: 'Set Search Target',
    detail: 'Enter a number you want to find in the "Search" tab.',
  },
  {
    title: 'Start Search',
    detail: 'Watch as the algorithm repeatedly halves the search space.',
  },
  {
    title: 'Found!',
    detail: 'If the value exists, it will be highlighted in green.',
  },
]

export function BinarySearchVisualizer() {
  const [array, setArray] = useState<number[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [target, setTarget] = useState(50)
  const [comparing, setComparing] = useState<number[]>([])
  const [foundIndex, setFoundIndex] = useState<number | null>(null)
  const [activeRange, setActiveRange] = useState<[number, number] | null>(null)
  const [speed, setSpeed] = useState(50)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepMessage, setStepMessage] = useState('Ready to search...')
  const [stats, setStats] = useState({
    comparisons: 0,
    steps: 0,
  })
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  const labelInterval =
    array.length <= 24 ? 1 : array.length <= 40 ? 2 : array.length <= 70 ? 4 : 6

  const stopSignalRef = useRef(false)
  const pauseSignalRef = useRef(false)
  const historyRef = useRef<SortStep[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)

  const executionControl = useMemo<SortExecutionControl>(
    () => ({
      shouldPause: () => pauseSignalRef.current,
      shouldStop: () => stopSignalRef.current,
      getSpeed: () => speed,
    }),
    [speed]
  )

  const maxValue = useMemo(() => (array.length > 0 ? Math.max(...array) : 100), [array])
  const speedLabel = speed <= 25 ? 'Slow' : speed <= 50 ? 'Medium' : speed <= 75 ? 'Fast' : 'Hyper'

  // Reset function
  const reset = useCallback(() => {
    stopSignalRef.current = true
    setIsRunning(false)
    setIsPaused(false)
    pauseSignalRef.current = false
    setComparing([])
    setFoundIndex(null)
    setActiveRange(null)
    setCurrentStep(0)
    setStepMessage('Visualizer reset.')
    setStats({ comparisons: 0, steps: 0 })
    historyRef.current = []
    setCurrentHistoryIndex(-1)

    setTimeout(() => {
      stopSignalRef.current = false
    }, 100)
  }, [])

  const handleDatasetReady = useCallback((newData: number[], meta: DatasetGeneratorMeta) => {
    const sorted = [...newData].sort((a, b) => a - b)
    setArray(sorted)
    reset()
    setStepMessage(`Dataset generated (${meta.arraySize} sorted items)`)
  }, [reset])

  const applyStep = useCallback((step: SortStep) => {
    setComparing(step.comparing)
    setActiveRange(step.activeRange ?? null)
    setStats({
      comparisons: step.comparisons,
      steps: step.operations,
    })
    setStepMessage(step.note ?? '')
  }, [])

  const runSearch = useCallback(async () => {
    if (array.length === 0) return
    reset()
    
    setIsRunning(true)
    stopSignalRef.current = false
    pauseSignalRef.current = false

    try {
      const result = await binarySearch(
        array,
        target,
        (step) => {
          historyRef.current.push(step)
          setCurrentHistoryIndex(historyRef.current.length - 1)
          applyStep(step)
          setCurrentStep((prev) => prev + 1)
        },
        speed,
        executionControl
      )

      if (result.found) {
        setFoundIndex(result.index)
        setStepMessage(`Found ${target} at index ${result.index}!`)
      } else {
        setStepMessage(`${target} not found in the array.`)
      }
    } catch (err) {
      if (!isSortAbortedError(err)) {
        console.error('Search failed:', err)
      }
    } finally {
      setIsRunning(false)
      setComparing([])
    }
  }, [array, target, speed, executionControl, applyStep, reset])

  const pauseSort = () => {
    setIsPaused(true)
    pauseSignalRef.current = true
  }

  const resumeSort = () => {
    setIsPaused(false)
    pauseSignalRef.current = false
  }

  const stepForward = () => {
    if (currentHistoryIndex < historyRef.current.length - 1) {
      const nextIdx = currentHistoryIndex + 1
      setCurrentHistoryIndex(nextIdx)
      applyStep(historyRef.current[nextIdx])
    }
  }

  const stepBackward = () => {
    if (currentHistoryIndex > 0) {
      const prevIdx = currentHistoryIndex - 1
      setCurrentHistoryIndex(prevIdx)
      applyStep(historyRef.current[prevIdx])
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Metrics Bar ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <div className="glass-card flex flex-col justify-center border-primary/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Comparisons</p>
          <p className="mt-1 text-xl font-bold text-primary">{stats.comparisons}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-purple-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Logarithmic Steps</p>
          <p className="mt-1 text-xl font-bold text-purple-400">{stats.steps}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-blue-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Search Space</p>
          <p className="mt-1 text-xl font-bold text-blue-400">
            {activeRange ? activeRange[1] - activeRange[0] + 1 : array.length}
          </p>
        </div>
        <div className="glass-card flex flex-col justify-center border-emerald-500/20 p-3 text-center overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Status</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            {foundIndex !== null ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Found at {foundIndex}</Badge>
            ) : isRunning ? (
              <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse">Searching...</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Ready</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_1fr]">
        {/* ── Left Sidebar / Operations Center ── */}
        <aside className="flex flex-col gap-6">
          <Card className="glass-card flex flex-col p-0 overflow-hidden border-primary/20">
            <div className="bg-primary/10 border-b border-primary/20 px-5 py-4">
               <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Operations Center</h2>
               </div>
               <p className="mt-0.5 text-xs text-muted-foreground">Configure search parameters</p>
            </div>

            <Tabs defaultValue="search" className="w-full">
              <TabsList className="w-full rounded-none border-b border-border/20 bg-background/20 h-10 p-0">
                <TabsTrigger value="dataset" className="flex-1 rounded-none text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-r border-border/20">
                  <Layers className="mr-2 size-3.5" />
                  Dataset
                </TabsTrigger>
                <TabsTrigger value="search" className="flex-1 rounded-none text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Search className="mr-2 size-3.5" />
                  Search
                </TabsTrigger>
              </TabsList>

              <div className="p-5">
                <TabsContent value="dataset" className="mt-0 space-y-4">
                  <DatasetGenerator 
                    onDatasetReady={handleDatasetReady} 
                    disabled={isRunning} 
                    hideTypeSelector
                    hidePreview 
                    className="!p-0 !bg-transparent !border-0 !shadow-none" 
                  />
                  <div className="flex gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-[11px] text-blue-400">
                    <Info className="size-4 shrink-0" />
                    <p>Datasets are automatically sorted after generation for binary search.</p>
                  </div>
                </TabsContent>

                <TabsContent value="search" className="mt-0 space-y-6">
                  {/* Target Input */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">1. Target Value</Label>
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                        Seeking: {target}
                      </Badge>
                    </div>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(Number(e.target.value))}
                        disabled={isRunning}
                        className="pl-10 h-10 bg-input/20 border-border/50 text-foreground transition-all focus:ring-primary/40"
                        placeholder="Enter value to find..."
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-[10px] font-bold uppercase h-8 border-border/50"
                      onClick={() => array.length > 0 && setTarget(array[Math.floor(Math.random() * array.length)])}
                      disabled={isRunning || array.length === 0}
                    >
                      Pick Random from Array
                    </Button>
                  </div>

                  {/* Playback Controls */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">2. Search Control</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => void runSearch()}
                        disabled={array.length === 0 || isRunning}
                        className="h-10 col-span-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      >
                        <Play className="mr-2 size-4" />
                        Start Search
                      </Button>
                      <Button
                        onClick={pauseSort}
                        disabled={!isRunning || isPaused}
                        variant="outline"
                        className="h-10 border-border/50 hover:bg-primary/10 hover:border-primary/30"
                      >
                        <Pause className="mr-2 size-4" />
                        Pause
                      </Button>
                      <Button
                        onClick={resumeSort}
                        disabled={!isRunning || !isPaused}
                        variant="outline"
                        className="h-10 border-border/50 hover:bg-primary/10 hover:border-primary/30"
                      >
                        <Redo2 className="mr-2 size-4" />
                        Resume
                      </Button>
                      <Button
                        onClick={stepBackward}
                        variant="outline"
                        disabled={historyRef.current.length === 0 || currentHistoryIndex <= 0 || (isRunning && !isPaused)}
                        className="h-10 border-border/50 hover:bg-primary/10 hover:border-primary/30"
                      >
                        <SkipBack className="mr-2 size-4" />
                        Back
                      </Button>
                      <Button
                        onClick={stepForward}
                        variant="outline"
                        disabled={(!isPaused && isRunning) || (!isRunning && currentHistoryIndex >= historyRef.current.length - 1)}
                        className="h-10 border-border/50 hover:bg-primary/10 hover:border-primary/30"
                      >
                        <SkipForward className="mr-2 size-4" />
                        Next
                      </Button>
                      <Button
                        onClick={reset}
                        disabled={array.length === 0}
                        variant="outline"
                        className="h-10 col-span-2 border-border/50 hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <RotateCcw className="mr-2 size-4" />
                        Reset
                      </Button>
                    </div>
                  </div>

                  {/* Speed Controller */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">3. Animation Speed</Label>
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">
                        {speedLabel}
                      </Badge>
                    </div>
                    <Slider
                      value={[speed]}
                      onValueChange={(v) => setSpeed(v[0])}
                      min={1}
                      max={100}
                      step={1}
                      className="py-4"
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          {/* Dataset Preview (Permanent) */}
          <Card className={cn("glass-card p-4 space-y-3 transition-all", array.length === 0 && "opacity-50")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Dataset Preview</h3>
              </div>
              <Badge variant="outline" className="text-[10px] border-border/50 bg-background/30">
                {array.length} items
              </Badge>
            </div>
            {array.length === 0 ? (
               <p className="text-[11px] text-muted-foreground italic">No dataset generated yet.</p>
            ) : (
              <div className="max-h-32 overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-1.5">
                  {array.map((value, index) => (
                    <span
                      key={`${value}-${index}`}
                      className="rounded-md border border-border/50 bg-background/45 px-2 py-0.5 font-mono text-[11px] text-foreground/85"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-4 text-purple-400" />
              <h3 className="text-sm font-bold text-foreground">Current State</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Low Index</span>
                <span className="font-mono text-blue-400">{activeRange ? activeRange[0] : 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">High Index</span>
                <span className="font-mono text-blue-400">{activeRange ? activeRange[1] : 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current Mid</span>
                <span className="font-mono text-yellow-400">
                  {comparing.length > 2 ? comparing[2] : 'None'}
                </span>
              </div>
            </div>
          </Card>
        </aside>

        {/* ── Right Column: Visualization ── */}
        <main className="flex flex-col gap-6">
          <Card className="glass-card h-full p-0 overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(45,35,66,0.2)]">
            {/* Viz Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-background/20 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                <h2 className="text-base font-bold text-foreground">Search Arena</h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase tracking-tighter text-[10px]">
                  Binary Search
                </Badge>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Target: {target}
                </div>
              </div>
            </div>

            {/* Step Message bar */}
            <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 flex items-center gap-3">
              <Info className="size-4 text-primary shrink-0" />
              <p className="text-sm text-foreground/90 font-medium truncate">{stepMessage}</p>
            </div>

            {/* Bars Area */}
            <div className="flex-1 flex items-end justify-center px-6 py-8 min-h-[460px] bg-input/5 gap-0.5 sm:gap-1">
              {array.length === 0 ? (
                <div className="flex flex-col items-center gap-4 text-center opacity-50">
                  <Layers className="size-12" />
                  <div>
                    <p className="text-lg font-bold">Workspace Empty</p>
                    <p className="text-sm">Generate a sorted dataset to begin searching.</p>
                  </div>
                </div>
              ) : (
                array.map((value, idx) => {
                  const isMid = comparing.length > 2 && comparing[2] === idx
                  const isLow = activeRange && activeRange[0] === idx
                  const isHigh = activeRange && activeRange[1] === idx
                  const isInRange = activeRange && idx >= activeRange[0] && idx <= activeRange[1]
                  const isFound = foundIndex === idx
                  const shouldShowLabel = array.length <= 40 && (idx % labelInterval === 0 || isMid || isFound || isLow || isHigh)
                  
                  return (
                    <div
                      key={idx}
                      className="relative flex h-full min-w-0 flex-1 items-end"
                      style={{ flex: '1' }}
                    >
                      <motion.div
                        className="w-full rounded-t-sm"
                        animate={{
                          height: `${(value / maxValue) * 100}%`,
                          backgroundColor: isFound
                            ? 'rgb(34, 197, 94)'
                            : isMid
                              ? 'rgb(250, 204, 21)'
                            : isInRange
                              ? 'rgb(59, 130, 246)'
                              : 'rgb(30, 41, 59)', // Darker for discarded
                          boxShadow: isMid
                            ? '0 0 12px rgba(250, 204, 21, 0.4)'
                            : isFound
                              ? '0 0 12px rgba(34, 197, 94, 0.3)'
                              : '0 0 0 rgba(0,0,0,0)',
                          opacity: (activeRange && !isInRange) ? 0.2 : 1,
                        }}
                        transition={{
                          type: 'spring',
                          damping: 18,
                          stiffness: 230,
                        }}
                      />
                      {shouldShowLabel && (
                         <span className={cn(
                           "pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold whitespace-nowrap",
                           isFound ? "text-emerald-400" : isMid ? "text-yellow-400" : (isLow || isHigh) ? "text-blue-400" : "text-foreground/50"
                         )}>
                           {isFound ? `✓ ${value}` : isMid ? `M: ${value}` : isLow ? `L: ${value}` : isHigh ? `H: ${value}` : value}
                         </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Legend bar */}
            <div className="px-6 py-4 bg-background/30 border-t border-border/20">
               <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">In Search Space</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-yellow-400" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Current Mid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-slate-800" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Discarded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Result Found</span>
                  </div>
               </div>
            </div>
          </Card>
        </main>
      </div>

      {/* ── Algorithm Info Section ── */}
      <Card className="glass-card p-0 border-primary/20 overflow-hidden">
        <div className="bg-primary/10 px-6 py-4 flex items-center justify-between border-b border-primary/20">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Search className="size-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Binary Search Theory</h2>
           </div>
           <Badge className="bg-primary text-primary-foreground">O(1) Space</Badge>
        </div>
        <div className="p-6">
          <p className="text-base text-foreground/80 leading-relaxed max-w-4xl">
            Binary Search is an efficient algorithm for finding an item from a <strong>sorted</strong> list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-4 rounded-xl border border-border/20 bg-background/30 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Worst Case</span>
                <span className="text-2xl font-bold text-red-400 font-mono">O(log n)</span>
             </div>
             <div className="p-4 rounded-xl border border-border/20 bg-background/30 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Average Case</span>
                <span className="text-2xl font-bold text-blue-400 font-mono">O(log n)</span>
             </div>
             <div className="p-4 rounded-xl border border-border/20 bg-background/30 flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">Best Case</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">O(1)</span>
             </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen} className="w-full">
          <div className="flex justify-center mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground text-xs hover:text-primary transition-colors">
                <HelpCircle className="mr-2 size-3.5" />
                Binary Search Guide
                <ChevronDown className={cn('ml-1.5 size-3.5 transition-transform', isGuideOpen && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-4">
              {HOW_TO_STEPS.map((step, index) => (
                <Card key={step.title} className="glass-card p-4 border-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-bold">{step.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
