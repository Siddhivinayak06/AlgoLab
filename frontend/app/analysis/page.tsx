'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  bubbleSort,
  quickSort,
  mergeSort,
  generateRandomArray,
  type SortStep,
} from '@/lib/algorithms'
import { Play, BarChart3 } from 'lucide-react'

interface AnalysisData {
  size: number
  bubbleTime: number
  quickTime: number
  mergeTime: number
  bubbleOps: number
  quickOps: number
  mergeOps: number
}

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    setProgress(0)
    const results: AnalysisData[] = []
    const sizes = [10, 50, 100, 200, 500]

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i]
      const analysisData: AnalysisData = {
        size,
        bubbleTime: 0,
        quickTime: 0,
        mergeTime: 0,
        bubbleOps: 0,
        quickOps: 0,
        mergeOps: 0,
      }

      // Test Bubble Sort
      const array1 = generateRandomArray(size)
      let startTime = performance.now()
      let ops = 0
      await bubbleSort(
        array1,
        (step: SortStep) => {
          ops = step.operations
        },
        100
      )
      analysisData.bubbleTime = Math.round(performance.now() - startTime)
      analysisData.bubbleOps = ops

      // Test Quick Sort
      const array2 = generateRandomArray(size)
      startTime = performance.now()
      ops = 0
      await quickSort(
        array2,
        (step: SortStep) => {
          ops = step.operations
        },
        100
      )
      analysisData.quickTime = Math.round(performance.now() - startTime)
      analysisData.quickOps = ops

      // Test Merge Sort
      const array3 = generateRandomArray(size)
      startTime = performance.now()
      ops = 0
      await mergeSort(
        array3,
        (step: SortStep) => {
          ops = step.operations
        },
        100
      )
      analysisData.mergeTime = Math.round(performance.now() - startTime)
      analysisData.mergeOps = ops

      results.push(analysisData)
      setProgress(Math.round(((i + 1) / sizes.length) * 100))
      setData([...results])
    }

    setIsAnalyzing(false)
  }, [])

  return (
    <WorkspaceShell
      title="Performance Analysis"
      description="Generate benchmarks across input sizes to study execution-time and operation growth."
    >
      <div className="space-y-8">
        {/* Control Card */}
        <Card className="glass-card mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Analysis Control</h2>
          <p className="text-foreground/60 mb-6">
            Run a comprehensive performance analysis on all three sorting algorithms with array sizes from 10 to 500 elements.
          </p>
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/90 text-foreground"
          >
            <Play className="w-4 h-4 mr-2" />
            {isAnalyzing ? `Running... ${progress}%` : 'Start Analysis'}
          </Button>
        </Card>

        {/* Complexity Reference */}
        <Card className="glass-card mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Complexity Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-lg"
            >
              <p className="font-semibold text-accent">Bubble Sort</p>
              <p className="text-foreground/60 text-sm mt-2">
                <span className="font-mono">O(n²)</span> - Quadratic
              </p>
              <p className="text-foreground/60 text-xs mt-1">Worst/Average Case</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-4 rounded-lg"
            >
              <p className="font-semibold text-primary">Quick Sort</p>
              <p className="text-foreground/60 text-sm mt-2">
                <span className="font-mono">O(n log n)</span> - Linearithmic
              </p>
              <p className="text-foreground/60 text-xs mt-1">Average Case</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-4 rounded-lg"
            >
              <p className="font-semibold text-secondary">Merge Sort</p>
              <p className="text-foreground/60 text-sm mt-2">
                <span className="font-mono">O(n log n)</span> - Linearithmic
              </p>
              <p className="text-foreground/60 text-xs mt-1">All Cases</p>
            </motion.div>
          </div>
        </Card>

        {/* Charts */}
        {data.length > 0 && (
          <>
            {/* Execution Time Chart */}
            <Card className="glass-card mb-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Execution Time Comparison (ms)
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="size" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 12, 63, 0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'rgb(248, 248, 248)' }}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                  <Line
                    type="monotone"
                    dataKey="bubbleTime"
                    stroke="rgb(248, 113, 113)"
                    name="Bubble Sort"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="quickTime"
                    stroke="rgb(59, 130, 246)"
                    name="Quick Sort"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="mergeTime"
                    stroke="rgb(168, 85, 247)"
                    name="Merge Sort"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Operations Chart */}
            <Card className="glass-card mb-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Operations Count Comparison
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="size" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 12, 63, 0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'rgb(248, 248, 248)' }}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
                  <Line
                    type="monotone"
                    dataKey="bubbleOps"
                    stroke="rgb(248, 113, 113)"
                    name="Bubble Sort"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="quickOps"
                    stroke="rgb(59, 130, 246)"
                    name="Quick Sort"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="mergeOps"
                    stroke="rgb(168, 85, 247)"
                    name="Merge Sort"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Results Table */}
            <Card className="glass-card">
              <h2 className="text-xl font-bold text-foreground mb-4">Detailed Results</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 px-4 text-foreground">Array Size</th>
                      <th className="text-left py-3 px-4 text-accent">Bubble Time (ms)</th>
                      <th className="text-left py-3 px-4 text-primary">Quick Time (ms)</th>
                      <th className="text-left py-3 px-4 text-secondary">Merge Time (ms)</th>
                      <th className="text-left py-3 px-4 text-foreground/60">Bubble Ops</th>
                      <th className="text-left py-3 px-4 text-foreground/60">Quick Ops</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-border/10 hover:bg-card/30"
                      >
                        <td className="py-3 px-4 font-mono text-foreground">{row.size}</td>
                        <td className="py-3 px-4 font-mono text-accent">{row.bubbleTime}</td>
                        <td className="py-3 px-4 font-mono text-primary">{row.quickTime}</td>
                        <td className="py-3 px-4 font-mono text-secondary">{row.mergeTime}</td>
                        <td className="py-3 px-4 font-mono text-foreground/60">{row.bubbleOps}</td>
                        <td className="py-3 px-4 font-mono text-foreground/60">{row.quickOps}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Empty State */}
        {data.length === 0 && !isAnalyzing && (
          <Card className="glass-card p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-foreground/30 mb-4" />
            <p className="text-foreground/60">
              Click the button above to run a comprehensive performance analysis
            </p>
          </Card>
        )}
      </div>
    </WorkspaceShell>
  )
}
