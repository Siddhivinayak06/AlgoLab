'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BookOpen,
  Network,
  PencilLine,
  RefreshCw,
  Shuffle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface GraphEdge {
  u: number
  v: number
  weight: number
}

export interface GraphDatasetMeta {
  source: 'random' | 'custom' | 'sample'
  nodeCount: number
  edgeCount: number
}

interface GraphDatasetGeneratorProps {
  onDatasetReady: (nodes: number, edges: GraphEdge[], meta: GraphDatasetMeta) => void
  disabled?: boolean
  className?: string
  /** When true shows extra fields like source node */
  showSourceNode?: boolean
  onSourceNodeChange?: (node: number) => void
  sourceNode?: number
  /** Extra fields for knapsack-type algorithms */
  showKnapsackFields?: boolean
  onKnapsackItemsChange?: (input: string) => void
  knapsackItemsInput?: string
  onKnapsackCapacityChange?: (cap: number) => void
  knapsackCapacity?: number
  /** Extra fields for job scheduling */
  showJobFields?: boolean
  onJobsInputChange?: (input: string) => void
  jobsInput?: string
}

const SAMPLE_GRAPHS: Array<{ label: string; nodes: number; edges: GraphEdge[]; description: string }> = [
  {
    label: 'Triangle',
    nodes: 3,
    description: '3 nodes, 3 edges',
    edges: [
      { u: 0, v: 1, weight: 4 },
      { u: 1, v: 2, weight: 6 },
      { u: 0, v: 2, weight: 2 },
    ]
  },
  {
    label: 'Diamond',
    nodes: 4,
    description: '4 nodes, 5 edges',
    edges: [
      { u: 0, v: 1, weight: 1 },
      { u: 0, v: 2, weight: 4 },
      { u: 1, v: 2, weight: 2 },
      { u: 1, v: 3, weight: 6 },
      { u: 2, v: 3, weight: 3 },
    ]
  },
  {
    label: 'Dijkstra Classic',
    nodes: 5,
    description: '5 nodes, 9 edges',
    edges: [
      { u: 0, v: 1, weight: 10 },
      { u: 0, v: 2, weight: 3 },
      { u: 1, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 2 },
      { u: 2, v: 1, weight: 4 },
      { u: 2, v: 3, weight: 8 },
      { u: 2, v: 4, weight: 2 },
      { u: 3, v: 4, weight: 7 },
      { u: 4, v: 3, weight: 9 },
    ]
  },
  {
    label: 'Dense 6-node',
    nodes: 6,
    description: '6 nodes, 10 edges',
    edges: [
      { u: 0, v: 1, weight: 7 },
      { u: 0, v: 2, weight: 9 },
      { u: 0, v: 5, weight: 14 },
      { u: 1, v: 2, weight: 10 },
      { u: 1, v: 3, weight: 15 },
      { u: 2, v: 3, weight: 11 },
      { u: 2, v: 5, weight: 2 },
      { u: 3, v: 4, weight: 6 },
      { u: 4, v: 5, weight: 9 },
      { u: 5, v: 3, weight: 4 },
    ]
  },
  {
    label: 'Negative Weights',
    nodes: 5,
    description: '5 nodes (Bellman-Ford)',
    edges: [
      { u: 0, v: 1, weight: 6 },
      { u: 0, v: 2, weight: 7 },
      { u: 1, v: 2, weight: 8 },
      { u: 1, v: 3, weight: 5 },
      { u: 1, v: 4, weight: -4 },
      { u: 2, v: 3, weight: -3 },
      { u: 2, v: 4, weight: 9 },
      { u: 3, v: 1, weight: -2 },
      { u: 4, v: 0, weight: 2 },
      { u: 4, v: 3, weight: 7 },
    ]
  },
]

function edgesToText(edges: GraphEdge[]): string {
  return edges.map(e => `${e.u},${e.v},${e.weight}`).join('\n')
}

function parseEdgesText(text: string): { edges: GraphEdge[]; error: string | null } {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length === 0) return { edges: [], error: 'Please enter at least one edge.' }

  const edges: GraphEdge[] = []
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
    if (parts.length < 2) return { edges: [], error: `Line ${i + 1}: Need at least u,v (weight optional). Got: "${lines[i]}"` }

    const u = parseInt(parts[0], 10)
    const v = parseInt(parts[1], 10)
    const weight = parts.length >= 3 ? parseInt(parts[2], 10) : 1

    if (isNaN(u) || isNaN(v) || isNaN(weight)) {
      return { edges: [], error: `Line ${i + 1}: Invalid numbers in "${lines[i]}"` }
    }

    edges.push({ u, v, weight })
  }

  return { edges, error: null }
}

