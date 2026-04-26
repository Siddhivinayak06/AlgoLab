'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, Redo2, RotateCcw, SkipBack, SkipForward,
  Settings2, Layers, Info, HelpCircle, ChevronDown, Code2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import {
  run15Puzzle,
  BRANCH_BOUND_INFO, type BranchBoundStep
} from '@/lib/branch-bound-engine'

const HOW_TO_STEPS = [
  { title: 'Configure Initial State', detail: 'Set a solvable 4x4 puzzle configuration.' },
  { title: 'Start Search', detail: 'Press Start to begin the A* (Branch and Bound) search.' },
  { title: 'Observe Heuristics', detail: 'Watch how the heuristic (h) guides the search towards the goal.' },
  { title: 'Step Through', detail: 'Use step controls to see which node from the priority queue is expanded.' },
]

interface BranchBoundVisualizerProps {
  guideOpen?: boolean
  onGuideOpenChange?: (open: boolean) => void
  hideGuideToggle?: boolean
}

const DEFAULT_BOARD = [
  [1, 2, 3, 4],
  [5, 6, 0, 8],
  [9, 10, 7, 12],
  [13, 14, 11, 15]
]

export function BranchBoundVisualizer({
  guideOpen,
  onGuideOpenChange,
  hideGuideToggle = false,
}: BranchBoundVisualizerProps = {}) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [stepMessage, setStepMessage] = useState('Configure inputs and start visualization.')

  // Inputs
  const [boardInput, setBoardInput] = useState('1,2,3,4\n5,6,0,8\n9,10,7,12\n13,14,11,15')

  // Step history
  const [steps, setSteps] = useState<BranchBoundStep[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [stats, setStats] = useState({ comparisons: 0, operations: 0, statesExplored: 0, memoryUsage: 0 })

  // Playback
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speedRef = useRef(speed)
  const stepsRef = useRef<BranchBoundStep[]>([])
  const indexRef = useRef(-1)

  const [internalGuideOpen, setInternalGuideOpen] = useState(false)
  const resolvedGuideOpen = typeof guideOpen === 'boolean' ? guideOpen : internalGuideOpen
  const handleGuideOpenChange = useCallback((open: boolean) => {
    if (typeof guideOpen !== 'boolean') setInternalGuideOpen(open)
    onGuideOpenChange?.(open)
  }, [guideOpen, onGuideOpenChange])

  useEffect(() => { speedRef.current = speed }, [speed])

  const currentStep: BranchBoundStep | null = steps[currentIndex] ?? null

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const applyStep = useCallback((idx: number, allSteps: BranchBoundStep[]) => {
    const s = allSteps[idx]
    if (!s) return
    setCurrentIndex(idx)
    indexRef.current = idx
    setStepMessage(s.note)
    setStats({
      comparisons: s.comparisons,
      operations: s.operations,
      statesExplored: s.statesExplored,
      memoryUsage: s.memoryUsage
    })
  }, [])

  const startPlayback = useCallback((allSteps: BranchBoundStep[], fromIndex: number) => {
    stopPlayback()
    setIsRunning(true)
    setIsPaused(false)

    const tick = () => {
      const next = indexRef.current + 1
      if (next >= stepsRef.current.length) {
        stopPlayback()
        setIsRunning(false)
        setIsDone(true)
        return
      }
      applyStep(next, stepsRef.current)
    }

    const delayMs = Math.max(50, 2000 - speedRef.current * 19)
    timerRef.current = setInterval(tick, delayMs)
  }, [stopPlayback, applyStep])

  const parseBoard = (): number[][] => {
    try {
      const parsed = boardInput.split('\n').map(line => line.split(',').map(s => parseInt(s.trim(), 10)))
      if (parsed.length !== 4 || parsed.some(row => row.length !== 4)) {
        throw new Error("Invalid board format. Must be 4x4.")
      }
      return parsed
    } catch {
      return DEFAULT_BOARD
    }
  }

  const runVisualization = useCallback(() => {
    stopPlayback()
    setIsDone(false)

    try {
      const result = run15Puzzle(parseBoard())
      const allSteps = result.steps
      setSteps(allSteps)
      stepsRef.current = allSteps
      indexRef.current = 0
      applyStep(0, allSteps)
      startPlayback(allSteps, 0)
    } catch (e) {
      console.error(e)
      setStepMessage("Error running algorithm. Check your inputs.")
    }
  }, [boardInput, stopPlayback, applyStep, startPlayback])

  const pausePlayback = useCallback(() => {
    stopPlayback()
    setIsPaused(true)
  }, [stopPlayback])

  const resumePlayback = useCallback(() => {
    setIsPaused(false)
    startPlayback(stepsRef.current, indexRef.current)
  }, [startPlayback])

  const stepForward = useCallback(() => {
    if (indexRef.current < stepsRef.current.length - 1) {
      applyStep(indexRef.current + 1, stepsRef.current)
      if (indexRef.current >= stepsRef.current.length - 1) {
        setIsRunning(false)
        setIsDone(true)
      }
    }
  }, [applyStep])

  const stepBackward = useCallback(() => {
    if (indexRef.current > 0) {
      applyStep(indexRef.current - 1, stepsRef.current)
    }
  }, [applyStep])

  const resetViz = useCallback(() => {
    stopPlayback()
    setIsRunning(false)
    setIsPaused(false)
    setIsDone(false)
    setSteps([])
    stepsRef.current = []
    setCurrentIndex(-1)
    indexRef.current = -1
    setStepMessage('Configure inputs and start visualization.')
    setStats({ comparisons: 0, operations: 0, statesExplored: 0, memoryUsage: 0 })
  }, [stopPlayback])

  useEffect(() => {
    return () => stopPlayback()
  }, [stopPlayback])

  const algorithmInfo = BRANCH_BOUND_INFO['15-puzzle']
  const progress = steps.length > 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0
  const speedLabel = speed <= 25 ? 'Slow' : speed <= 50 ? 'Medium' : speed <= 75 ? 'Fast' : 'Hyper'

  const renderPuzzle = () => {
    if (!currentStep) return null
    const data = currentStep.data
    const board = data.currentBoard
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 rounded-lg bg-background/50 border border-border/20 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">g(n) - Path Cost</p>
            <p className="text-xl font-bold text-blue-500">{data.gCost}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-background/50 border border-border/20 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">h(n) - Heuristic</p>
            <p className="text-xl font-bold text-amber-500">{data.heuristicCost}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-primary/80">f(n) - Total Cost</p>
            <p className="text-xl font-bold text-primary">{data.gCost + data.heuristicCost}</p>
          </div>
        </div>

        <div className="bg-muted/30 p-2 rounded-xl shadow-inner border border-border/20">
          <div className="grid grid-cols-4 gap-1">
            {board.map((row: number[], r: number) => 
              row.map((val: number, c: number) => {
                const isBlank = val === 0
                return (
                  <motion.div
                    key={`${r}-${c}-${val}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={cn(
                      "w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg text-lg sm:text-2xl font-bold shadow-sm",
                      isBlank ? "bg-background/10 border-2 border-dashed border-border/30" : "bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-[inset_0_2px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.1)]"
                    )}
                  >
                    {!isBlank && val}
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex gap-8 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground">Frontier Nodes</span>
            <span className="font-bold text-primary">{data.frontierStatesCount}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground">Explored Nodes</span>
            <span className="font-bold text-emerald-500">{data.exploredStatesCount}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Collapsible open={resolvedGuideOpen} onOpenChange={handleGuideOpenChange} className="w-full">
        {!hideGuideToggle && (
          <div className="flex justify-center mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground text-xs hover:text-primary">
                <HelpCircle className="mr-2 size-3.5" />Branch & Bound Guide
                <ChevronDown className={cn('ml-1.5 size-3.5 transition-transform', resolvedGuideOpen && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
          </div>
        )}
        <CollapsibleContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pb-1">
            {HOW_TO_STEPS.map((s, i) => (
              <Card key={s.title} className="glass-card p-4 border-muted/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">{i + 1}</span>
                  <h4 className="text-sm font-bold">{s.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="glass-card flex flex-col justify-center border-primary/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">States Expanded</p>
          <p className="mt-1 text-xl font-bold text-primary">{stats.statesExplored}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-blue-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Comparisons</p>
          <p className="mt-1 text-xl font-bold text-blue-400">{stats.comparisons}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-amber-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Operations</p>
          <p className="mt-1 text-xl font-bold text-amber-400">{stats.operations}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-purple-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Est. Memory</p>
          <p className="mt-1 text-xl font-bold text-purple-400">{stats.memoryUsage} B</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-emerald-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Progress</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{progress}%</p>
          <div className="mt-1 w-full h-1 bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="flex flex-col gap-6">
          <Card className="glass-card flex flex-col p-0 overflow-hidden border-primary/20">
            <div className="bg-primary/10 border-b border-primary/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Operations Center</h2>
              </div>
            </div>

            <Tabs defaultValue="algorithm" className="w-full">
              <TabsList className="w-full rounded-none border-b border-border/20 bg-background/20 h-10 p-0">
                <TabsTrigger value="dataset" className="flex-1 rounded-none text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary border-r border-border/20">
                  <Layers className="mr-2 size-3.5" />Dataset
                </TabsTrigger>
                <TabsTrigger value="algorithm" className="flex-1 rounded-none text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  <Play className="mr-2 size-3.5" />Algorithm
                </TabsTrigger>
              </TabsList>

              <div className="p-5">
                {/* Dataset Tab */}
                <TabsContent value="dataset" className="mt-0 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Initial Board (4x4)</Label>
                    <p className="text-[10px] text-muted-foreground mb-2">Use 0 for the blank tile.</p>
                    <textarea value={boardInput} onChange={e => setBoardInput(e.target.value)} disabled={isRunning} rows={5}
                      className="w-full rounded-md border border-border/50 bg-input/20 p-3 text-sm focus:ring-2 focus:ring-primary/40 font-mono text-xs" />
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                    <p className="text-xs text-amber-600 font-medium">Note: State space is huge. Max iterations limited to 1000 for visualization.</p>
                  </div>
                </TabsContent>

                {/* Algorithm Tab */}
                <TabsContent value="algorithm" className="mt-0 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">1. Select Algorithm</Label>
                    <Select value="15-puzzle" disabled>
                      <SelectTrigger className="h-9 bg-input/20 border-border/50"><SelectValue defaultValue="15-puzzle" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15-puzzle">15-Puzzle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">2. Playback Control</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={runVisualization} disabled={isRunning} size="sm" className="col-span-2 bg-primary">
                        <Play className="mr-2 size-3.5" />Start Visualization
                      </Button>
                      <Button onClick={pausePlayback} disabled={!isRunning || isPaused} variant="outline" size="sm">
                        <Pause className="mr-2 size-3.5" />Pause
                      </Button>
                      <Button onClick={resumePlayback} disabled={!isRunning || !isPaused} variant="outline" size="sm">
                        <Redo2 className="mr-2 size-3.5" />Resume
                      </Button>
                      <Button onClick={stepBackward} disabled={currentIndex <= 0} variant="outline" size="sm">
                        <SkipBack className="mr-2 size-3.5" />Back
                      </Button>
                      <Button onClick={stepForward} disabled={currentIndex >= steps.length - 1} variant="outline" size="sm">
                        <SkipForward className="mr-2 size-3.5" />Forward
                      </Button>
                      <Button onClick={resetViz} variant="outline" size="sm" className="col-span-2 text-destructive hover:bg-destructive/10">
                        <RotateCcw className="mr-2 size-3.5" />Reset
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">3. Speed</Label>
                      <Badge variant="outline" className="text-[10px] text-primary">{speedLabel}</Badge>
                    </div>
                    <Slider value={[speed]} onValueChange={([v]) => setSpeed(v)} min={1} max={100} step={1} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          <Card className="glass-card p-0 overflow-hidden border-primary/20">
            <div className="bg-primary/10 border-b border-primary/20 px-5 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <h2 className="text-sm font-bold">Theory</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{algorithmInfo.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="rounded-md bg-muted/20 p-2 text-center">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Time</p>
                  <p className="text-xs font-bold text-primary">{algorithmInfo.worstCase}</p>
                </div>
                <div className="rounded-md bg-muted/20 p-2 text-center">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Space</p>
                  <p className="text-xs font-bold text-primary">{algorithmInfo.spaceComplexity}</p>
                </div>
              </div>
            </div>
          </Card>
        </aside>

        <main className="flex flex-col gap-4">
          <Card className="glass-card p-0 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between px-6 py-3 bg-background/20 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold">Branch & Bound Arena</h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{algorithmInfo.name}</Badge>
                {steps.length > 0 && (
                  <Badge variant="outline" className="text-[10px] border-border/30 text-muted-foreground">
                    Step {currentIndex + 1} / {steps.length}
                  </Badge>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-b border-border/10 bg-background/30 flex items-start gap-3 min-h-[72px]">
              <Info className="size-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{stepMessage}</p>
            </div>

            {renderPuzzle()}
            
            {!currentStep && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-10 text-center">
                Configure inputs in the operations center and click Start Visualization.
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}
