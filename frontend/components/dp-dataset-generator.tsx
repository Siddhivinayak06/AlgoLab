'use client'

import React, { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  BookOpen,
  PencilLine,
  Shuffle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type DPDatasetType = 'lcs' | 'knapsack'

export interface LCSDataset {
  type: 'lcs'
  string1: string
  string2: string
}

export interface KnapsackDataset {
  type: 'knapsack'
  weights: number[]
  values: number[]
  capacity: number
}

export type DPDataset = LCSDataset | KnapsackDataset

export interface DPDatasetMeta {
  source: 'custom' | 'sample'
  datasetType: DPDatasetType
}

interface DPDatasetGeneratorProps {
  onDatasetReady: (dataset: DPDataset, meta: DPDatasetMeta) => void
  disabled?: boolean
  className?: string
  /** Which DP type is currently selected */
  activeType: DPDatasetType
}

const LCS_SAMPLES: Array<{ label: string; s1: string; s2: string }> = [
  { label: 'Classic', s1: 'ABCBDAB', s2: 'BDCAB' },
  { label: 'DNA', s1: 'AGGTAB', s2: 'GXTXAYB' },
  { label: 'Short', s1: 'ABC', s2: 'AC' },
  { label: 'Long', s1: 'AABCXYZEFG', s2: 'BCYZWEFGHK' },
]

const KNAPSACK_SAMPLES: Array<{ label: string; weights: number[]; values: number[]; capacity: number }> = [
  { label: 'Classic', weights: [2, 3, 4, 5], values: [3, 4, 5, 6], capacity: 5 },
  { label: 'Small', weights: [1, 2, 3], values: [6, 10, 12], capacity: 5 },
  { label: 'Medium', weights: [2, 3, 4, 5, 9], values: [3, 4, 5, 8, 10], capacity: 20 },
  { label: 'Large', weights: [10, 20, 30, 40, 50], values: [60, 100, 120, 160, 200], capacity: 100 },
]

function generateRandomLCS(): LCSDataset {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const len1 = 5 + Math.floor(Math.random() * 6) // 5–10
  const len2 = 5 + Math.floor(Math.random() * 6)
  const randomStr = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * 8)]).join('')
  return { type: 'lcs', string1: randomStr(len1), string2: randomStr(len2) }
}

function generateRandomKnapsack(): KnapsackDataset {
  const count = 3 + Math.floor(Math.random() * 4) // 3–6 items
  const weights = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 10))
  const values = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 20))
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  const capacity = Math.floor(totalWeight * 0.5) + 1
  return { type: 'knapsack', weights, values, capacity }
}

