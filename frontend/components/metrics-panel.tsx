'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface MetricsPanelProps {
  comparisons: number
  operations: number
  time: number
  swaps?: number
  title?: string
}

export function MetricsPanel({
  comparisons,
  operations,
  time,
  swaps,
  title = 'Metrics',
}: MetricsPanelProps) {
  const metrics = [
    { label: 'Comparisons', value: comparisons, color: 'text-primary' },
    { label: 'Operations', value: operations, color: 'text-accent' },
    { label: 'Time (ms)', value: time, color: 'text-secondary' },
  ]

  if (swaps !== undefined) {
    metrics.push({ label: 'Swaps', value: swaps, color: 'text-orange-400' })
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass-card text-center p-4">
              <p className="text-foreground/60 text-xs md:text-sm font-medium">
                {metric.label}
              </p>
              <p className={`text-2xl md:text-3xl font-bold ${metric.color} mt-2`}>
                {metric.value.toLocaleString()}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
