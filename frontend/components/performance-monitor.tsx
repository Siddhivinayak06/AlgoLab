'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface PerformanceStats {
  fps: number
  memoryUsed: number
  renderTime: number
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    memoryUsed: 0,
    renderTime: 0,
  })

  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFrame = () => {
      frameCount++
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime

      if (deltaTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / deltaTime)
        const memoryUsed = (performance as any).memory?.usedJSHeapSize
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
          : 0

        setStats({
          fps,
          memoryUsed,
          renderTime: deltaTime / frameCount,
        })

        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measureFrame)
    }

    animationId = requestAnimationFrame(measureFrame)

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-3 gap-2"
    >
      <Card className="glass-card p-3">
        <p className="text-xs text-foreground/60">FPS</p>
        <p className="text-lg font-bold text-primary">{stats.fps}</p>
      </Card>
      <Card className="glass-card p-3">
        <p className="text-xs text-foreground/60">Memory</p>
        <p className="text-lg font-bold text-accent">{stats.memoryUsed}MB</p>
      </Card>
      <Card className="glass-card p-3">
        <p className="text-xs text-foreground/60">Frame Time</p>
        <p className="text-lg font-bold text-secondary">{stats.renderTime.toFixed(2)}ms</p>
      </Card>
    </motion.div>
  )
}
