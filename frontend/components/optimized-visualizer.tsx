'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'

interface OptimizedVisualizerProps {
  array: number[]
  comparing: number[]
  sortedIndices: number[]
  width?: number
  height?: number
}

export function OptimizedVisualizer({
  array,
  comparing,
  sortedIndices,
  width = 800,
  height = 300,
}: OptimizedVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pixelRatio, setPixelRatio] = useState(1)

  // Set pixel ratio for high DPI screens
  useEffect(() => {
    setPixelRatio(window.devicePixelRatio || 1)
  }, [])

  // Use requestAnimationFrame for optimal performance
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas resolution
    canvas.width = width * pixelRatio
    canvas.height = height * pixelRatio
    ctx.scale(pixelRatio, pixelRatio)

    const maxValue = Math.max(...array, 1)
    const barWidth = width / array.length
    const barHeight = height

    // Clear canvas
    ctx.fillStyle = 'rgba(15, 12, 63, 0.1)'
    ctx.fillRect(0, 0, width, height)

    // Draw bars
    array.forEach((value, idx) => {
      const isSorted = sortedIndices.includes(idx)
      const isComparing = comparing.includes(idx)

      // Set color
      if (isSorted) {
        ctx.fillStyle = 'rgb(168, 85, 247)' // purple
      } else if (isComparing) {
        ctx.fillStyle = 'rgb(248, 113, 113)' // red
      } else {
        ctx.fillStyle = 'rgb(59, 130, 246)' // blue
      }

      const barHeight = (value / maxValue) * height
      const x = idx * barWidth
      const y = height - barHeight

      // Rounded top
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })
  }, [array, comparing, sortedIndices, width, height, pixelRatio])

  return (
    <Card className="glass-card">
      <h2 className="text-2xl font-bold text-foreground mb-4">Optimized Visualization</h2>
      <div className="bg-input/30 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            display: 'block',
          }}
        />
      </div>
      <p className="text-xs text-foreground/60 mt-2">
        Canvas rendering for optimal performance with large arrays (200+ elements)
      </p>
    </Card>
  )
}
