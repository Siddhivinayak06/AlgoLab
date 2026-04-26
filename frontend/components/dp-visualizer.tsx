'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  runLCS, runKnapsackBottomUp, runKnapsackTopDown,
  DP_INFO,
  type DPAlgorithm, type DPStep,
} from '@/lib/dp-engine'
import { DPTableGrid } from '@/components/dp-table-grid'

const HOW_TO_STEPS = [
  { title: 'Configure Inputs', detail: 'Set strings for LCS or weights/values/capacity for Knapsack in the Dataset tab.' },
  { title: 'Choose Algorithm', detail: 'Select LCS, Knapsack Bottom-Up, or Top-Down from the Algorithm tab.' },
  { title: 'Start Visualization', detail: 'Press Start to watch the DP table fill cell by cell.' },
  { title: 'Step Through', detail: 'Use Pause + Step Forward/Back to inspect each computation.' },
]

interface DPVisualizerProps {
  guideOpen?: boolean
  onGuideOpenChange?: (open: boolean) => void
  hideGuideToggle?: boolean
}

export function DPVisualizer({
  guideOpen,
  onGuideOpenChange,
  hideGuideToggle = false,
}: DPVisualizerProps = {}) {
  const [algorithm, setAlgorithm] = useState<DPAlgorithm>('lcs')
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [stepMessage, setStepMessage] = useState('Configure inputs and start visualization.')

  // DP inputs
  const [dpString1, setDpString1] = useState('ABCBDAB')
  const [dpString2, setDpString2] = useState('BDCAB')
  const [dpWeights, setDpWeights] = useState('2,3,4,5')
  const [dpValues, setDpValues] = useState('3,4,5,6')
  const [dpCapacity, setDpCapacity] = useState(5)

  // Step history
  const [steps, setSteps] = useState<DPStep[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [stats, setStats] = useState({ comparisons: 0, operations: 0, cacheHits: 0, time: 0, statesComputed: 0, tableSize: '' })

  // Playback
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speedRef = useRef(speed)
  const stepsRef = useRef<DPStep[]>([])
  const indexRef = useRef(-1)

  const [internalGuideOpen, setInternalGuideOpen] = useState(false)
  const resolvedGuideOpen = typeof guideOpen === 'boolean' ? guideOpen : internalGuideOpen
  const handleGuideOpenChange = useCallback((open: boolean) => {
    if (typeof guideOpen !== 'boolean') setInternalGuideOpen(open)
    onGuideOpenChange?.(open)
  }, [guideOpen, onGuideOpenChange])

  useEffect(() => { speedRef.current = speed }, [speed])

  const currentStep: DPStep | null = steps[currentIndex] ?? null

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const applyStep = useCallback((idx: number, allSteps: DPStep[]) => {
    const s = allSteps[idx]
    if (!s) return
    setCurrentIndex(idx)
    indexRef.current = idx
    setStepMessage(s.note)
    const total = allSteps.length
    setStats({
      comparisons: s.comparisons,
      operations: s.operations,
      cacheHits: s.cacheHits,
      time: 0,
      statesComputed: s.completedCells.length,
      tableSize: `${s.table.length}×${s.table[0]?.length ?? 0}`,
    })
  }, [])

  const startPlayback = useCallback((allSteps: DPStep[], fromIndex: number) => {
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

  const runVisualization = useCallback(() => {
    stopPlayback()
    setIsDone(false)

    const startTime = Date.now()
    let result: { steps: DPStep[]; answer: number }

    if (algorithm === 'lcs') {
      result = runLCS(dpString1, dpString2)
    } else if (algorithm === 'knapsack-bottom-up') {
      const wArr = dpWeights.split(',').map(s => parseInt(s.trim(), 10)).filter(v => !isNaN(v))
      const vArr = dpValues.split(',').map(s => parseInt(s.trim(), 10)).filter(v => !isNaN(v))
      result = runKnapsackBottomUp(wArr, vArr, dpCapacity)
    } else {
      const wArr = dpWeights.split(',').map(s => parseInt(s.trim(), 10)).filter(v => !isNaN(v))
      const vArr = dpValues.split(',').map(s => parseInt(s.trim(), 10)).filter(v => !isNaN(v))
      result = runKnapsackTopDown(wArr, vArr, dpCapacity)
    }

    const elapsed = Date.now() - startTime
    const allSteps = result.steps
    setSteps(allSteps)
    stepsRef.current = allSteps
    indexRef.current = 0
    applyStep(0, allSteps)

    // Update time in final step stats
    setStats(prev => ({ ...prev, time: elapsed }))

    startPlayback(allSteps, 0)
  }, [algorithm, dpString1, dpString2, dpWeights, dpValues, dpCapacity, stopPlayback, applyStep, startPlayback])

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
    setStats({ comparisons: 0, operations: 0, cacheHits: 0, time: 0, statesComputed: 0, tableSize: '' })
  }, [stopPlayback])

  useEffect(() => {
    return () => stopPlayback()
  }, [stopPlayback])

  const algorithmInfo = DP_INFO[algorithm]
  const progress = steps.length > 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0
  const speedLabel = speed <= 25 ? 'Slow' : speed <= 50 ? 'Medium' : speed <= 75 ? 'Fast' : 'Hyper'

  return (
    <div className="flex flex-col gap-6">
      {/* Guide */}
      <Collapsible open={resolvedGuideOpen} onOpenChange={handleGuideOpenChange} className="w-full">
        {!hideGuideToggle && (
          <div className="flex justify-center mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground text-xs hover:text-primary">
                <HelpCircle className="mr-2 size-3.5" />DP Guide
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="glass-card flex flex-col justify-center border-primary/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">States</p>
          <p className="mt-1 text-xl font-bold text-primary">{stats.statesComputed}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-purple-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Cache Hits</p>
          <p className="mt-1 text-xl font-bold text-purple-400">{stats.cacheHits}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-blue-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Comparisons</p>
          <p className="mt-1 text-xl font-bold text-blue-400">{stats.comparisons}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-amber-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Operations</p>
          <p className="mt-1 text-xl font-bold text-amber-400">{stats.operations}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-cyan-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Table Size</p>
          <p className="mt-1 text-xl font-bold text-cyan-400">{stats.tableSize || '–'}</p>
        </div>
        <div className="glass-card flex flex-col justify-center border-emerald-500/20 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Progress</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{progress}%</p>
          <div className="mt-1 w-full h-1 bg-muted/30 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[400px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-8">
          <Card className="glass-card flex flex-col p-0 overflow-hidden border-primary/20">
            <div className="bg-primary/10 border-b border-primary/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Operations Center</h2>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Configure and control DP visualization</p>
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

              <div className="p-6">
                {/* Dataset Tab */}
                <TabsContent value="dataset" className="mt-0 space-y-4">
                  <p className="text-xs text-muted-foreground">Configure inputs for the selected DP algorithm.</p>
                  {algorithm === 'lcs' ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">String A</Label>
                        <input type="text" value={dpString1} onChange={e => setDpString1(e.target.value)} disabled={isRunning}
                          className="w-full h-10 rounded-md border border-border/50 bg-input/20 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">String B</Label>
                        <input type="text" value={dpString2} onChange={e => setDpString2(e.target.value)} disabled={isRunning}
                          className="w-full h-10 rounded-md border border-border/50 bg-input/20 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-[10px] h-8" disabled={isRunning}
                        onClick={() => { setDpString1('AGGTAB'); setDpString2('GXTXAYB') }}>
                        Load Example
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Weights</Label>
                        <input type="text" value={dpWeights} onChange={e => setDpWeights(e.target.value)} disabled={isRunning}
                          className="w-full h-10 rounded-md border border-border/50 bg-input/20 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. 2,3,4,5" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Values</Label>
                        <input type="text" value={dpValues} onChange={e => setDpValues(e.target.value)} disabled={isRunning}
                          className="w-full h-10 rounded-md border border-border/50 bg-input/20 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="e.g. 3,4,5,6" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Capacity</Label>
                        <input type="number" value={dpCapacity} onChange={e => setDpCapacity(parseInt(e.target.value, 10) || 0)} disabled={isRunning} min={1}
                          className="w-full h-10 rounded-md border border-border/50 bg-input/20 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-[10px] h-8" disabled={isRunning}
                        onClick={() => { setDpWeights('1,3,4,5'); setDpValues('1,4,5,7'); setDpCapacity(7) }}>
                        Load Example
                      </Button>
                    </>
                  )}
                </TabsContent>

                {/* Algorithm Tab */}
                <TabsContent value="algorithm" className="mt-0 space-y-7">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">1. Select Algorithm</Label>
                    <Select value={algorithm} onValueChange={v => { setAlgorithm(v as DPAlgorithm); resetViz() }} disabled={isRunning}>
                      <SelectTrigger className="h-10 bg-input/20 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50">
                        <SelectItem value="lcs">Longest Common Subsequence</SelectItem>
                        <SelectItem value="knapsack-bottom-up">0/1 Knapsack (Bottom-Up)</SelectItem>
                        <SelectItem value="knapsack-top-down">0/1 Knapsack (Top-Down)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Playback Controls */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">2. Playback Control</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={runVisualization} disabled={isRunning} className="h-10 col-span-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Play className="mr-2 size-4" />Start Visualization
                      </Button>
                      <Button onClick={pausePlayback} disabled={!isRunning || isPaused} variant="outline" className="h-10 border-border/50 hover:bg-primary/10">
                        <Pause className="mr-2 size-4" />Pause
                      </Button>
                      <Button onClick={resumePlayback} disabled={!isRunning || !isPaused} variant="outline" className="h-10 border-border/50 hover:bg-primary/10">
                        <Redo2 className="mr-2 size-4" />Resume
                      </Button>
                      <Button onClick={stepBackward} disabled={currentIndex <= 0} variant="outline" className="h-10 border-border/50 hover:bg-primary/10">
                        <SkipBack className="mr-2 size-4" />Back
                      </Button>
                      <Button onClick={stepForward} disabled={currentIndex >= steps.length - 1} variant="outline" className="h-10 border-border/50 hover:bg-primary/10">
                        <SkipForward className="mr-2 size-4" />Forward
                      </Button>
                      <Button onClick={resetViz} variant="outline" className="h-10 col-span-2 border-border/50 hover:bg-destructive/10 hover:text-destructive">
                        <RotateCcw className="mr-2 size-4" />Reset
                      </Button>
                    </div>
                  </div>

                  {/* Speed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">3. Speed</Label>
                      <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">{speedLabel}</Badge>
                    </div>
                    <Slider value={[speed]} onValueChange={([v]) => setSpeed(v)} min={1} max={100} step={1} className="w-full" />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </Card>

          {/* Algorithm Theory */}
          <Card className="glass-card p-0 overflow-hidden border-primary/20">
            <div className="bg-primary/10 border-b border-primary/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Algorithm Theory</h2>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-foreground/80 leading-relaxed">{algorithmInfo.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/20 p-2 text-center">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Time</p>
                  <p className="text-sm font-bold text-primary">{algorithmInfo.worstCase}</p>
                </div>
                <div className="rounded-lg bg-muted/20 p-2 text-center">
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Space</p>
                  <p className="text-sm font-bold text-primary">{algorithmInfo.spaceComplexity}</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/20 p-3">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-2">Recurrence</p>
                <pre className="text-xs text-foreground/90 font-mono leading-relaxed whitespace-pre-wrap">
                  {algorithmInfo.recurrence.join('\n')}
                </pre>
              </div>
            </div>
          </Card>
        </aside>

        {/* Visualization Arena */}
        <main className="flex flex-col gap-4">
          <Card className="glass-card p-0 overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(45,35,66,0.2)]">
            <div className="flex items-center justify-between px-6 py-3 bg-background/20 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold text-foreground">DP Arena</h2>
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

            {/* Step Message */}
            <div className="px-6 py-4 border-b border-border/10 bg-background/30 flex items-start gap-3 min-h-[72px]">
              <Info className="size-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground/90 leading-relaxed font-medium">{stepMessage}</p>
            </div>

            {/* DP Table Grid */}
            <div className="flex-1 min-h-[420px] p-4 flex flex-col">
              <DPTableGrid step={currentStep} algorithm={algorithm} />
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}
