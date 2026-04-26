'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
  runNQueens, runSumOfSubsets, runGraphColoring, runTSP,
  BACKTRACKING_INFO, type BacktrackingStep, type Edge, type TreeNode
} from '@/lib/backtracking-engine'
import { GraphDatasetGenerator, type GraphEdge, type GraphDatasetMeta } from '@/components/graph-dataset-generator'

const HOW_TO_STEPS = [
  { title: 'Configure Inputs', detail: 'Set board size, items, or graph edges in the Dataset tab depending on the algorithm.' },
  { title: 'Choose Algorithm', detail: 'Select a Backtracking algorithm like N-Queens or Sum of Subsets.' },
  { title: 'Start Visualization', detail: 'Press Start to watch the algorithm explore and backtrack.' },
  { title: 'Step Through', detail: 'Use Pause + Step Forward/Back to inspect each decision tree branch.' },
]

interface BacktrackingVisualizerProps {
  guideOpen?: boolean
  onGuideOpenChange?: (open: boolean) => void
  hideGuideToggle?: boolean
}

type BacktrackingAlgorithm = 'n-queens' | 'sum-of-subsets' | 'graph-coloring' | 'tsp'

export function BacktrackingVisualizer({
  guideOpen,
  onGuideOpenChange,
  hideGuideToggle = false,
}: BacktrackingVisualizerProps = {}) {
  const [algorithm, setAlgorithm] = useState<BacktrackingAlgorithm>('n-queens')
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [stepMessage, setStepMessage] = useState('Configure inputs and start visualization.')

  // Inputs
  const [nQueensSize, setNQueensSize] = useState(4)
  const [subsetItemsInput, setSubsetItemsInput] = useState('10,7,5,18,12,20,15')
  const [subsetTarget, setSubsetTarget] = useState(35)
  const [nodesCount, setNodesCount] = useState(4)
  const [edgesInput, setEdgesInput] = useState('0,1,10\n0,2,15\n0,3,20\n1,2,35\n1,3,25\n2,3,30') // Complete graph for TSP
  const [maxColors, setMaxColors] = useState(3)

  // Step history
  const [steps, setSteps] = useState<BacktrackingStep[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [stats, setStats] = useState({ comparisons: 0, operations: 0, statesExplored: 0, memoryUsage: 0 })

  // Playback
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speedRef = useRef(speed)
  const stepsRef = useRef<BacktrackingStep[]>([])
  const indexRef = useRef(-1)

  const [internalGuideOpen, setInternalGuideOpen] = useState(false)
  const resolvedGuideOpen = typeof guideOpen === 'boolean' ? guideOpen : internalGuideOpen
  const handleGuideOpenChange = useCallback((open: boolean) => {
    if (typeof guideOpen !== 'boolean') setInternalGuideOpen(open)
    onGuideOpenChange?.(open)
  }, [guideOpen, onGuideOpenChange])

  useEffect(() => { speedRef.current = speed }, [speed])

  const currentStep: BacktrackingStep | null = steps[currentIndex] ?? null

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const applyStep = useCallback((idx: number, allSteps: BacktrackingStep[]) => {
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

  const startPlayback = useCallback((allSteps: BacktrackingStep[], fromIndex: number) => {
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



  const parseEdges = (): Edge[] => {
    return edgesInput.split('\n').map(line => {
      const [u, v, weight] = line.split(',').map(s => parseInt(s.trim(), 10))
      return { u: u || 0, v: v || 0, weight: weight || 1 }
    }).filter(e => !isNaN(e.u) && !isNaN(e.v) && !isNaN(e.weight))
  }

  const parseSubsetItems = (): number[] => {
    return subsetItemsInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
  }

  const runVisualization = useCallback(() => {
    stopPlayback()
    setIsDone(false)

    let result: { steps: BacktrackingStep[] }
    
    try {
      if (algorithm === 'n-queens') {
        result = runNQueens(nQueensSize)
      } else if (algorithm === 'sum-of-subsets') {
        result = runSumOfSubsets(parseSubsetItems(), subsetTarget)
      } else if (algorithm === 'graph-coloring') {
        result = runGraphColoring(nodesCount, parseEdges(), maxColors)
      } else {
        result = runTSP(nodesCount, parseEdges())
      }
      
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
  }, [algorithm, nQueensSize, subsetItemsInput, subsetTarget, nodesCount, edgesInput, maxColors, stopPlayback, applyStep, startPlayback])

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

  const handleDatasetReady = useCallback((nodes: number, newEdges: GraphEdge[], meta: GraphDatasetMeta) => {
    setNodesCount(nodes)
    const formatted = newEdges.map(e => `${e.u},${e.v},${e.weight}`).join('\n')
    setEdgesInput(formatted)
    resetViz()
  }, [resetViz])

  useEffect(() => {
    return () => stopPlayback()
  }, [stopPlayback])

  const algorithmInfo = BACKTRACKING_INFO[algorithm]
  const progress = steps.length > 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0
  const speedLabel = speed <= 25 ? 'Slow' : speed <= 50 ? 'Medium' : speed <= 75 ? 'Fast' : 'Hyper'

  // Generic node positions for graph
  const nodePositions = useMemo(() => {
    const pos: Record<number, {x: number, y: number}> = {}
    const radius = 120
    const centerX = 200
    const centerY = 150
    for (let i = 0; i < nodesCount; i++) {
      const angle = (Math.PI * 2 * i) / nodesCount - Math.PI / 2
      pos[i] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    }
    return pos
  }, [nodesCount])

  const renderNQueens = () => {
    if (!currentStep || currentStep.type !== 'n-queens') return null
    const data = currentStep.data as any
    const n = data.board.length
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div 
          className="grid border-2 border-border/50 rounded-sm overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
        >
          {data.board.map((row: number[], rIdx: number) => (
            row.map((cell: number, cIdx: number) => {
              const isDark = (rIdx + cIdx) % 2 === 1
              const isConflict = data.conflicts.some((c: any) => c.row === rIdx && c.col === cIdx)
              const isCurrent = data.currentRow === rIdx && data.currentCol === cIdx
              const isBacktracking = data.isBacktracking && isCurrent
              
              return (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center transition-colors duration-300 relative",
                    isDark ? "bg-primary/20" : "bg-background",
                    isCurrent ? (isBacktracking ? "ring-2 ring-inset ring-destructive shadow-[inset_0_0_10px_rgba(var(--destructive-rgb),0.5)]" : "ring-2 ring-inset ring-emerald-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.5)]") : "",
                    isConflict ? "bg-destructive/30" : ""
                  )}
                >
                  {cell === 1 && (
                    <span className="text-2xl drop-shadow-md">♕</span>
                  )}
                  {isCurrent && cell === 0 && !isBacktracking && (
                    <span className="text-2xl opacity-40 text-emerald-500">♕</span>
                  )}
                </div>
              )
            })
          ))}
        </div>
      </div>
    )
  }

  const renderTree = () => {
    if (!currentStep || currentStep.type !== 'sum-of-subsets') return null
    const data = currentStep.data as any
    const nodes = data.treeNodes
    
    // Very simplified tree rendering - list view for simplicity in generic SVG
    // A proper tree layout requires complex math, so we'll do a styled list of the current path and valid solutions
    return (
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-background/30">
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">Target Sum</p>
            <p className="text-2xl font-bold text-primary mt-1">{data.target}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">Current Sum</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{data.currentSum}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-2">Current Exploring Path</h3>
          <div className="flex gap-2 flex-wrap bg-background/20 p-4 rounded-xl border border-border/20 min-h-16 items-center">
            {data.includedItems.length === 0 ? (
              <span className="text-muted-foreground text-sm">[]</span>
            ) : (
              data.includedItems.map((item: number, i: number) => (
                <Badge key={i} variant="outline" className="text-sm bg-primary/10 border-primary/20 text-primary px-3 py-1">
                  +{item}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-2">Found Valid Subsets ({data.validSubsets.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.validSubsets.map((subset: number[], i: number) => (
              <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-2 rounded-lg text-sm font-medium">
                [{subset.join(', ')}] = {data.target}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderGraph = () => {
    if (!currentStep) return null
    if (currentStep.type !== 'graph-coloring' && currentStep.type !== 'tsp') return null
    const data = currentStep.data as any
    const { nodes = [], edges = [] } = data
    
    // Graph Coloring specific
    const colors = data.colors || []
    const palette = ['fill-red-500', 'fill-blue-500', 'fill-green-500', 'fill-yellow-500', 'fill-purple-500']
    
    // TSP specific
    const currentPath = data.currentPath || []
    const bestPath = data.bestPath || []

    const highlightEdge = (u: number, v: number) => {
      if (currentStep.type === 'tsp') {
        // Check if edge is in current path
        let inCurrentPath = false
        for (let i = 0; i < currentPath.length - 1; i++) {
          if ((currentPath[i] === u && currentPath[i+1] === v) || (currentPath[i] === v && currentPath[i+1] === u)) {
            inCurrentPath = true
            break
          }
        }
        if (currentPath.length === nodes.length && ((currentPath[currentPath.length-1] === u && currentPath[0] === v) || (currentPath[currentPath.length-1] === v && currentPath[0] === u))) {
          inCurrentPath = true // Closing the loop
        }
        
        if (inCurrentPath) return 'stroke-primary stroke-[3px]'
        return 'stroke-border/30 stroke-1'
      }
      return 'stroke-border/50 stroke-2'
    }

    return (
      <div className="flex-1 flex flex-col p-4 gap-4">
        {currentStep.type === 'tsp' && (
          <div className="flex items-center justify-between px-6 py-2 bg-background/20 rounded-xl border border-border/10">
             <div className="text-xs"><span className="text-muted-foreground">Current Cost:</span> <span className="font-bold">{data.currentCost}</span></div>
             <div className="text-xs"><span className="text-muted-foreground">Best Cost:</span> <span className="font-bold text-emerald-500">{data.bestCost === Infinity ? 'None' : data.bestCost}</span></div>
          </div>
        )}
        <div className="flex-1 min-h-[350px] flex items-center justify-center">
          <svg className="w-full h-full max-w-[500px]" viewBox="0 0 400 300">
            {edges.map((edge: Edge, i: number) => {
              const p1 = nodePositions[edge.u]
              const p2 = nodePositions[edge.v]
              if (!p1 || !p2) return null
              const midX = (p1.x + p2.x) / 2
              const midY = (p1.y + p2.y) / 2
              return (
                <g key={`e-${i}`}>
                  <line 
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} 
                    className={cn("transition-all duration-300", highlightEdge(edge.u, edge.v))} 
                  />
                  {currentStep.type === 'tsp' && (
                    <>
                      <rect x={midX - 8} y={midY - 8} width="16" height="16" rx="4" className="fill-background/80" />
                      <text x={midX} y={midY} className="fill-muted-foreground text-[10px] font-medium" textAnchor="middle" dominantBaseline="central">
                        {edge.weight}
                      </text>
                    </>
                  )}
                </g>
              )
            })}
            {nodes.map((node: number) => {
              const p = nodePositions[node]
              if (!p) return null
              
              let fillClass = "fill-background"
              if (currentStep.type === 'graph-coloring') {
                if (colors[node] !== -1) {
                  fillClass = palette[colors[node] % palette.length]
                }
              }
              
              const isActive = (currentStep.type === 'graph-coloring' && data.currentNode === node) || 
                               (currentStep.type === 'tsp' && currentPath[currentPath.length - 1] === node)

              return (
                <g key={`n-${node}`} className="transition-all duration-300">
                  <circle 
                    cx={p.x} cy={p.y} r="16" 
                    className={cn(
                      "transition-all duration-300 stroke-2",
                      fillClass,
                      isActive ? "stroke-primary shadow-lg" : "stroke-border"
                    )} 
                  />
                  <text x={p.x} y={p.y} className={cn("text-xs font-bold", fillClass !== 'fill-background' ? "fill-white" : "fill-foreground")} textAnchor="middle" dominantBaseline="central">
                    {node}
                  </text>
                </g>
              )
            })}
          </svg>
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
                <HelpCircle className="mr-2 size-3.5" />Backtracking Guide
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">States Explored</p>
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
                  {algorithm === 'n-queens' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Board Size (N)</Label>
                      <input type="number" value={nQueensSize} onChange={e => setNQueensSize(parseInt(e.target.value) || 0)} disabled={isRunning} max={8}
                        className="w-full h-9 rounded-md border border-border/50 bg-input/20 px-3 text-sm focus:ring-2 focus:ring-primary/40" />
                      <p className="text-[10px] text-muted-foreground">Max 8 recommended for visualization.</p>
                    </div>
                  )}
                  {algorithm === 'sum-of-subsets' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Target Sum</Label>
                        <input type="number" value={subsetTarget} onChange={e => setSubsetTarget(parseInt(e.target.value) || 0)} disabled={isRunning}
                          className="w-full h-9 rounded-md border border-border/50 bg-input/20 px-3 text-sm focus:ring-2 focus:ring-primary/40" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Items (comma separated)</Label>
                        <textarea value={subsetItemsInput} onChange={e => setSubsetItemsInput(e.target.value)} disabled={isRunning} rows={3}
                          className="w-full rounded-md border border-border/50 bg-input/20 p-3 text-sm focus:ring-2 focus:ring-primary/40 font-mono text-xs" />
                      </div>
                    </>
                  )}
                  {(algorithm === 'graph-coloring' || algorithm === 'tsp') && (
                    <>
                      {algorithm === 'graph-coloring' && (
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Max Colors</Label>
                          <input type="number" value={maxColors} onChange={e => setMaxColors(parseInt(e.target.value) || 0)} disabled={isRunning}
                            className="w-full h-9 rounded-md border border-border/50 bg-input/20 px-3 text-sm focus:ring-2 focus:ring-primary/40" />
                        </div>
                      )}
                      <GraphDatasetGenerator 
                        disabled={isRunning}
                        onDatasetReady={handleDatasetReady}
                      />
                    </>
                  )}
                </TabsContent>

                {/* Algorithm Tab */}
                <TabsContent value="algorithm" className="mt-0 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">1. Select Algorithm</Label>
                    <Select value={algorithm} onValueChange={v => { setAlgorithm(v as BacktrackingAlgorithm); resetViz() }} disabled={isRunning}>
                      <SelectTrigger className="h-9 bg-input/20 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="n-queens">N-Queens</SelectItem>
                        <SelectItem value="sum-of-subsets">Sum of Subsets</SelectItem>
                        <SelectItem value="graph-coloring">Graph Coloring</SelectItem>
                        <SelectItem value="tsp">Traveling Salesman</SelectItem>
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
                <h2 className="text-base font-bold">Backtracking Arena</h2>
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

            {renderNQueens()}
            {renderTree()}
            {renderGraph()}
            
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
