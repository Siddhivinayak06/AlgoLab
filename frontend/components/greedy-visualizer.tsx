'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
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
  runDijkstra, runFractionalKnapsack, runJobScheduling, runPrims, runKruskals,
  GREEDY_INFO, type GreedyStep, type Edge, type KnapsackItem, type Job
} from '@/lib/greedy-engine'
import { GraphDatasetGenerator, type GraphEdge, type GraphDatasetMeta } from '@/components/graph-dataset-generator'
import { DPDatasetGenerator, type DPDataset, type DPDatasetMeta } from '@/components/dp-dataset-generator'
import { PseudocodePanel } from '@/components/pseudocode-panel'

const HOW_TO_STEPS = [
  { title: 'Configure Inputs', detail: 'Set graph edges, items, or jobs in the Dataset tab depending on the algorithm.' },
  { title: 'Choose Algorithm', detail: 'Select a Greedy algorithm like Dijkstra, Kruskal, or Job Scheduling.' },
  { title: 'Start Visualization', detail: 'Press Start to watch the algorithm make locally optimal choices.' },
  { title: 'Step Through', detail: 'Use Pause + Step Forward/Back to inspect each decision.' },
]

interface GreedyVisualizerProps {
  guideOpen?: boolean
  onGuideOpenChange?: (open: boolean) => void
  hideGuideToggle?: boolean
}

type GreedyAlgorithm = 'dijkstra' | 'fractional-knapsack' | 'job-scheduling' | 'prims' | 'kruskals'

