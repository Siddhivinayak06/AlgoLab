'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  getExperiments,
  deleteExperiment,
  clearAllExperiments,
  type Experiment,
} from '@/lib/experiment-tracker'
import { Trash2, Download, RefreshCw, Clock } from 'lucide-react'

interface ExperimentHistoryProps {
  onSelectExperiment?: (exp: Experiment) => void
  showActions?: boolean
}

export function ExperimentHistory({ onSelectExperiment, showActions = true }: ExperimentHistoryProps) {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [sortBy, setSortBy] = useState<'newest' | 'fastest' | 'algorithm'>('newest')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void loadExperiments(sortBy)
  }, [sortBy])

  const loadExperiments = async (currentSort: 'newest' | 'fastest' | 'algorithm') => {
    try {
      setIsLoading(true)
      const data = await getExperiments({ sortBy: currentSort, limit: 100 })
      setExperiments(data)
    } catch (error) {
      toast.error('Failed to load experiment history')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteExperiment(id)
      await loadExperiments(sortBy)
      toast.success('Experiment deleted')
    } catch (error) {
      toast.error('Failed to delete experiment')
      console.error(error)
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('Clear all experiments? This cannot be undone.')) {
      try {
        await clearAllExperiments()
        await loadExperiments(sortBy)
        toast.success('All experiments cleared')
      } catch (error) {
        toast.error('Failed to clear experiments')
        console.error(error)
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="glass-card p-8 text-center">
        <p className="text-foreground/60">Loading experiments...</p>
      </Card>
    )
  }

  if (experiments.length === 0) {
    return (
      <Card className="glass-card p-8 text-center">
        <Clock className="w-12 h-12 mx-auto text-foreground/30 mb-3" />
        <p className="text-foreground/60">No experiments yet. Run an algorithm to get started!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-2">
          {(['newest', 'fastest', 'algorithm'] as const).map((sortOption) => (
            <Button
              key={sortOption}
              onClick={() => setSortBy(sortOption)}
              variant={sortBy === sortOption ? 'default' : 'outline'}
              size="sm"
              className={sortBy === sortOption ? 'bg-primary text-foreground' : ''}
            >
              {sortOption === 'newest' && 'Newest'}
              {sortOption === 'fastest' && 'Fastest'}
              {sortOption === 'algorithm' && 'Algorithm'}
            </Button>
          ))}
        </div>

        {showActions && (
          <div className="ml-auto flex gap-2">
            <Button
              onClick={() => void loadExperiments(sortBy)}
              variant="outline"
              size="sm"
              className="border-border/50 text-foreground hover:bg-card/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Experiments List */}
      <AnimatePresence>
        {experiments.map((exp, idx) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className="glass-card cursor-pointer hover:bg-card/50 transition-all"
              onClick={() => onSelectExperiment?.(exp)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-semibold">
                      {exp.algorithm}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {new Date(exp.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div>
                      <p className="text-foreground/60 text-xs">Array Size</p>
                      <p className="font-semibold text-foreground">{exp.arraySize}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60 text-xs">Time</p>
                      <p className="font-semibold text-primary">{exp.executionTime}ms</p>
                    </div>
                    <div>
                      <p className="text-foreground/60 text-xs">Comparisons</p>
                      <p className="font-semibold text-accent">{exp.comparisons}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60 text-xs">Operations</p>
                      <p className="font-semibold text-secondary">{exp.operations}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60 text-xs">Data Type</p>
                      <p className="font-semibold text-foreground capitalize">{exp.dataType}</p>
                    </div>
                  </div>
                </div>

                {showActions && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(exp.id)
                    }}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Statistics Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-4 rounded-lg text-sm"
      >
        <p className="text-foreground/60">
          Total Experiments: <span className="font-semibold text-foreground">{experiments.length}</span>
        </p>
      </motion.div>
    </div>
  )
}
