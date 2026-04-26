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
  runMultistage, runBellmanFord, runFloydWarshall,
  GRAPH_INFO, type GraphStep, type Edge
} from '@/lib/graph-engine'
import { GraphDatasetGenerator, type GraphEdge, type GraphDatasetMeta } from '@/components/graph-dataset-generator'

const HOW_TO_STEPS = [
  { title: 'Configure Inputs', detail: 'Set graph edges and nodes in the Dataset tab depending on the algorithm.' },
  { title: 'Choose Algorithm', detail: 'Select a Graph algorithm like Multistage, Bellman-Ford, or Floyd-Warshall.' },
  { title: 'Start Visualization', detail: 'Press Start to watch the algorithm compute shortest paths.' },
  { title: 'Step Through', detail: 'Use Pause + Step Forward/Back to inspect each DP state update.' },
]

interface GraphVisualizerProps {
  guideOpen?: boolean
  onGuideOpenChange?: (open: boolean) => void
  hideGuideToggle?: boolean
}

type GraphAlgorithm = 'multistage' | 'bellman-ford' | 'floyd-warshall'

export function GraphVisualizer({
  guideOpen,
  onGuideOpenChange,
  hideGuideToggle = false,
}: GraphVisualizerProps = {}) {
  const [algorithm, setAlgorithm] = useState<GraphAlgorithm>('bellman-ford')
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [stepMessage, setStepMessage] = useState('Configure inputs and start visualization.')

  // Inputs
  const [nodesCount, setNodesCount] = useState(5)
  const [edgesInput, setEdgesInput] = useState('0,1,6\n0,2,7\n1,2,8\n1,3,5\n1,4,-4\n2,3,-3\n2,4,9\n3,1,-2\n4,0,2\n4,3,7')
  const [sourceNode, setSourceNode] = useState(0)
  const [stagesInput, setStagesInput] = useState('0\n1,2,3\n4,5,6\n7') // Node sets for multistage

  // Step history
  const [steps, setSteps] = useState<GraphStep[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [stats, setStats] = useState({ comparisons: 0, operations: 0, statesExplored: 0, memoryUsage: 0 })
  const [selectedPathNode, setSelectedPathNode] = useState<number | null>(null)

  // Playback
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speedRef = useRef(speed)
  const stepsRef = useRef<GraphStep[]>([])
  const indexRef = useRef(-1)

  const [internalGuideOpen, setInternalGuideOpen] = useState(false)
  const resolvedGuideOpen = typeof guideOpen === 'boolean' ? guideOpen : internalGuideOpen
  const handleGuideOpenChange = useCallback((open: boolean) => {
    if (typeof guideOpen !== 'boolean') setInternalGuideOpen(open)
    onGuideOpenChange?.(open)
  }, [guideOpen, onGuideOpenChange])

  useEffect(() => { speedRef.current = speed }, [speed])

  const currentStep: GraphStep | null = steps[currentIndex] ?? null

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const applyStep = useCallback((idx: number, allSteps: GraphStep[]) => {
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

  const startPlayback = useCallback((allSteps: GraphStep[], fromIndex: number) => {
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
      return { u: u || 0, v: v || 0, weight: weight || 0 }
    }).filter(e => !isNaN(e.u) && !isNaN(e.v) && !isNaN(e.weight))
  }

  const parseStages = (): number[][] => {
    return stagesInput.split('\n').map(line => line.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)))
  }

  const runVisualization = useCallback(() => {
    stopPlayback()
    setIsDone(false)

    let result: { steps: GraphStep[] }
    
    try {
      if (algorithm === 'multistage') {
        result = runMultistage(parseStages(), parseEdges())
      } else if (algorithm === 'bellman-ford') {
        result = runBellmanFord(nodesCount, parseEdges(), sourceNode)
      } else {
        result = runFloydWarshall(nodesCount, parseEdges())
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
  }, [algorithm, nodesCount, edgesInput, sourceNode, stagesInput, stopPlayback, applyStep, startPlayback])

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
    setSelectedPathNode(null)
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

  const algorithmInfo = GRAPH_INFO[algorithm]
  const progress = steps.length > 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0
  const speedLabel = speed <= 25 ? 'Slow' : speed <= 50 ? 'Medium' : speed <= 75 ? 'Fast' : 'Hyper'

  // Pre-calculate circular node positions for generic graph
  const nodePositions = useMemo(() => {
    const pos: Record<number, {x: number, y: number}> = {}
    const radius = 120
    const centerX = 200
    const centerY = 150
    const count = algorithm === 'multistage' ? 8 : nodesCount // Fallback
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2
      pos[i] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    }
    return pos
  }, [nodesCount, algorithm])

  // Sub-renderers
  const renderGraph = () => {
    if (!currentStep) return null
    if (currentStep.type !== 'bellman-ford' && currentStep.type !== 'multistage') return null
    
    const data = currentStep.data as any
    const { nodes = [], edges = [] } = data
    
    const sptEdges = data.sptEdges || []
    const isNegativeCycle = data.negativeCycle || false
    
    let activeEdge: Edge | null = null
    let activeNode = data.currentNode
    
    if (currentStep.type === 'bellman-ford') {
      activeEdge = data.relaxedEdge
    }

    const highlightEdge = (u: number, v: number) => {
      if (activeEdge?.u === u && activeEdge?.v === v) {
        return isNegativeCycle ? 'stroke-destructive stroke-[3px]' : 'stroke-primary stroke-[3px]'
      }

      const inSpt = sptEdges.some((e: Edge) => (e.u === u && e.v === v)) // Directed for Bellman-Ford

      // If we are currently building the SPT, highlight it clearly
      if (currentStep.stepType === 'spt-build' && inSpt) return 'stroke-emerald-500 stroke-[4px]'
      if (inSpt) return 'stroke-emerald-500 stroke-[4px]'

      // Highlight edges involved in the path reconstruction if selected
      if (selectedPathNode !== null && currentStep.type === 'bellman-ford' && isDone && !isNegativeCycle) {
        let curr = selectedPathNode
        let pathEdgeFound = false
        const parentArr = data.parent || []
        while (parentArr[curr] !== -1 && parentArr[curr] !== undefined) {
          const p = parentArr[curr]
          if (u === p && v === curr) {
            pathEdgeFound = true
            break
          }
          curr = p
        }
        if (pathEdgeFound) return 'stroke-blue-500 stroke-[4px]'
      }

      return 'stroke-border/50 stroke-2'
    }

    return (
      <div className="flex-1 min-h-[500px] flex flex-col p-4 relative overflow-hidden">
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <svg className="w-full h-full max-w-[500px]" viewBox="0 0 400 300">
          {/* Edges */}
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
                <rect x={midX - 8} y={midY - 8} width="16" height="16" rx="4" className="fill-background/80" />
                <text x={midX} y={midY} className="fill-muted-foreground text-[10px] font-medium" textAnchor="middle" dominantBaseline="central">
                  {edge.weight}
                </text>
              </g>
            )
          })}
          {/* Nodes */}
          {nodes.map((node: number) => {
            const p = nodePositions[node]
            if (!p) return null
            const isActive = activeNode === node
            const dist = data.distances ? data.distances[node] : (data.costs ? data.costs[node] : Infinity)
            const isSource = currentStep.type === 'bellman-ford' && node === sourceNode
            return (
              <g key={`n-${node}`} className="transition-all duration-300">
                <circle 
                  cx={p.x} cy={p.y} r="16" 
                  className={cn(
                    "transition-all duration-300 cursor-pointer hover:stroke-primary",
                    isActive ? "fill-primary/20 stroke-primary stroke-2" : 
                    isSource ? "fill-emerald-500/20 stroke-emerald-500 stroke-2" : "fill-background stroke-border stroke-2",
                    selectedPathNode === node ? "stroke-blue-500 fill-blue-500/20" : ""
                  )} 
                  onClick={() => setSelectedPathNode(node)}
                />
                <text x={p.x} y={p.y} className="fill-foreground text-xs font-bold" textAnchor="middle" dominantBaseline="central">
                  {node}
                </text>
                <text x={p.x} y={p.y - 25} className="fill-primary text-[12px] font-bold" textAnchor="middle">
                  {dist === Infinity ? '∞' : dist}
                </text>
              </g>
            )
          })}
        </svg>
        </div>
        {isDone && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-background/98 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-2xl z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Analysis Report</h3>
            </div>
            
            {algorithm === 'bellman-ford' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/5 rounded-xl border border-border/10 p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Layers className="size-3" /> Final Distances & Predecessors
                  </p>
                  <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    <table className="w-full text-xs text-left border-separate border-spacing-y-1">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="pb-1 font-medium pl-2">Node</th>
                          <th className="pb-1 font-medium">Distance</th>
                          <th className="pb-1 font-medium pr-2">Parent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.nodes.map((node: number) => (
                          <tr key={node} 
                            className={cn(
                              "group transition-all rounded-md", 
                              selectedPathNode === node ? "bg-blue-500/20 shadow-sm" : "hover:bg-muted/30"
                            )}
                            onClick={() => setSelectedPathNode(node)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td className="py-2 pl-2 font-bold">Node {node}</td>
                            <td className="py-2 font-mono font-bold text-primary">
                              {data.distances[node] === Infinity ? '∞' : data.distances[node]}
                            </td>
                            <td className="py-2 text-muted-foreground pr-2">
                              {data.parent?.[node] === -1 || data.parent?.[node] === undefined ? 
                                <span className="opacity-30">—</span> : 
                                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold text-foreground">{data.parent[node]}</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                    <Info className="size-3" /> Result Summary
                  </p>
                  {isNegativeCycle ? (
                    <div className="h-full flex flex-col items-center justify-center bg-destructive/10 p-6 rounded-xl border border-destructive/20 shadow-inner">
                      <div className="size-12 rounded-full bg-destructive/20 flex items-center justify-center mb-3">
                        <RotateCcw className="size-6 text-destructive animate-spin-slow" />
                      </div>
                      <p className="text-sm text-destructive font-black uppercase tracking-widest mb-1">Negative Cycle Detected!</p>
                      <p className="text-[10px] text-muted-foreground text-center">Shortest paths are undefined as a cycle reduces distance infinitely.</p>
                    </div>
                  ) : selectedPathNode !== null ? (
                    data.distances[selectedPathNode] === Infinity ? (
                      <div className="h-full flex items-center justify-center bg-destructive/5 rounded-xl border border-destructive/10 p-4">
                        <p className="text-sm text-destructive font-bold">Unreachable Node {selectedPathNode}</p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 shadow-inner">
                        <p className="text-[10px] text-blue-500 font-black uppercase mb-3 tracking-widest">Optimal Path to {selectedPathNode}</p>
                        <div className="flex items-center flex-wrap gap-2 mb-4">
                          {(() => {
                            const path = []
                            let curr = selectedPathNode
                            const parentArr = data.parent || []
                            while (curr !== -1 && curr !== undefined) {
                              path.unshift(curr)
                              curr = parentArr[curr]
                            }
                            return path.map((n, i) => (
                              <React.Fragment key={i}>
                                <motion.span 
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: i * 0.1 }}
                                  className={cn(
                                    "size-8 rounded-lg flex items-center justify-center text-sm font-black shadow-sm border",
                                    n === selectedPathNode ? "bg-blue-500 text-white border-blue-400" : "bg-background border-border"
                                  )}
                                >
                                  {n}
                                </motion.span>
                                {i < path.length - 1 && (
                                  <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.1 + 0.05 }}
                                    className="text-blue-500/50"
                                  >
                                    →
                                  </motion.span>
                                )}
                              </React.Fragment>
                            ))
                          })()}
                        </div>
                        <div className="flex items-center justify-between border-t border-blue-500/10 pt-3 mt-auto">
                          <span className="text-xs font-bold text-muted-foreground uppercase">Cost Efficiency</span>
                          <span className="text-lg font-black text-primary drop-shadow-sm">{data.distances[selectedPathNode]} units</span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 bg-muted/10 rounded-xl border border-dashed border-border/50 p-6 group cursor-pointer hover:border-primary/50 transition-colors">
                      <HelpCircle className="size-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="text-xs text-muted-foreground font-medium text-center italic">
                        Select a node in the table or click on the graph <br/> to visualize the reconstructed shortest path.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {algorithm === 'floyd-warshall' && (
              <div className="space-y-4">
                <div className="bg-muted/5 rounded-xl border border-border/10 p-4 overflow-x-auto">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Layers className="size-3" /> All-Pairs Shortest Path Matrix
                  </p>
                  <table className="min-w-full text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border-b border-border/20"></th>
                        {data.matrix.map((_: any, idx: number) => (
                          <th key={idx} className="p-2 border-b border-border/20 text-muted-foreground font-bold">Node {idx}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.matrix.map((row: number[], i: number) => (
                        <tr key={i}>
                          <th className="p-2 border-r border-border/20 text-muted-foreground font-bold">Node {i}</th>
                          {row.map((val: number, j: number) => (
                            <td key={j} className={cn(
                              "p-2 text-center font-mono font-bold",
                              i === j ? "text-muted-foreground/30" : "text-primary"
                            )}>
                              {val === Infinity ? '∞' : val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <Info className="size-4 text-primary" />
                  <p className="text-xs font-medium text-foreground/80">
                    The matrix above shows the minimum cost to travel between any two nodes after considering all possible intermediate vertices.
                  </p>
                </div>
              </div>
            )}

            {algorithm === 'multistage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/5 rounded-xl border border-border/10 p-4">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Layers className="size-3" /> Stage-wise Minimum Costs
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {data.costs.map((cost: number, node: number) => (
                      <div key={node} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/30">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Node {node}</span>
                        <span className="text-xs font-black text-primary">{cost === Infinity ? '∞' : cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center bg-emerald-500/5 p-6 rounded-xl border border-emerald-500/20 shadow-inner">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Optimal Path Cost</span>
                  <span className="text-4xl font-black text-emerald-500">
                    {data.costs[0] === Infinity ? 'N/A' : data.costs[0]}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-4 text-center italic leading-tight">
                    Computed using Backward DP approach. Minimum cost from source to sink verified.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    )
  }

  const renderMatrix = () => {
    if (!currentStep || currentStep.type !== 'floyd-warshall') return null
    const data = currentStep.data as any
    const matrix: number[][] = data.matrix
    const n = matrix.length

    return (
      <div className="flex-1 p-6 flex flex-col gap-6 items-center justify-center">
        <div className="flex gap-4 mb-4">
          <div className="text-center px-4 py-2 rounded-lg bg-background/50 border border-border/20">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Intermediate (k)</p>
            <p className="text-xl font-bold text-primary">{data.k >= 0 ? data.k : '-'}</p>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-background/50 border border-border/20">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Evaluating</p>
            <p className="text-xl font-bold text-emerald-500">
              {data.i >= 0 && data.j >= 0 ? `${data.i} → ${data.j}` : '-'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-transparent"></th>
                {Array.from({length: n}, (_, i) => (
                  <th key={i} className="p-2 min-w-[40px] border border-border/20 bg-primary/5 text-xs font-bold text-muted-foreground">{i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <th className="p-2 border border-border/20 bg-primary/5 text-xs font-bold text-muted-foreground">{i}</th>
                  {row.map((val, j) => {
                    const isK = i === data.k || j === data.k
                    const isEvaluating = i === data.i && j === data.j
                    const isImproved = isEvaluating && data.improved
                    return (
                      <td key={j} className={cn(
                        "p-3 text-center text-sm font-medium border border-border/20 transition-all",
                        isEvaluating ? (isImproved ? "bg-emerald-500/20 text-emerald-500 shadow-inner" : "bg-primary/20 text-primary") :
                        isK ? "bg-muted/30 text-muted-foreground" : "bg-background/20 text-foreground/80"
                      )}>
                        {val === Infinity ? '∞' : val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Guide */}
      <Collapsible open={resolvedGuideOpen} onOpenChange={handleGuideOpenChange} className="w-full">
        {!hideGuideToggle && (
          <div className="flex justify-center mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="text-muted-foreground text-xs hover:text-primary">
                <HelpCircle className="mr-2 size-3.5" />Graph Guide
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">States</p>
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
        {/* Sidebar */}
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
                <TabsContent value="dataset" className="mt-0 space-y-4">
                  {algorithm === 'multistage' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Stages (comma separated nodes)</Label>
                      <textarea value={stagesInput} onChange={e => setStagesInput(e.target.value)} disabled={isRunning} rows={3}
                        className="w-full rounded-md border border-border/50 bg-input/20 p-3 text-sm focus:ring-2 focus:ring-primary/40 font-mono text-xs" />
                    </div>
                  )}
                  
                  <GraphDatasetGenerator 
                    disabled={isRunning}
                    showSourceNode={algorithm === 'bellman-ford'}
                    sourceNode={sourceNode}
                    onSourceNodeChange={setSourceNode}
                    onDatasetReady={handleDatasetReady}
                  />
                </TabsContent>

                {/* Algorithm Tab */}
                <TabsContent value="algorithm" className="mt-0 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">1. Select Algorithm</Label>
                    <Select value={algorithm} onValueChange={v => { setAlgorithm(v as GraphAlgorithm); resetViz() }} disabled={isRunning}>
                      <SelectTrigger className="h-9 bg-input/20 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multistage">Multistage Graph</SelectItem>
                        <SelectItem value="bellman-ford">Bellman-Ford</SelectItem>
                        <SelectItem value="floyd-warshall">Floyd-Warshall</SelectItem>
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

          {/* Theory Card */}
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

        {/* Main Arena */}
        <main className="flex flex-col gap-4">
          <Card className="glass-card p-0 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between px-6 py-3 bg-background/20 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold">Graph Arena</h2>
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

            {/* Visualization Areas */}
            {renderGraph()}
            {renderMatrix()}
            
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