export function GreedyVisualizer({
  guideOpen,
  onGuideOpenChange,
  hideGuideToggle = false,
}: GreedyVisualizerProps = {}) {
  const [algorithm, setAlgorithm] = useState<GreedyAlgorithm>('dijkstra')
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [stepMessage, setStepMessage] = useState('Configure inputs and start visualization.')

  // Inputs
  const [nodesCount, setNodesCount] = useState(5)
  const [edgesInput, setEdgesInput] = useState('0,1,10\n0,2,3\n1,2,1\n1,3,2\n2,1,4\n2,3,8\n2,4,2\n3,4,7\n4,3,9')
  const [sourceNode, setSourceNode] = useState(0)
  const [knapsackItemsInput, setKnapsackItemsInput] = useState('10,60\n20,100\n30,120') // weight,value
  const [knapsackCapacity, setKnapsackCapacity] = useState(50)
  const [jobsInput, setJobsInput] = useState('2,100\n1,19\n2,27\n1,25\n3,15') // deadline,profit

  // Step history
  const [steps, setSteps] = useState<GreedyStep[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [stats, setStats] = useState({ comparisons: 0, operations: 0, statesExplored: 0, memoryUsage: 0 })
  const [selectedPathNode, setSelectedPathNode] = useState<number | null>(null)

  // Playback
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speedRef = useRef(speed)
  const stepsRef = useRef<GreedyStep[]>([])
  const indexRef = useRef(-1)

  const [internalGuideOpen, setInternalGuideOpen] = useState(false)
  const resolvedGuideOpen = typeof guideOpen === 'boolean' ? guideOpen : internalGuideOpen
  const handleGuideOpenChange = useCallback((open: boolean) => {
    if (typeof guideOpen !== 'boolean') setInternalGuideOpen(open)
    onGuideOpenChange?.(open)
  }, [guideOpen, onGuideOpenChange])

  useEffect(() => { speedRef.current = speed }, [speed])

  const currentStep: GreedyStep | null = steps[currentIndex] ?? null

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const applyStep = useCallback((idx: number, allSteps: GreedyStep[]) => {
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

  const startPlayback = useCallback((allSteps: GreedyStep[], fromIndex: number) => {
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

  const parseKnapsackItems = (): KnapsackItem[] => {
    return knapsackItemsInput.split('\n').map((line, i) => {
      const [weight, value] = line.split(',').map(s => parseInt(s.trim(), 10))
      return { id: i + 1, weight: weight || 0, value: value || 0, ratio: (value || 0) / (weight || 1) }
    }).filter(item => !isNaN(item.weight) && !isNaN(item.value))
  }

  const parseJobs = (): Job[] => {
    return jobsInput.split('\n').map((line, i) => {
      const [deadline, profit] = line.split(',').map(s => parseInt(s.trim(), 10))
      return { id: i + 1, deadline: deadline || 0, profit: profit || 0 }
    }).filter(job => !isNaN(job.deadline) && !isNaN(job.profit))
  }

  const runVisualization = useCallback(() => {
    stopPlayback()
    setIsDone(false)

    let result: { steps: GreedyStep[] }
    
    try {
      if (algorithm === 'dijkstra') {
        result = runDijkstra(nodesCount, parseEdges(), sourceNode)
      } else if (algorithm === 'fractional-knapsack') {
        result = runFractionalKnapsack(parseKnapsackItems(), knapsackCapacity)
      } else if (algorithm === 'job-scheduling') {
        result = runJobScheduling(parseJobs())
      } else if (algorithm === 'prims') {
        result = runPrims(nodesCount, parseEdges())
      } else {
        result = runKruskals(nodesCount, parseEdges())
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
  }, [algorithm, nodesCount, edgesInput, sourceNode, knapsackItemsInput, knapsackCapacity, jobsInput, stopPlayback, applyStep, startPlayback])

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

  const handleGraphDatasetReady = useCallback((nodes: number, newEdges: GraphEdge[], meta: GraphDatasetMeta) => {
    setNodesCount(nodes)
    const formatted = newEdges.map(e => `${e.u},${e.v},${e.weight}`).join('\n')
    setEdgesInput(formatted)
    resetViz()
  }, [resetViz])

  const handleDPDatasetReady = useCallback((dataset: DPDataset, meta: DPDatasetMeta) => {
    if (dataset.type === 'knapsack') {
      const items = dataset.weights.map((w, i) => `${w},${dataset.values[i]}`).join('\n')
      setKnapsackItemsInput(items)
      setKnapsackCapacity(dataset.capacity)
      resetViz()
    }
  }, [resetViz])

  useEffect(() => {
    return () => stopPlayback()
  }, [stopPlayback])

  const algorithmInfo = GREEDY_INFO[algorithm]
  const progress = steps.length > 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0
  const speedLabel = speed <= 25 ? 'Slow' : speed <= 50 ? 'Medium' : speed <= 75 ? 'Fast' : 'Hyper'

  // Pre-calculate node positions for graph visualization
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

  // Sub-renderers
  const renderGraph = () => {
    if (!currentStep) return null
    if (currentStep.type !== 'dijkstra' && currentStep.type !== 'prims' && currentStep.type !== 'kruskals') return null
    
    const data = currentStep.data as any // Cast for convenience based on union
    const { nodes = [], edges = [] } = data
    const activeNode = data.currentNode
    const visited = data.visited || data.inMST || []
    const mstEdges = data.mstEdges || []
    const sptEdges = data.sptEdges || []
    
    const highlightEdge = (u: number, v: number) => {
      if (currentStep.type === 'kruskals' && data.currentEdge?.u === u && data.currentEdge?.v === v) return 'stroke-emerald-500 stroke-[3px]'
      if (mstEdges.some((e: Edge) => (e.u === u && e.v === v) || (e.u === v && e.v === u))) return 'stroke-primary stroke-[3px]'
      
      const inSpt = sptEdges.some((e: Edge) => (e.u === u && e.v === v) || (e.u === v && e.v === u))
      
      // If we are currently building the SPT, highlight it clearly
      if (currentStep.stepType === 'spt-build' && inSpt) return 'stroke-emerald-500 stroke-[4px]'
      if (inSpt) return 'stroke-emerald-500 stroke-[4px]'
      
      // Highlight edges involved in the path reconstruction if selected
      if (selectedPathNode !== null && currentStep.type === 'dijkstra' && isDone) {
        let curr = selectedPathNode
        let pathEdgeFound = false
        const parentArr = data.parent || []
        while (parentArr[curr] !== -1 && parentArr[curr] !== undefined) {
          const p = parentArr[curr]
          if ((u === p && v === curr) || (u === curr && v === p)) {
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
            const isVisited = visited[node]
            const isActive = activeNode === node
            return (
              <g key={`n-${node}`} className="transition-all duration-300">
                <circle 
                  cx={p.x} cy={p.y} r="16" 
                  className={cn(
                    "transition-all duration-300 cursor-pointer hover:stroke-primary",
                    isActive ? "fill-primary/20 stroke-primary stroke-2" : 
                    isVisited ? "fill-emerald-500/20 stroke-emerald-500 stroke-2" : "fill-background stroke-border stroke-2",
                    selectedPathNode === node ? "stroke-blue-500 fill-blue-500/20" : ""
                  )} 
                  onClick={() => setSelectedPathNode(node)}
                />
                <text x={p.x} y={p.y} className="fill-foreground text-xs font-bold" textAnchor="middle" dominantBaseline="central">
                  {node}
                </text>
                {/* Distance label for Dijkstra */}
                {currentStep.type === 'dijkstra' && (
                  <text x={p.x} y={p.y - 25} className="fill-primary text-[12px] font-bold" textAnchor="middle">
                    {data.distances[node] === Infinity ? '∞' : data.distances[node]}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        </div>
        {isDone && algorithm === 'dijkstra' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-background/98 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-2xl z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Analysis Report</h3>
            </div>
            
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
                            {data.parent[node] === -1 || data.parent[node] === undefined ? 
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
                  <Info className="size-3" /> Path Reconstruction
                </p>
                {selectedPathNode !== null ? (
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
                          while (curr !== -1 && curr !== undefined) {
                            path.unshift(curr)
                            curr = data.parent[curr]
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
          </motion.div>
        )}

        {isDone && (algorithm === 'prims' || algorithm === 'kruskals') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-background/98 backdrop-blur-xl border border-emerald-500/20 p-5 rounded-2xl shadow-2xl z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Minimum Spanning Tree Report</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/5 rounded-xl border border-border/10 p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Layers className="size-3" /> MST Edge List
                </p>
                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  <table className="w-full text-xs text-left border-separate border-spacing-y-1">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="pb-1 font-medium pl-2">Edge</th>
                        <th className="pb-1 font-medium">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.mstEdges || []).map((edge: Edge, i: number) => (
                        <tr key={i} className="hover:bg-muted/30 transition-all rounded-md">
                          <td className="py-2 pl-2 font-bold text-foreground">Node {edge.u} ↔ Node {edge.v}</td>
                          <td className="py-2 font-mono font-bold text-emerald-500">{edge.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 bg-emerald-500/5 p-5 rounded-xl border border-emerald-500/20 shadow-inner">
                <p className="text-[10px] text-emerald-600 font-black uppercase mb-1 tracking-widest text-center">Final MST Weight</p>
                <p className="text-4xl font-black text-emerald-500 text-center drop-shadow-sm">
                  {(data.mstEdges || []).reduce((sum: number, e: Edge) => sum + e.weight, 0)}
                </p>
                <p className="text-[11px] text-muted-foreground text-center italic mt-2 leading-tight">
                  Successfully constructed a spanning tree with minimum total weight using {algorithmInfo.name}.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderKnapsack = () => {
    if (!currentStep || currentStep.type !== 'fractional-knapsack') return null
    const data = currentStep.data as any
    return (
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-background/30">
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">Remaining Capacity</p>
            <p className="text-2xl font-bold text-primary mt-1">{data.remainingCapacity.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{data.totalValue.toFixed(2)}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/20">
          <table className="w-full text-sm text-left">
            <thead className="bg-primary/5 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Ratio</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10 bg-background/20">
              {data.sortedItems.map((item: KnapsackItem, i: number) => {
                const inKnapsack = data.knapsack.find((k: any) => k.item.id === item.id)
                const isCurrent = data.currentItem?.id === item.id
                return (
                  <tr key={i} className={cn("transition-colors", isCurrent ? "bg-primary/10" : "")}>
                    <td className="px-4 py-3 font-medium">#{item.id}</td>
                    <td className="px-4 py-3">{item.weight}</td>
                    <td className="px-4 py-3">{item.value}</td>
                    <td className="px-4 py-3">{(item.value / item.weight).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {inKnapsack ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          {(inKnapsack.fraction * 100).toFixed(0)}% Included
                        </Badge>
                      ) : isCurrent ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 animate-pulse">Evaluating</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Waiting</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {isDone && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 bg-background/98 backdrop-blur-xl border border-emerald-500/20 p-5 rounded-2xl shadow-2xl z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Knapsack Result Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/5 rounded-xl border border-border/10 p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Layers className="size-3" /> Included Items
                </p>
                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  <table className="w-full text-xs text-left border-separate border-spacing-y-1">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="pb-1 font-medium pl-2">Item</th>
                        <th className="pb-1 font-medium text-right pr-2">Portion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.knapsack.map((entry: any, i: number) => (
                        <tr key={i} className="hover:bg-muted/30 transition-all rounded-md">
                          <td className="py-2 pl-2 font-bold text-foreground">Item #{entry.item.id}</td>
                          <td className="py-2 text-right pr-2">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              {(entry.fraction * 100).toFixed(0)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 flex flex-col justify-center items-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Maximized Value</span>
                  <span className="text-3xl font-black text-emerald-500 mt-1">{data.totalValue.toFixed(2)}</span>
                </div>
                <div className="bg-muted/20 p-3 rounded-xl border border-border/10 flex justify-between items-center px-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Remaining Capacity</span>
                  <span className="text-sm font-bold font-mono">{data.remainingCapacity.toFixed(1)} units</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  const renderJobScheduling = () => {
    if (!currentStep || currentStep.type !== 'job-scheduling') return null
    const data = currentStep.data as any
    const maxDeadline = Math.max(...data.jobs.map((j: Job) => j.deadline), 0)
    
    return (
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-background/30">
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">Accepted Jobs</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{data.accepted.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">Rejected Jobs</p>
            <p className="text-2xl font-bold text-destructive mt-1">{data.rejected.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-muted-foreground">Total Profit</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {data.accepted.reduce((sum: number, j: Job) => sum + j.profit, 0)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold mb-3">Timeline Slots</h3>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {data.timeline.slice(1).map((job: Job | null, i: number) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-16">
                <span className="text-xs text-muted-foreground font-medium">T={i+1}</span>
                <div className={cn(
                  "w-16 h-16 rounded-xl border-2 flex items-center justify-center flex-col transition-all",
                  job ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-muted/10 border-dashed border-border/30 text-muted-foreground"
                )}>
                  {job ? (
                    <>
                      <span className="text-xs font-bold">J{job.id}</span>
                      <span className="text-[10px] opacity-70">${job.profit}</span>
                    </>
                  ) : (
                    <span className="text-[10px]">Empty</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-bold mb-3">Jobs List (Sorted by Profit)</h3>
          <div className="flex flex-wrap gap-2">
            {[...data.jobs].sort((a,b) => b.profit - a.profit).map((job: Job, i: number) => {
              const isAccepted = data.accepted.find((j: Job) => j.id === job.id)
              const isRejected = data.rejected.find((j: Job) => j.id === job.id)
              const isCurrent = data.currentJob?.id === job.id
              return (
                <div key={i} className={cn(
                  "px-3 py-2 rounded-lg border flex flex-col items-center gap-1 transition-all",
                  isAccepted ? "bg-emerald-500/10 border-emerald-500/20" : 
                  isRejected ? "bg-destructive/10 border-destructive/20 opacity-50" :
                  isCurrent ? "bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]" : "bg-background border-border/20"
                )}>
                  <span className="text-xs font-bold text-foreground">J{job.id}</span>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>${job.profit}</span>
                    <span>DL:{job.deadline}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {isDone && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 bg-background/98 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-2xl z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Job Scheduling Report</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/5 rounded-xl border border-border/10 p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Layers className="size-3" /> Scheduled Sequence
                </p>
                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar px-1">
                  <div className="flex flex-col gap-1.5">
                    {data.timeline.slice(1).map((job: Job | null, i: number) => (
                      job && (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/50">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground">T={i+1}</span>
                            <span className="text-xs font-black">Job #{job.id}</span>
                          </div>
                          <span className="text-xs font-bold text-primary">+${job.profit}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col justify-center items-center h-full">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Profit Earned</span>
                  <span className="text-4xl font-black text-primary mt-2">
                    ${data.accepted.reduce((sum: number, j: Job) => sum + j.profit, 0)}
                  </span>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-primary/10 w-full justify-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Accepted</span>
                      <span className="text-xs font-bold text-emerald-500">{data.accepted.length}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-border/20 pl-4">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Rejected</span>
                      <span className="text-xs font-bold text-destructive">{data.rejected.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
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
                <HelpCircle className="mr-2 size-3.5" />Greedy Guide
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
                  {(algorithm === 'dijkstra' || algorithm === 'prims' || algorithm === 'kruskals') && (
                    <GraphDatasetGenerator 
                      disabled={isRunning}
                      showSourceNode={algorithm === 'dijkstra'}
                      sourceNode={sourceNode}
                      onSourceNodeChange={setSourceNode}
                      onDatasetReady={handleGraphDatasetReady}
                    />
                  )}
                  {algorithm === 'fractional-knapsack' && (
                    <DPDatasetGenerator
                      disabled={isRunning}
                      activeType="knapsack"
                      onDatasetReady={handleDPDatasetReady}
                    />
                  )}
                  {algorithm === 'job-scheduling' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Jobs (deadline,profit)</Label>
                      <textarea value={jobsInput} onChange={e => setJobsInput(e.target.value)} disabled={isRunning} rows={8}
                        className="w-full rounded-md border border-border/50 bg-input/20 p-3 text-sm focus:ring-2 focus:ring-primary/40 font-mono text-xs" />
                    </div>
                  )}
                </TabsContent>

                {/* Algorithm Tab */}
                <TabsContent value="algorithm" className="mt-0 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">1. Select Algorithm</Label>
                    <Select value={algorithm} onValueChange={v => { setAlgorithm(v as GreedyAlgorithm); resetViz() }} disabled={isRunning}>
                      <SelectTrigger className="h-9 bg-input/20 border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
                        <SelectItem value="fractional-knapsack">Fractional Knapsack</SelectItem>
                        <SelectItem value="job-scheduling">Job Scheduling</SelectItem>
                        <SelectItem value="prims">Prim's MST</SelectItem>
                        <SelectItem value="kruskals">Kruskal's MST</SelectItem>
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

          {/* Pseudocode Panel */}
          {algorithm && (
            <PseudocodePanel 
              algorithm={algorithm} 
              activeLine={currentStep?.activeLine} 
            />
          )}
        </aside>

        {/* Main Arena */}
        <main className="flex flex-col gap-4">
          <Card className="glass-card p-0 overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between px-6 py-3 bg-background/20 border-b border-border/20">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold">Greedy Arena</h2>
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
            {renderKnapsack()}
            {renderJobScheduling()}
            
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
