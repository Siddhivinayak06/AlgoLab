'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ComplexityInfo {
  algorithm: string
  worstCase: string
  averageCase: string
  bestCase: string
  spaceComplexity: string
  description: string
  color: string
}

const complexityMap: Record<string, ComplexityInfo> = {
  bubble: {
    algorithm: 'Bubble Sort',
    worstCase: 'O(n²)',
    averageCase: 'O(n²)',
    bestCase: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Simple comparison-based sorting. Best for nearly-sorted data.',
    color: 'text-red-400',
  },
  quick: {
    algorithm: 'Quick Sort',
    worstCase: 'O(n²)',
    averageCase: 'O(n log n)',
    bestCase: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Efficient divide-and-conquer algorithm with good cache locality.',
    color: 'text-blue-400',
  },
  merge: {
    algorithm: 'Merge Sort',
    worstCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    bestCase: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Stable sorting algorithm with consistent O(n log n) performance.',
    color: 'text-purple-400',
  },
}

interface ComplexityOverlayProps {
  algorithm: string
  arraySize: number
  comparisons: number
  operations: number
}

export function ComplexityOverlay({
  algorithm,
  arraySize,
  comparisons,
  operations,
}: ComplexityOverlayProps) {
  const complexity = complexityMap[algorithm] || complexityMap.bubble

  // Calculate theoretical vs actual complexity
  const theoreticalOps = useMemo(() => {
    const n = arraySize
    switch (algorithm) {
      case 'bubble':
        return (n * (n - 1)) / 2 // O(n²)
      case 'quick':
        return n * Math.log2(n) // O(n log n) - average case
      case 'merge':
        return n * Math.log2(n) // O(n log n)
      default:
        return 0
    }
  }, [algorithm, arraySize])

  const efficiency = useMemo(() => {
    if (theoreticalOps === 0) return 0
    return Math.round((theoreticalOps / operations) * 100)
  }, [theoreticalOps, operations])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Complexity Card */}
      <Card className="glass-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={`text-2xl font-bold ${complexity.color}`}>
              {complexity.algorithm}
            </h3>
            <p className="text-foreground/60 text-sm mt-1">{complexity.description}</p>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/50">
            Analyzing
          </Badge>
        </div>

        {/* Complexity Classes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass p-3 rounded-lg">
            <p className="text-foreground/60 text-xs mb-1">Worst Case</p>
            <p className={`text-lg font-semibold font-mono ${complexity.color}`}>
              {complexity.worstCase}
            </p>
          </div>
          <div className="glass p-3 rounded-lg">
            <p className="text-foreground/60 text-xs mb-1">Average Case</p>
            <p className={`text-lg font-semibold font-mono ${complexity.color}`}>
              {complexity.averageCase}
            </p>
          </div>
          <div className="glass p-3 rounded-lg">
            <p className="text-foreground/60 text-xs mb-1">Best Case</p>
            <p className={`text-lg font-semibold font-mono ${complexity.color}`}>
              {complexity.bestCase}
            </p>
          </div>
          <div className="glass p-3 rounded-lg">
            <p className="text-foreground/60 text-xs mb-1">Space</p>
            <p className={`text-lg font-semibold font-mono ${complexity.color}`}>
              {complexity.spaceComplexity}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="pt-4 border-t border-border/20">
          <h4 className="text-sm font-semibold text-foreground mb-3">Live Analysis</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-foreground/60 text-xs mb-1">Array Size</p>
              <p className="text-2xl font-bold text-foreground">{arraySize}</p>
              <p className="text-xs text-foreground/50 mt-1">elements</p>
            </div>
            <div>
              <p className="text-foreground/60 text-xs mb-1">Comparisons</p>
              <p className="text-2xl font-bold text-primary">{comparisons}</p>
              <p className="text-xs text-foreground/50 mt-1">vs {Math.round(theoreticalOps)}</p>
            </div>
            <div>
              <p className="text-foreground/60 text-xs mb-1">Efficiency</p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-secondary"
              >
                {efficiency}%
              </motion.div>
              <p className="text-xs text-foreground/50 mt-1">of theoretical</p>
            </div>
          </div>
        </div>

        {/* Complexity Curve Indicator */}
        <div className="mt-4 p-3 bg-input/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <p className="text-xs text-foreground/60">
              {algorithm === 'bubble'
                ? 'Quadratic growth - Time increases exponentially with input'
                : 'Logarithmic growth - Time increases linearly with input'}
            </p>
          </div>
          <div className="relative h-16 bg-input/50 rounded flex items-end gap-1 p-2">
            {[...Array(8)].map((_, i) => {
              const ratio = (i + 1) / 8
              let height
              if (algorithm === 'bubble') {
                height = Math.pow(ratio, 2) * 100
              } else {
                height = ratio * Math.log2(8) * 12.5
              }
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex-1 rounded-t bg-gradient-to-t from-primary to-accent`}
                />
              )
            })}
          </div>
        </div>
      </Card>

      {/* Educational Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass p-3 rounded-lg text-sm text-foreground/60"
      >
        <p className="font-semibold text-foreground mb-1">Big-O Notation</p>
        <p>
          Measures how an algorithm&apos;s runtime grows with input size. Lower complexity is better
          for larger datasets.
        </p>
      </motion.div>
    </motion.div>
  )
}
