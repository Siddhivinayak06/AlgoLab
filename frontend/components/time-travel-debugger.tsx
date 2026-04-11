'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { SortStep } from '@/lib/algorithms'

interface TimelineEntry {
  step: number
  timestamp: number
  data: SortStep
}

interface TimeTravelDebuggerProps {
  onFrameChange: (step: SortStep) => void
  isRecording: boolean
}

export interface TimeTravelDebuggerHandle {
  recordStep: (step: SortStep) => void
  clearTimeline: () => void
}

export const TimeTravelDebugger = React.forwardRef<TimeTravelDebuggerHandle, TimeTravelDebuggerProps>(
  ({ onFrameChange, isRecording }, ref) => {
    const [timeline, setTimeline] = useState<TimelineEntry[]>([])
    const [currentFrame, setCurrentFrame] = useState(0)
    const [isPlayingTimeline, setIsPlayingTimeline] = useState(false)
    const [playbackSpeed, setPlaybackSpeed] = useState(50)

    // Add step to timeline when recording
    const recordStep = useCallback(
      (step: SortStep) => {
        if (isRecording) {
          setTimeline((prev) => [
            ...prev,
            {
              step: prev.length,
              timestamp: Date.now(),
              data: step,
            },
          ])
        }
      },
      [isRecording]
    )

    const clearTimeline = useCallback(() => {
      setTimeline([])
      setCurrentFrame(0)
      setIsPlayingTimeline(false)
    }, [])

    // Expose recordStep through ref
    React.useImperativeHandle(ref, () => ({
      recordStep,
      clearTimeline,
    }), [recordStep, clearTimeline])

  React.useEffect(() => {
    if (isRecording) {
      clearTimeline()
    }
  }, [isRecording, clearTimeline])

  // Navigate to specific frame
  const goToFrame = useCallback(
    (frameIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(frameIndex, timeline.length - 1))
      setCurrentFrame(clampedIndex)
      if (timeline[clampedIndex]) {
        onFrameChange(timeline[clampedIndex].data)
      }
    },
    [timeline, onFrameChange]
  )

  // Next frame
  const nextFrame = useCallback(() => {
    if (currentFrame < timeline.length - 1) {
      goToFrame(currentFrame + 1)
    }
  }, [currentFrame, timeline.length, goToFrame])

  // Previous frame
  const previousFrame = useCallback(() => {
    if (currentFrame > 0) {
      goToFrame(currentFrame - 1)
    }
  }, [currentFrame, goToFrame])

  // Timeline playback
  React.useEffect(() => {
    if (!isPlayingTimeline || timeline.length === 0) return

    let frame = currentFrame
    const interval = setInterval(() => {
      if (frame < timeline.length - 1) {
        frame++
        goToFrame(frame)
      } else {
        setIsPlayingTimeline(false)
      }
    }, 101 - playbackSpeed)

    return () => clearInterval(interval)
  }, [isPlayingTimeline, timeline.length, playbackSpeed, goToFrame, currentFrame])

  const resetTimeline = useCallback(() => {
    clearTimeline()
  }, [clearTimeline])

  if (timeline.length === 0) {
    return null
  }

  return (
    <Card className="glass-card mt-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Time-Travel Debugger</h3>

      {/* Timeline Visualization */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-foreground text-sm">Frame: {currentFrame + 1} / {timeline.length}</Label>
          <span className="text-xs text-foreground/60">
            ({((currentFrame / Math.max(timeline.length - 1, 1)) * 100).toFixed(0)}%)
          </span>
        </div>

        {/* Timeline bar */}
        <div className="relative h-8 bg-input/30 rounded-lg overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-primary/50"
            initial={{ width: 0 }}
            animate={{ width: `${(currentFrame / Math.max(timeline.length - 1, 1)) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
          <input
            type="range"
            min="0"
            max={Math.max(timeline.length - 1, 0)}
            value={currentFrame}
            onChange={(e) => goToFrame(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Playback speed */}
      <div className="mb-4">
        <Label className="text-foreground text-sm mb-2">Playback Speed</Label>
        <Slider
          value={[playbackSpeed]}
          onValueChange={(e) => setPlaybackSpeed(e[0])}
          min={1}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Control buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
          className="bg-primary hover:bg-primary/90 text-foreground"
          disabled={timeline.length === 0}
        >
          {isPlayingTimeline ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play
            </>
          )}
        </Button>

        <Button
          onClick={previousFrame}
          variant="outline"
          className="border-border/50 text-foreground hover:bg-card/50"
          disabled={currentFrame === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={nextFrame}
          variant="outline"
          className="border-border/50 text-foreground hover:bg-card/50"
          disabled={currentFrame === timeline.length - 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>

        <Button
          onClick={resetTimeline}
          variant="outline"
          className="border-border/50 text-foreground hover:bg-card/50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Timeline statistics */}
      {timeline[currentFrame] && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-border/20"
        >
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-foreground/60">Comparisons</p>
              <p className="text-lg font-semibold text-primary">
                {timeline[currentFrame].data.comparisons}
              </p>
            </div>
            <div>
              <p className="text-foreground/60">Operations</p>
              <p className="text-lg font-semibold text-accent">
                {timeline[currentFrame].data.operations}
              </p>
            </div>
            <div>
              <p className="text-foreground/60">Array Length</p>
              <p className="text-lg font-semibold text-secondary">
                {timeline[currentFrame].data.array.length}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  )
  }
)
