'use client'

import React, { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface AudioNode {
  value: number
  frequency: number
  isComparing?: boolean
}

export function SonicSorting() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [arraySize, setArraySize] = useState(20)
  const [algorithm, setAlgorithm] = useState('bubble')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(30)
  const [array, setArray] = useState<AudioNode[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      value: Math.random() * 100,
      frequency: 200 + i * 15,
    }))
  )

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playNote = useCallback(
    (frequency: number, duration: number = 0.1) => {
      if (!soundEnabled) return

      try {
        const ctx = initAudioContext()
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.frequency.value = frequency
        osc.type = 'sine'

        gain.gain.setValueAtTime((volume / 100) * 0.1, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

        osc.start(now)
        osc.stop(now + duration)
      } catch {
        // Audio context not available
      }
    },
    [soundEnabled, volume, initAudioContext]
  )

  const bubbleSortWithSound = useCallback(async () => {
    setIsPlaying(true)
    const arr = [...array]
    const n = arr.length

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Play frequencies
        playNote(arr[j].frequency, 0.05)
        playNote(arr[j + 1].frequency, 0.05)

        if (arr[j].value > arr[j + 1].value) {
          ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]

          // Swap sound
          playNote(arr[j].frequency + 50, 0.1)
        }

        setArray([...arr])
        await new Promise((resolve) => setTimeout(resolve, 30))
      }
    }

    setIsPlaying(false)
  }, [array, playNote])

  const quickSortWithSound = useCallback(
    async (start: number = 0, end: number = array.length - 1) => {
      if (start >= end) return

      let pivot = start
      playNote(array[pivot].frequency + 100, 0.2)

      for (let i = start + 1; i <= end; i++) {
        playNote(array[i].frequency, 0.05)

        if (array[i].value < array[start].value) {
          pivot++
          ;[array[i], array[pivot]] = [array[pivot], array[i]]
          setArray([...array])
          await new Promise((resolve) => setTimeout(resolve, 30))
        }
      }

      ;[array[start], array[pivot]] = [array[pivot], array[start]]
      setArray([...array])
      playNote(array[pivot].frequency, 0.1)

      await quickSortWithSound(start, pivot - 1)
      await quickSortWithSound(pivot + 1, end)
    },
    [array, playNote]
  )

  const handleSort = async () => {
    const newArray = [...array]
    setArray(newArray)

    if (algorithm === 'bubble') {
      await bubbleSortWithSound()
    } else if (algorithm === 'quick') {
      await quickSortWithSound()
    }
  }

  const handleReset = () => {
    setArray(
      Array.from({ length: arraySize }, (_, i) => ({
        value: Math.random() * 100,
        frequency: 200 + i * 15,
      }))
    )
    setIsPlaying(false)
  }

  const handleArraySizeChange = (size: number[]) => {
    setArraySize(size[0])
    setArray(
      Array.from({ length: size[0] }, (_, i) => ({
        value: Math.random() * 100,
        frequency: 200 + i * 15,
      }))
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="glass-card space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Sonic Sorting Controls</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground mb-2">Algorithm</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger className="bg-input/50 border-border/50 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                <SelectItem value="bubble">Bubble Sort</SelectItem>
                <SelectItem value="quick">Quick Sort</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-foreground mb-2">Array Size: {arraySize}</Label>
            <Slider
              value={[arraySize]}
              onValueChange={handleArraySizeChange}
              min={5}
              max={50}
              step={1}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              className="border-border/50 text-foreground hover:bg-card/50"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Sound On
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Sound Off
                </>
              )}
            </Button>

            <div className="flex-1">
              <Label className="text-xs text-foreground/60">Volume</Label>
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                min={0}
                max={100}
                step={1}
                disabled={!soundEnabled}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSort}
            disabled={isPlaying}
            className="bg-primary hover:bg-primary/90 text-foreground flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Sorting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Sonic Sort
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            disabled={isPlaying}
            variant="outline"
            className="border-border/50 text-foreground hover:bg-card/50"
          >
            Reset
          </Button>
        </div>
      </Card>

      {/* Visualization */}
      <Card className="glass-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Audio Visualization</h3>

        <div className="flex items-end justify-center gap-1 h-64 bg-input/30 rounded-lg p-4">
          {array.map((node, idx) => (
            <motion.div
              key={idx}
              className="rounded-t flex-1 bg-gradient-to-t from-primary to-accent"
              animate={{
                height: `${(node.value / 100) * 100}%`,
              }}
              transition={{ duration: 0.05 }}
            />
          ))}
        </div>

        <p className="text-sm text-foreground/60 mt-4">
          Each bar represents a frequency. Listen as the algorithm sorts them into ascending order.
        </p>
      </Card>

      {/* Info */}
      <Card className="glass-card">
        <h3 className="text-lg font-semibold text-foreground mb-3">How It Works</h3>
        <div className="space-y-2 text-sm text-foreground/70">
          <p>
            Sonic Sorting converts array values into musical frequencies. As the sorting algorithm
            runs, you hear the frequencies being compared and swapped.
          </p>
          <p>
            Lower frequencies (lower notes) represent smaller values, while higher frequencies
            (higher notes) represent larger values.
          </p>
          <p>
            This creates a unique musical composition where the melody becomes more organized as
            the sorting progresses!
          </p>
        </div>
      </Card>
    </div>
  )
}