function generateRandomGraph(nodeCount: number, density: number): GraphEdge[] {
  const edges: GraphEdge[] = []
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2
  const targetEdges = Math.max(nodeCount - 1, Math.floor(maxEdges * (density / 100)))

  // First, create a spanning tree to ensure connectivity
  for (let i = 1; i < nodeCount; i++) {
    const parent = Math.floor(Math.random() * i)
    edges.push({ u: parent, v: i, weight: Math.floor(Math.random() * 20) + 1 })
  }

  // Then add extra edges
  const existing = new Set(edges.map(e => `${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`))
  while (edges.length < targetEdges) {
    const u = Math.floor(Math.random() * nodeCount)
    const v = Math.floor(Math.random() * nodeCount)
    if (u === v) continue
    const key = `${Math.min(u, v)}-${Math.max(u, v)}`
    if (existing.has(key)) continue
    existing.add(key)
    edges.push({ u, v, weight: Math.floor(Math.random() * 20) + 1 })
  }

  return edges
}

export function GraphDatasetGenerator({
  onDatasetReady,
  disabled = false,
  className,
  showSourceNode = false,
  onSourceNodeChange,
  sourceNode = 0,
}: GraphDatasetGeneratorProps) {
  const [nodeCount, setNodeCount] = useState(5)
  const [density, setDensity] = useState(40)
  const [edgesText, setEdgesText] = useState(edgesToText(SAMPLE_GRAPHS[2].edges))
  const [showCustom, setShowCustom] = useState(false)
  const [showSamples, setShowSamples] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState<GraphEdge[]>(SAMPLE_GRAPHS[2].edges)

  const handleRandomGenerate = useCallback(() => {
    const edges = generateRandomGraph(nodeCount, density)
    setPreview(edges)
    setEdgesText(edgesToText(edges))
    setErrorMessage(null)
    setShowCustom(false)
    setShowSamples(false)
    onDatasetReady(nodeCount, edges, { source: 'random', nodeCount, edgeCount: edges.length })
  }, [nodeCount, density, onDatasetReady])

  const handleCustomApply = useCallback(() => {
    const { edges, error } = parseEdgesText(edgesText)
    if (error) {
      setErrorMessage(error)
      return
    }
    // Infer node count from edges
    const maxNode = Math.max(...edges.flatMap(e => [e.u, e.v]))
    const inferredNodeCount = maxNode + 1
    setNodeCount(inferredNodeCount)
    setPreview(edges)
    setErrorMessage(null)
    onDatasetReady(inferredNodeCount, edges, { source: 'custom', nodeCount: inferredNodeCount, edgeCount: edges.length })
  }, [edgesText, onDatasetReady])

  const handleLoadSample = useCallback((sample: typeof SAMPLE_GRAPHS[0]) => {
    setNodeCount(sample.nodes)
    setPreview(sample.edges)
    setEdgesText(edgesToText(sample.edges))
    setErrorMessage(null)
    setShowCustom(false)
    setShowSamples(false)
    onDatasetReady(sample.nodes, sample.edges, { source: 'sample', nodeCount: sample.nodes, edgeCount: sample.edges.length })
  }, [onDatasetReady])

  // SVG preview of graph
  const graphPreview = useMemo(() => {
    if (preview.length === 0) return null
    const maxNode = Math.max(...preview.flatMap(e => [e.u, e.v]))
    const n = maxNode + 1
    const positions: Record<number, { x: number; y: number }> = {}
    const radius = 70
    const cx = 100
    const cy = 80
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      positions[i] = { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
    }
    return { positions, n }
  }, [preview])

  return (
    <Card className={cn('glass-card space-y-3 p-4', className)}>
      <h2 className="text-base font-semibold text-foreground">Graph Dataset</h2>

      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        <Button
          type="button" size="sm"
          className="h-9 rounded-lg bg-primary px-2 text-[11px] text-primary-foreground hover:bg-primary/90 [&_svg]:size-3.5"
          onClick={handleRandomGenerate} disabled={disabled}
        >
          <Shuffle className="size-4" /> Generate Random
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          className="h-9 rounded-lg border-border/50 bg-background/20 px-2 text-[11px] [&_svg]:size-3.5"
          onClick={() => setShowCustom(o => !o)} disabled={disabled}
        >
          <PencilLine className="size-4" /> Custom Input
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          className="h-9 rounded-lg border-border/50 bg-background/20 px-2 text-[11px] [&_svg]:size-3.5"
          onClick={() => setShowSamples(o => !o)} disabled={disabled}
        >
          <BookOpen className="size-4" /> Load Sample
        </Button>
      </div>

      {/* Random controls */}
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/30 bg-background/20 p-3">
        <div className="space-y-1.5">
          <Label className="text-sm text-foreground">Nodes: {nodeCount}</Label>
          <Slider value={[nodeCount]} onValueChange={(v) => setNodeCount(v[0])} min={3} max={12} step={1} disabled={disabled} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm text-foreground">Density: {density}%</Label>
          <Slider value={[density]} onValueChange={(v) => setDensity(v[0])} min={20} max={80} step={5} disabled={disabled} />
        </div>
        {showSourceNode && (
          <div className="col-span-2 space-y-1.5">
            <Label className="text-sm text-foreground">Source Node</Label>
            <input
              type="number" value={sourceNode} min={0} max={nodeCount - 1}
              onChange={(e) => onSourceNodeChange?.(parseInt(e.target.value) || 0)}
              disabled={disabled}
              className="w-full h-8 rounded-md border border-border/50 bg-input/20 px-3 text-sm focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}
      </div>

      {/* Samples */}
      <AnimatePresence initial={false}>
        {showSamples && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-2 rounded-lg border border-border/30 bg-background/20 p-3"
          >
            <Label className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/80">Sample Graphs</Label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_GRAPHS.map((sample) => (
                <Button
                  key={sample.label} type="button" variant="outline"
                  className="h-auto rounded-lg px-3 py-2 text-left border-border/50 bg-background/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30 flex flex-col items-start gap-0.5"
                  disabled={disabled}
                  onClick={() => handleLoadSample(sample)}
                >
                  <span className="text-[11px] font-bold">{sample.label}</span>
                  <span className="text-[9px] text-muted-foreground">{sample.description}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom input */}
      <AnimatePresence initial={false}>
        {showCustom && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-2 rounded-lg border border-border/30 bg-background/20 p-3"
          >
            <Label className="text-foreground text-xs font-bold">Enter edges (u,v,weight — one per line)</Label>
            <textarea
              value={edgesText}
              onChange={(e) => setEdgesText(e.target.value)}
              disabled={disabled}
              rows={6}
              placeholder="0,1,4&#10;1,2,6&#10;0,2,2"
              className="w-full rounded-md border border-border/50 bg-input/20 p-3 text-sm focus:ring-2 focus:ring-primary/40 font-mono text-xs"
            />
            <div className="rounded-md bg-primary/5 border border-primary/10 p-2">
              <p className="text-[10px] text-muted-foreground">
                <strong>Format:</strong> u,v,weight (one edge per line). Example: <code className="text-primary">0,1,4</code> means edge from node 0 to node 1 with weight 4.
              </p>
            </div>
            <Button type="button" size="sm" className="rounded-lg" onClick={handleCustomApply} disabled={disabled}>
              Load Dataset
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Graph preview */}
      <div className="rounded-lg border border-border/30 bg-background/20 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Graph Preview</p>
          <Badge variant="outline" className="border-border/50 bg-background/30 text-[11px] text-foreground/75">
            {preview.length > 0 ? `${nodeCount} nodes | ${preview.length} edges` : 'No data'}
          </Badge>
        </div>
        {preview.length === 0 ? (
          <p className="text-sm text-foreground/60">No graph generated yet.</p>
        ) : graphPreview ? (
          <div className="flex justify-center">
            <svg viewBox="0 0 200 160" className="w-full max-w-[280px] h-auto">
              {preview.map((edge, i) => {
                const p1 = graphPreview.positions[edge.u]
                const p2 = graphPreview.positions[edge.v]
                if (!p1 || !p2) return null
                const midX = (p1.x + p2.x) / 2
                const midY = (p1.y + p2.y) / 2
                return (
                  <g key={`e-${i}`}>
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="stroke-border/50 stroke-1" />
                    <text x={midX} y={midY - 4} className="fill-muted-foreground text-[7px]" textAnchor="middle">{edge.weight}</text>
                  </g>
                )
              })}
              {Array.from({ length: graphPreview.n }, (_, i) => {
                const p = graphPreview.positions[i]
                if (!p) return null
                return (
                  <g key={`n-${i}`}>
                    <circle cx={p.x} cy={p.y} r="10" className="fill-primary/20 stroke-primary stroke-1" />
                    <text x={p.x} y={p.y} className="fill-foreground text-[8px] font-bold" textAnchor="middle" dominantBaseline="central">{i}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
