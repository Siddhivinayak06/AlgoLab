'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  binarySearch,
  generateSortedArray,
  type SortStep,
} from '@/lib/algorithms'
import { Play, RotateCcw } from 'lucide-react'

export function BinarySearchVisualizer() {
  const [arraySize, setArraySize] = useState(50)
  const [target, setTarget] = useState(50)
  const [array, setArray] = useState(() => generateSortedArray(arraySize))
  const [isRunning, setIsRunning] = useState(false)
  const [comparing, setComparing] = useState<number[]>([])
  const [foundIndex, setFoundIndex] = useState<number | null>(null)
  const [speed, setSpeed] = useState(50)
  const [stats, setStats] = useState({
    comparisons: 0,
    steps: 0,
    found: false,
  })
  const startTimeRef = useRef<number | null>(null)

  const reset = useCallback(() => {
    const newArray = generateSortedArray(arraySize)
    setArray(newArray)
    setComparing([])
    setFoundIndex(null)
    setStats({ comparisons: 0, steps: 0, found: false })
    setIsRunning(false)
  }, [arraySize])

  const handleSearchStep = useCallback((step: SortStep) => {
    setComparing(step.comparing)
    setStats({
      comparisons: step.comparisons,
      steps: Math.ceil(Math.log2(arraySize)),
      found: false,
    })
  }, [arraySize])

  const runSearch = useCallback(async () => {
    if (isRunning) return

    setIsRunning(true)
    startTimeRef.current = Date.now()
    const arrayCopy = [...array]

    try {
      const result = await binarySearch(
        arrayCopy,
        target,
        handleSearchStep,
        speed
      )

      if (result.found) {
        setFoundIndex(result.index)
        setStats({
          comparisons: result.comparisons,
          steps: result.comparisons,
          found: true,
        })
      } else {
        setStats({
          comparisons: result.comparisons,
          steps: result.comparisons,
          found: false,
        })
      }
    } finally {
      setIsRunning(false)
      setComparing([])
    }
  }, [array, target, speed, handleSearchStep, isRunning])

  const maxValue = Math.max(...array)

  return (
    <div className="space-y-6">
      {/* Controls Card */}
      <Card className="glass-card">
        <h2 className="text-2xl font-bold text-foreground mb-6">Controls</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Value */}
          <div className="space-y-2">
            <Label className="text-foreground">Target Value</Label>
            <Input
              type="number"
              value={target}
              onChange={(e) => setTarget(Math.min(100, Math.max(1, Number(e.target.value))))}
              disabled={isRunning}
              className="bg-input/50 border-border/50 text-foreground"
              min={1}
              max={100}
            />
          </div>

          {/* Array Size */}
          <div className="space-y-2">
            <Label className="text-foreground">Array Size: {arraySize}</Label>
            <Slider
              value={[arraySize]}
              onValueChange={(e) => {
                setArraySize(e[0])
                setArray(generateSortedArray(e[0]))
                reset()
              }}
              min={10}
              max={500}
              step={10}
              disabled={isRunning}
              className="cursor-pointer"
            />
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <Label className="text-foreground">Speed: {speed}</Label>
            <Slider
              value={[speed]}
              onValueChange={(e) => setSpeed(e[0])}
              min={1}
              max={100}
              step={1}
              disabled={isRunning}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 flex-wrap">
          <Button
            onClick={runSearch}
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90 text-foreground"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Searching...' : 'Search'}
          </Button>
          <Button
            onClick={reset}
            disabled={isRunning}
            variant="outline"
            className="border-border/50 text-foreground hover:bg-card/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card text-center">
          <p className="text-foreground/60 text-sm">Comparisons</p>
          <p className="text-3xl font-bold text-primary">{stats.comparisons}</p>
        </Card>
        <Card className="glass-card text-center">
          <p className="text-foreground/60 text-sm">Search Steps</p>
          <p className="text-3xl font-bold text-accent">{stats.steps}</p>
        </Card>
        <Card className="glass-card text-center">
          <p className="text-foreground/60 text-sm">Status</p>
          <p className={`text-3xl font-bold ${stats.found ? 'text-green-400' : 'text-orange-400'}`}>
            {stats.found ? 'Found!' : 'Not Found'}
          </p>
        </Card>
      </div>

      {/* Visualization */}
      <Card className="glass-card">
        <h2 className="text-2xl font-bold text-foreground mb-6">Array Visualization</h2>
        <div className="space-y-4">
          <div className="flex items-end justify-center gap-0.5 h-64 bg-input/30 rounded-lg p-4">
            {array.map((value, idx) => {
              const isComparing = comparing.includes(idx)
              const isFound = foundIndex === idx

              return (
                <motion.div
                  key={idx}
                  className="rounded-t cursor-pointer"
                  style={{
                    flex: '1',
                  }}
                  animate={{
                    height: `${(value / maxValue) * 100}%`,
                    backgroundColor: isFound
                      ? 'rgb(34, 197, 94)' // green for found
                      : isComparing
                        ? 'rgb(248, 113, 113)' // red for comparing
                        : 'rgb(59, 130, 246)', // blue for default
                  }}
                  transition={{
                    duration: 0.1,
                    ease: 'easeInOut',
                  }}
                  whileHover={{
                    scaleY: 1.05,
                    filter: 'brightness(1.2)',
                  }}
                />
              )
            })}
          </div>

          {/* Target Indicator */}
          <div className="text-center p-4 bg-input/30 rounded-lg">
            <p className="text-foreground/60 text-sm">Searching for: </p>
            <p className="text-2xl font-bold text-primary">{target}</p>
          </div>

          {/* Status Indicator */}
          {stats.found && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-center"
            >
              <p className="text-green-400 font-semibold">✓ Value found at index {foundIndex}!</p>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}