export function DPDatasetGenerator({
  onDatasetReady,
  disabled = false,
  className,
  activeType,
}: DPDatasetGeneratorProps) {
  // LCS state
  const [lcsStr1, setLcsStr1] = useState('ABCBDAB')
  const [lcsStr2, setLcsStr2] = useState('BDCAB')

  // Knapsack state
  const [weightsInput, setWeightsInput] = useState('2, 3, 4, 5')
  const [valuesInput, setValuesInput] = useState('3, 4, 5, 6')
  const [capacityInput, setCapacityInput] = useState(5)

  const [showSamples, setShowSamples] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRandomGenerate = useCallback(() => {
    setErrorMessage(null)
    setShowSamples(false)
    if (activeType === 'lcs') {
      const data = generateRandomLCS()
      setLcsStr1(data.string1)
      setLcsStr2(data.string2)
      onDatasetReady(data, { source: 'custom', datasetType: 'lcs' })
    } else {
      const data = generateRandomKnapsack()
      setWeightsInput(data.weights.join(', '))
      setValuesInput(data.values.join(', '))
      setCapacityInput(data.capacity)
      onDatasetReady(data, { source: 'custom', datasetType: 'knapsack' })
    }
  }, [activeType, onDatasetReady])

  const handleApplyCustom = useCallback(() => {
    setErrorMessage(null)
    if (activeType === 'lcs') {
      if (!lcsStr1.trim() || !lcsStr2.trim()) {
        setErrorMessage('Both strings are required.')
        return
      }
      if (lcsStr1.length > 20 || lcsStr2.length > 20) {
        setErrorMessage('Max string length is 20 characters for visualization.')
        return
      }
      onDatasetReady(
        { type: 'lcs', string1: lcsStr1.trim().toUpperCase(), string2: lcsStr2.trim().toUpperCase() },
        { source: 'custom', datasetType: 'lcs' }
      )
    } else {
      const weights = weightsInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      const values = valuesInput.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
      if (weights.length === 0 || values.length === 0) {
        setErrorMessage('Weights and values are required.')
        return
      }
      if (weights.length !== values.length) {
        setErrorMessage('Weights and values must have the same number of items.')
        return
      }
      if (capacityInput <= 0) {
        setErrorMessage('Capacity must be a positive number.')
        return
      }
      onDatasetReady(
        { type: 'knapsack', weights, values, capacity: capacityInput },
        { source: 'custom', datasetType: 'knapsack' }
      )
    }
  }, [activeType, lcsStr1, lcsStr2, weightsInput, valuesInput, capacityInput, onDatasetReady])

  const handleLoadLCSSample = useCallback((sample: typeof LCS_SAMPLES[0]) => {
    setLcsStr1(sample.s1)
    setLcsStr2(sample.s2)
    setErrorMessage(null)
    setShowSamples(false)
    onDatasetReady(
      { type: 'lcs', string1: sample.s1, string2: sample.s2 },
      { source: 'sample', datasetType: 'lcs' }
    )
  }, [onDatasetReady])

  const handleLoadKnapsackSample = useCallback((sample: typeof KNAPSACK_SAMPLES[0]) => {
    setWeightsInput(sample.weights.join(', '))
    setValuesInput(sample.values.join(', '))
    setCapacityInput(sample.capacity)
    setErrorMessage(null)
    setShowSamples(false)
    onDatasetReady(
      { type: 'knapsack', weights: sample.weights, values: sample.values, capacity: sample.capacity },
      { source: 'sample', datasetType: 'knapsack' }
    )
  }, [onDatasetReady])

  return (
    <Card className={cn('glass-card space-y-3 p-4', className)}>
      <h2 className="text-base font-semibold text-foreground">DP Dataset</h2>

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
          onClick={handleApplyCustom} disabled={disabled}
        >
          <PencilLine className="size-4" /> Apply Input
        </Button>
        <Button
          type="button" size="sm" variant="outline"
          className="h-9 rounded-lg border-border/50 bg-background/20 px-2 text-[11px] [&_svg]:size-3.5"
          onClick={() => setShowSamples(o => !o)} disabled={disabled}
        >
          <BookOpen className="size-4" /> Load Sample
        </Button>
      </div>

      {/* Samples */}
      <AnimatePresence initial={false}>
        {showSamples && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="space-y-2 rounded-lg border border-border/30 bg-background/20 p-3"
          >
            <Label className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/80">
              {activeType === 'lcs' ? 'LCS Samples' : 'Knapsack Samples'}
            </Label>
            <div className="flex flex-wrap gap-2">
              {activeType === 'lcs' ? (
                LCS_SAMPLES.map((sample) => (
                  <Button
                    key={sample.label} type="button" variant="outline"
                    className="h-auto rounded-lg px-3 py-2 text-left border-border/50 bg-background/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30 flex flex-col items-start gap-0.5"
                    disabled={disabled} onClick={() => handleLoadLCSSample(sample)}
                  >
                    <span className="text-[11px] font-bold">{sample.label}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{sample.s1} / {sample.s2}</span>
                  </Button>
                ))
              ) : (
                KNAPSACK_SAMPLES.map((sample) => (
                  <Button
                    key={sample.label} type="button" variant="outline"
                    className="h-auto rounded-lg px-3 py-2 text-left border-border/50 bg-background/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30 flex flex-col items-start gap-0.5"
                    disabled={disabled} onClick={() => handleLoadKnapsackSample(sample)}
                  >
                    <span className="text-[11px] font-bold">{sample.label}</span>
                    <span className="text-[9px] text-muted-foreground">Cap: {sample.capacity} | {sample.weights.length} items</span>
                  </Button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input fields based on active type */}
      {activeType === 'lcs' ? (
        <div className="space-y-3 rounded-lg border border-border/30 bg-background/20 p-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">String 1</Label>
            <Input
              value={lcsStr1} onChange={(e) => setLcsStr1(e.target.value)}
              disabled={disabled} className="bg-input/40 font-mono text-sm"
              placeholder="e.g. ABCBDAB" maxLength={20}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">String 2</Label>
            <Input
              value={lcsStr2} onChange={(e) => setLcsStr2(e.target.value)}
              disabled={disabled} className="bg-input/40 font-mono text-sm"
              placeholder="e.g. BDCAB" maxLength={20}
            />
          </div>
          <div className="rounded-md bg-primary/5 border border-primary/10 p-2">
            <p className="text-[10px] text-muted-foreground">
              <strong>LCS:</strong> Enter two uppercase strings. The visualizer will find the longest common subsequence.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border border-border/30 bg-background/20 p-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Weights (comma separated)</Label>
            <Input
              value={weightsInput} onChange={(e) => setWeightsInput(e.target.value)}
              disabled={disabled} className="bg-input/40 font-mono text-sm"
              placeholder="e.g. 2, 3, 4, 5"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Values (comma separated)</Label>
            <Input
              value={valuesInput} onChange={(e) => setValuesInput(e.target.value)}
              disabled={disabled} className="bg-input/40 font-mono text-sm"
              placeholder="e.g. 3, 4, 5, 6"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Capacity</Label>
            <Input
              type="number" value={capacityInput}
              onChange={(e) => setCapacityInput(parseInt(e.target.value) || 0)}
              disabled={disabled} className="bg-input/40 font-mono text-sm"
              placeholder="e.g. 5"
            />
          </div>
          <div className="rounded-md bg-primary/5 border border-primary/10 p-2">
            <p className="text-[10px] text-muted-foreground">
              <strong>Knapsack:</strong> Weights and values must have the same number of items. Capacity is the max weight.
            </p>
          </div>
        </div>
      )}

      {/* Preview badges */}
      <div className="rounded-lg border border-border/30 bg-background/20 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Dataset Preview</p>
        {activeType === 'lcs' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">S1</Badge>
              <span className="font-mono text-sm text-foreground/80 tracking-widest">{lcsStr1 || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500">S2</Badge>
              <span className="font-mono text-sm text-foreground/80 tracking-widest">{lcsStr2 || '—'}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary shrink-0">Weights</Badge>
              <span className="font-mono text-xs text-foreground/80">{weightsInput || '—'}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-500 shrink-0">Values</Badge>
              <span className="font-mono text-xs text-foreground/80">{valuesInput || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-500 shrink-0">Capacity</Badge>
              <span className="font-mono text-xs text-foreground/80">{capacityInput}</span>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </Card>
  )
}
