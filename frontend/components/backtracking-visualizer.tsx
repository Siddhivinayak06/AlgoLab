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
import { PseudocodePanel } from '@/components/pseudocode-panel'

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
  algorithm?: BacktrackingAlgorithm
  onAlgorithmChange?: (alg: BacktrackingAlgorithm) => void
}

type BacktrackingAlgorithm = 'n-queens' | 'sum-of-subsets' | 'graph-coloring' | 'tsp'

export function BacktrackingVisualizer({
  guideOpen,
  onGuideOpenChange,
  hideGuideToggle = false,
  algorithm: externalAlgorithm,
  onAlgorithmChange,
}: BacktrackingVisualizerProps = {}) {
  const [internalAlgorithm, setInternalAlgorithm] = useState<BacktrackingAlgorithm>('n-queens')
  const algorithm = externalAlgorithm ?? internalAlgorithm;
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
  const [nQueensSolutions, setNQueensSolutions] = useState<{ row: number; col: number }[][]>([])

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
        const nqResult = runNQueens(nQueensSize)
        result = nqResult
        setNQueensSolutions(nqResult.answer)
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
    setNQueensSolutions([])
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
    const attackedSet = new Set((data.attackedCells || []).map((c: any) => `${c.row}-${c.col}`))
    const isSolution = currentStep.stepType === 'solution'
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn("text-xs px-3 py-1 font-bold", isSolution ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-primary/30 text-primary")}>
            ♕ {data.queens.length} / {n}
          </Badge>
          {data.solutionCount > 0 && (
            <Badge variant="outline" className="text-xs px-3 py-1 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold">
              ✓ {data.solutionCount} found
            </Badge>
          )}
        </div>
        <div className="flex">
          <div className="flex flex-col mr-1.5 pt-5">
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className="h-14 flex items-center justify-center w-4">
                <span className="text-[10px] font-mono font-bold text-muted-foreground/50">{i}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="flex mb-1">
              {Array.from({ length: n }, (_, i) => (
                <div key={i} className="w-14 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground/50">{i}</span>
                </div>
              ))}
            </div>
            <div 
              className={cn("grid rounded-lg overflow-hidden shadow-lg transition-all duration-500", isSolution ? "ring-2 ring-emerald-500 shadow-emerald-500/20" : "ring-1 ring-border/40")}
              style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
            >
              {data.board.map((row: number[], rIdx: number) => (
                row.map((cell: number, cIdx: number) => {
                  const isDark = (rIdx + cIdx) % 2 === 1
                  const isConflict = data.conflicts.some((c: any) => c.row === rIdx && c.col === cIdx)
                  const isCurrent = data.currentRow === rIdx && data.currentCol === cIdx
                  const isBacktracking = data.isBacktracking && isCurrent
                  const isAttacked = attackedSet.has(`${rIdx}-${cIdx}`) && cell === 0
                  const hasQueen = cell === 1
                  return (
                    <div key={`${rIdx}-${cIdx}`}
                      className={cn(
                        "w-14 h-14 flex items-center justify-center transition-all duration-200 relative",
                        isDark ? "bg-slate-600/40" : "bg-slate-200/20",
                        isConflict && "bg-red-500/25",
                        isCurrent && !isBacktracking && "ring-2 ring-inset ring-emerald-400 bg-emerald-400/15",
                        isCurrent && isBacktracking && "ring-2 ring-inset ring-red-400 bg-red-400/10",
                        isSolution && hasQueen && "bg-emerald-400/20",
                      )}
                    >
                      {isAttacked && !isCurrent && !isConflict && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400/30" />
                        </div>
                      )}
                      {hasQueen && (
                        <span className={cn("text-2xl drop-shadow-md transition-all select-none", isSolution ? "text-emerald-400 scale-110" : "text-amber-400")}>♛</span>
                      )}
                      {isCurrent && !hasQueen && !isBacktracking && (
                        <span className="text-2xl opacity-30 text-emerald-400 animate-pulse select-none">♛</span>
                      )}
                      {isCurrent && isBacktracking && !hasQueen && (
                        <span className="text-base text-red-400/70 font-bold">✕</span>
                      )}
                      {isConflict && !isCurrent && (
                        <span className="text-xs text-red-400/60">⚡</span>
                      )}
                    </div>
                  )
                })
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 mt-1">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm ring-2 ring-emerald-400/50 bg-emerald-400/15" /><span className="text-[9px] uppercase font-bold text-muted-foreground">Trying</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-400/20 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-red-400/50" /></div><span className="text-[9px] uppercase font-bold text-muted-foreground">Attacked</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500/25" /><span className="text-[9px] uppercase font-bold text-muted-foreground">Conflict</span></div>
          <div className="flex items-center gap-1.5"><span className="text-sm text-amber-400">♛</span><span className="text-[9px] uppercase font-bold text-muted-foreground">Queen</span></div>
        </div>
      </div>
    )
  }

  const renderTree = () => {
    if (!currentStep || currentStep.type !== 'sum-of-subsets') return null
    const data = currentStep.data as any
    const progressPct = data.target > 0 ? Math.min(100, Math.round((data.currentSum / data.target) * 100)) : 0
    const isOver = data.currentSum > data.target
    const includedSet = new Set(data.includedItems as number[])
    
    return (
      <div className="flex-1 p-5 flex flex-col gap-5">
        {/* Progress bar: current sum vs target */}
        <div className="rounded-xl border border-border/20 bg-background/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Progress toward Target</span>
            <span className={cn("text-sm font-black", isOver ? "text-destructive" : data.currentSum === data.target ? "text-emerald-500" : "text-primary")}>{data.currentSum} / {data.target}</span>
          </div>
          <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-300", isOver ? "bg-destructive" : data.currentSum === data.target ? "bg-emerald-500" : "bg-primary")} style={{ width: `${Math.min(100, progressPct)}%` }} />
          </div>
          {data.remainingSum !== undefined && (
            <p className="text-[10px] text-muted-foreground mt-1.5">Remaining available: {data.remainingSum}</p>
          )}
        </div>

        {/* Items pool */}
        <div>
          <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">Items Pool</h3>
          <div className="flex gap-2 flex-wrap bg-background/20 p-4 rounded-xl border border-border/20">
            {(data.items as number[]).map((item: number, i: number) => {
              const isIncluded = includedSet.has(item)
              return (
                <div key={i} className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-bold border transition-all duration-200",
                  isIncluded ? "bg-primary/15 border-primary/40 text-primary scale-105 shadow-sm" : "bg-muted/10 border-border/20 text-muted-foreground/60"
                )}>
                  {item}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current included subset */}
        <div>
          <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">Current Subset</h3>
          <div className="flex gap-2 flex-wrap bg-background/20 p-4 rounded-xl border border-border/20 min-h-14 items-center">
            {data.includedItems.length === 0 ? (
              <span className="text-muted-foreground text-sm italic">Empty — exploring…</span>
            ) : (
              <>
                {data.includedItems.map((item: number, i: number) => (
                  <Badge key={i} variant="outline" className="text-sm bg-primary/10 border-primary/30 text-primary px-3 py-1 font-bold">+{item}</Badge>
                ))}
                <span className="text-xs text-muted-foreground ml-2">= {data.currentSum}</span>
              </>
            )}
          </div>
        </div>

        {/* Found valid subsets */}
        {data.validSubsets.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2">✓ Valid Subsets ({data.validSubsets.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.validSubsets.map((subset: number[], i: number) => (
                <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center">
                  <span className="font-mono">[{subset.join(', ')}]</span>
                  <span className="font-black">= {data.target}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const GRAPH_COLORS = ['hsl(0,70%,55%)', 'hsl(220,70%,55%)', 'hsl(140,70%,45%)', 'hsl(50,80%,50%)', 'hsl(280,70%,55%)', 'hsl(25,80%,55%)', 'hsl(190,70%,50%)', 'hsl(330,70%,55%)']
  const COLOR_NAMES = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Cyan', 'Pink']

  const renderGraph = () => {
    if (!currentStep) return null
    if (currentStep.type !== 'graph-coloring' && currentStep.type !== 'tsp') return null
    const data = currentStep.data as any
    const { nodes = [], edges = [] } = data
    
    const colors = data.colors || []
    const currentPath = data.currentPath || []
    const bestPath = data.bestPath || []
    const conflictEdgeSet = new Set((data.conflictEdges || []).map((e: any) => `${Math.min(e.u,e.v)}-${Math.max(e.u,e.v)}`))

    const isEdgeInPath = (u: number, v: number, path: number[]) => {
      for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === u && path[i+1] === v) || (path[i] === v && path[i+1] === u)) return true
      }
      return false
    }

    return (
      <div className="flex-1 flex flex-col p-4 gap-3">
        {/* Stats bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-background/20 rounded-xl border border-border/10 flex-wrap gap-2">
          {currentStep.type === 'tsp' && (
            <>
              <div className="text-xs"><span className="text-muted-foreground">Path: </span><span className="font-bold font-mono">[{currentPath.join('→')}]</span></div>
              <div className="text-xs"><span className="text-muted-foreground">Cost: </span><span className="font-bold">{data.currentCost}</span></div>
              <div className="text-xs"><span className="text-muted-foreground">Best: </span><span className="font-bold text-emerald-500">{data.bestCost === Infinity ? '∞' : data.bestCost}</span></div>
              {data.prunedBranches > 0 && (
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">Pruned: {data.prunedBranches}</Badge>
              )}
            </>
          )}
          {currentStep.type === 'graph-coloring' && (
            <>
              <div className="text-xs"><span className="text-muted-foreground">Coloring node: </span><span className="font-bold">{data.currentNode}</span></div>
              <div className="text-xs"><span className="text-muted-foreground">Colored: </span><span className="font-bold">{colors.filter((c: number) => c !== -1).length}/{nodes.length}</span></div>
            </>
          )}
        </div>

        <div className="flex-1 min-h-[320px] flex items-center justify-center">
          <svg className="w-full h-full max-w-[500px]" viewBox="0 0 400 300">
            {/* Best path overlay for TSP (dashed green) */}
            {currentStep.type === 'tsp' && bestPath.length > 1 && edges.map((edge: Edge, i: number) => {
              if (!isEdgeInPath(edge.u, edge.v, bestPath)) return null
              const p1 = nodePositions[edge.u]; const p2 = nodePositions[edge.v]
              if (!p1 || !p2) return null
              return <line key={`best-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgb(34,197,94)" strokeWidth="2" strokeDasharray="6,4" opacity="0.5" />
            })}
            {/* Regular edges */}
            {edges.map((edge: Edge, i: number) => {
              const p1 = nodePositions[edge.u]; const p2 = nodePositions[edge.v]
              if (!p1 || !p2) return null
              const edgeKey = `${Math.min(edge.u,edge.v)}-${Math.max(edge.u,edge.v)}`
              const isConflict = conflictEdgeSet.has(edgeKey)
              const inCurrentPath = currentStep.type === 'tsp' && isEdgeInPath(edge.u, edge.v, currentPath)
              const midX = (p1.x + p2.x) / 2; const midY = (p1.y + p2.y) / 2
              return (
                <g key={`e-${i}`}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    className={cn(
                      "transition-all duration-300",
                      isConflict ? "stroke-destructive" : inCurrentPath ? "stroke-primary" : "stroke-border"
                    )}
                    strokeWidth={isConflict ? 3 : inCurrentPath ? 3 : 2}
                  />
                  {isConflict && <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-destructive opacity-20" strokeWidth="6" />}
                  {currentStep.type === 'tsp' && (
                    <>
                      <rect x={midX - 10} y={midY - 8} width="20" height="16" rx="4" fill="hsl(var(--background)/0.85)" />
                      <text x={midX} y={midY} fill="hsl(var(--muted-foreground))" fontSize="10" fontWeight="500" textAnchor="middle" dominantBaseline="central">{edge.weight}</text>
                    </>
                  )}
                </g>
              )
            })}
            {/* Nodes */}
            {nodes.map((node: number) => {
              const p = nodePositions[node]
              if (!p) return null
              const colorIdx = colors[node]
              const hasFill = currentStep.type === 'graph-coloring' && colorIdx !== -1
              const fillColor = hasFill ? GRAPH_COLORS[colorIdx % GRAPH_COLORS.length] : 'hsl(var(--background))'
              const isActive = (currentStep.type === 'graph-coloring' && data.currentNode === node) ||
                               (currentStep.type === 'tsp' && currentPath[currentPath.length - 1] === node)
              const isVisited = currentStep.type === 'tsp' && currentPath.includes(node)
              return (
                <g key={`n-${node}`}>
                  {isActive && <circle cx={p.x} cy={p.y} r="22" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.4"><animate attributeName="r" values="20;24;20" dur="1.5s" repeatCount="indefinite" /></circle>}
                  <circle cx={p.x} cy={p.y} r="18" fill={fillColor}
                    stroke={isActive ? 'hsl(var(--primary))' : isVisited ? 'rgb(34,197,94)' : 'hsl(var(--border))'}
                    strokeWidth={isActive ? 3 : 2} className="transition-all duration-300"
                  />
                  <text x={p.x} y={p.y} fill={hasFill ? 'white' : 'hsl(var(--foreground))'} fontSize="13" fontWeight="700" textAnchor="middle" dominantBaseline="central">{node}</text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Color legend for graph coloring */}
        {currentStep.type === 'graph-coloring' && (
          <div className="flex flex-wrap justify-center gap-3 px-4">
            {Array.from({ length: data.maxColors }, (_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GRAPH_COLORS[i] }} />
                <span className="text-[9px] uppercase font-bold text-muted-foreground">{COLOR_NAMES[i] || `C${i}`}</span>
              </div>
            ))}
          </div>
        )}
        {currentStep.type === 'tsp' && (
          <div className="flex flex-wrap justify-center gap-4 px-4">
            <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-primary rounded" /><span className="text-[9px] uppercase font-bold text-muted-foreground">Current Path</span></div>
            <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 rounded" style={{ background: 'rgb(34,197,94)', opacity: 0.6 }} /><span className="text-[9px] uppercase font-bold text-muted-foreground">Best Tour</span></div>
          </div>
        )}
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
                        mode={algorithm as 'tsp' | 'graph-coloring'}
                        onDatasetReady={handleDatasetReady}
                      />
                    </>
                  )}
                </TabsContent>

                {/* Algorithm Tab */}
                <TabsContent value="algorithm" className="mt-0 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">1. Select Algorithm</Label>
                    <Select value={algorithm} onValueChange={v => {
                      const alg = v as BacktrackingAlgorithm;
                      if (onAlgorithmChange) onAlgorithmChange(alg);
                      else setInternalAlgorithm(alg);
                      resetViz();
                    }} disabled={isRunning}>
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
            </div>
          </Card>
          
          {/* Add Pseudocode Panel here */}
          {algorithm && (
            <PseudocodePanel 
              algorithm={algorithm} 
              activeLine={currentStep?.activeLine} 
            />
          )}
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

            {isDone && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 mx-6 mb-6 bg-background/98 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-2xl z-10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Exploration Report</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/5 rounded-xl border border-border/10 p-4">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Layers className="size-3" /> {algorithm === 'tsp' ? 'Best Tour Found' : 'Solution Summary'}
                    </p>
                    
                    {algorithm === 'n-queens' && (
                      <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20 shadow-inner">
                        <p className="text-[10px] text-emerald-600 font-black uppercase mb-2 tracking-widest text-center">Valid Arrangements</p>
                        <p className="text-4xl font-black text-emerald-500 text-center drop-shadow-sm">
                          {nQueensSolutions.length}
                        </p>
                        <p className="text-[11px] text-muted-foreground text-center italic mt-2 mb-4">
                          Successfully identified all non-conflicting queen positions for {nQueensSize}×{nQueensSize} board.
                        </p>
                        {nQueensSolutions.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest text-center border-t border-emerald-500/20 pt-3">All Solutions</p>
                            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${nQueensSolutions.length <= 2 ? nQueensSolutions.length : nQueensSize <= 5 ? 2 : 3}, 1fr)` }}>
                              {nQueensSolutions.map((solution, sIdx) => {
                                const queenSet = new Set(solution.map(q => `${q.row}-${q.col}`))
                                return (
                                  <div key={sIdx} className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-500">Solution {sIdx + 1}</span>
                                    <div
                                      className="grid border border-emerald-500/30 rounded-sm overflow-hidden shadow-md"
                                      style={{ gridTemplateColumns: `repeat(${nQueensSize}, 1fr)` }}
                                    >
                                      {Array.from({ length: nQueensSize }, (_, r) =>
                                        Array.from({ length: nQueensSize }, (_, c) => {
                                          const isDark = (r + c) % 2 === 1
                                          const hasQueen = queenSet.has(`${r}-${c}`)
                                          return (
                                            <div
                                              key={`${r}-${c}`}
                                              className={cn(
                                                'flex items-center justify-center transition-all',
                                                nQueensSize <= 5 ? 'w-8 h-8' : nQueensSize <= 6 ? 'w-7 h-7' : 'w-6 h-6',
                                                isDark ? 'bg-emerald-500/20' : 'bg-background',
                                                hasQueen && 'bg-emerald-500/30'
                                              )}
                                            >
                                              {hasQueen && (
                                                <span className={cn('drop-shadow-sm', nQueensSize <= 5 ? 'text-lg' : nQueensSize <= 6 ? 'text-base' : 'text-sm')}>
                                                  ♛
                                                </span>
                                              )}
                                            </div>
                                          )
                                        })
                                      )}
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                      {solution.map((q, qi) => (
                                        <span key={qi} className="text-[9px] font-mono text-muted-foreground bg-background/50 border border-border/30 rounded px-1">
                                          ({q.row},{q.col})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {algorithm === 'sum-of-subsets' && (
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 shadow-inner">
                        <p className="text-[10px] text-primary font-black uppercase mb-2 tracking-widest">Valid Subsets Found</p>
                        <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                          {(() => {
                            const data = currentStep?.data as any
                            if (!data?.validSubsets?.length) return <p className="text-xs text-muted-foreground italic">No subsets found.</p>
                            return data.validSubsets.map((s: number[], i: number) => (
                              <div key={i} className="bg-background border border-border/50 rounded-md px-2 py-1 text-xs font-mono flex justify-between">
                                <span>[{s.join(', ')}]</span>
                                <span className="font-bold text-emerald-500">Σ={subsetTarget}</span>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    )}

                    {algorithm === 'graph-coloring' && (
                      <div className="bg-purple-500/5 p-4 rounded-lg border border-purple-500/20 shadow-inner">
                        <p className="text-[10px] text-purple-600 font-black uppercase mb-2 tracking-widest">Color Assignment</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(() => {
                            const data = currentStep?.data as any
                            if (!data?.colors) return null
                            const hasSolution = data.colors.every((c: number) => c !== -1)
                            if (!hasSolution) return <p className="text-xs text-destructive font-bold italic">No valid coloring possible with {maxColors} colors.</p>
                            return data.colors.map((colorIdx: number, node: number) => (
                              <div key={node} className="bg-background border border-border/50 rounded-md px-2 py-1 flex items-center gap-2">
                                <span className="text-[9px] font-bold text-muted-foreground">#{node}</span>
                                <div className="size-2.5 rounded-full" style={{ backgroundColor: `hsl(${colorIdx * 137.5}, 70%, 50%)` }} />
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    )}

                    {algorithm === 'tsp' && (
                      <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20 shadow-inner">
                        <p className="text-[10px] text-blue-600 font-black uppercase mb-2 tracking-widest">Shortest Hamiltonian Cycle</p>
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          {(() => {
                            const data = currentStep?.data as any
                            if (!data?.bestPath?.length) return <p className="text-xs text-muted-foreground italic">No tour found.</p>
                            return data.bestPath.map((city: number, i: number) => (
                              <React.Fragment key={i}>
                                <div className="size-6 rounded bg-background border border-border/50 flex items-center justify-center text-[10px] font-black">
                                  {city}
                                </div>
                                {i < data.bestPath.length - 1 && <span className="text-blue-500/50">→</span>}
                              </React.Fragment>
                            ))
                          })()}
                        </div>
                        <div className="flex items-center justify-between border-t border-blue-500/10 pt-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Min Cost</span>
                          <span className="text-lg font-black text-blue-500">{(currentStep?.data as any)?.bestCost} units</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                      <Settings2 className="size-3" /> Search Metrics
                    </p>
                    <div className="grid grid-cols-2 gap-3 h-full">
                      <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 flex flex-col justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">States Explored</span>
                        <span className="text-xl font-black text-primary">{stats.statesExplored}</span>
                      </div>
                      <div className="bg-orange-500/5 p-3 rounded-xl border border-orange-500/10 flex flex-col justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Ops Count</span>
                        <span className="text-xl font-black text-orange-400">{stats.operations}</span>
                      </div>
                      <div className="bg-purple-500/5 p-3 rounded-xl border border-purple-500/10 flex flex-col justify-center col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">Theoretical Bound</span>
                          <Badge variant="outline" className="text-[10px] border-purple-500/20 text-purple-400">{algorithmInfo.worstCase}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2 italic leading-tight">
                          The search space is explored using state-space tree traversal with exhaustive backtracking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}
