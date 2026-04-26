'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { DPStep } from '@/lib/dp-engine'
import { cn } from '@/lib/utils'

interface DPTableGridProps {
  step: DPStep | null
  algorithm?: string
}

function cellKey(r: number, c: number) {
  return `${r}-${c}`
}

/** Get pixel center of a cell element by data attribute */
function getCellCenter(container: HTMLElement, r: number, c: number): { x: number; y: number } | null {
  const el = container.querySelector(`[data-cell="${r}-${c}"]`) as HTMLElement | null
  if (!el) return null
  const cRect = container.getBoundingClientRect()
  const eRect = el.getBoundingClientRect()
  return {
    x: eRect.left - cRect.left + eRect.width / 2,
    y: eRect.top - cRect.top + eRect.height / 2,
  }
}

// ─── Character Display ──────────────────────────────────────────────────

function CharacterRow({
  label,
  chars,
  highlightIndex,
}: {
  label: string
  chars: string[]
  highlightIndex: number | null
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 w-12 text-right shrink-0">
        {label}
      </span>
      <div className="flex gap-0.5">
        {chars.map((ch, i) => (
          <motion.span
            key={i}
            animate={{
              scale: highlightIndex === i ? 1.25 : 1,
              y: highlightIndex === i ? -2 : 0,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={cn(
              'flex items-center justify-center size-7 rounded-md text-xs font-bold border transition-colors duration-200',
              highlightIndex === i
                ? 'bg-amber-400/30 border-amber-400/60 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                : 'bg-muted/15 border-border/30 text-foreground/70'
            )}
          >
            {ch}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

// ─── Arrow Overlay ──────────────────────────────────────────────────────

const DEP_COLORS = [
  'rgba(96,165,250,0.8)',   // blue
  'rgba(168,85,247,0.7)',   // purple
  'rgba(52,211,153,0.7)',   // green
]

function ArrowOverlay({
  containerRef,
  currentCell,
  dependencyCells,
}: {
  containerRef: React.RefObject<HTMLElement | null>
  currentCell: [number, number] | null
  dependencyCells: [number, number][]
}) {
  const [arrows, setArrows] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el || !currentCell || dependencyCells.length === 0) {
      setArrows([])
      return
    }

    const target = getCellCenter(el, currentCell[0], currentCell[1])
    if (!target) { setArrows([]); return }

    const newArrows = dependencyCells.map(([r, c], idx) => {
      const src = getCellCenter(el, r, c)
      if (!src) return null
      return {
        x1: src.x, y1: src.y,
        x2: target.x, y2: target.y,
        color: DEP_COLORS[idx % DEP_COLORS.length],
      }
    }).filter(Boolean) as typeof arrows

    setArrows(newArrows)
    setSize({ w: el.scrollWidth, h: el.scrollHeight })
  }, [containerRef, currentCell, dependencyCells])

  if (arrows.length === 0 || size.w === 0) return null

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={size.w}
      height={size.h}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {arrows.map((_, i) => (
          <marker
            key={i}
            id={`arrow-head-${i}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={arrows[i].color} />
          </marker>
        ))}
      </defs>
      {arrows.map((a, i) => (
        <motion.line
          key={i}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
          x1={a.x1} y1={a.y1}
          x2={a.x2} y2={a.y2}
          stroke={a.color}
          strokeWidth={2}
          strokeDasharray="4 2"
          markerEnd={`url(#arrow-head-${i})`}
        />
      ))}
    </svg>
  )
}

// ─── Main Grid ──────────────────────────────────────────────────────────

export function DPTableGrid({ step, algorithm }: DPTableGridProps) {
  const tableContainerRef = useRef<HTMLDivElement | null>(null)

  if (!step || step.table.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-3">
        <svg className="size-20 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
        </svg>
        <p className="text-muted-foreground text-sm">Configure inputs and start visualization</p>
      </div>
    )
  }

  const { table, currentCell, dependencyCells, completedCells, stepType, backtrackPath, charIndices } = step
  const rows = table.length
  const cols = table[0].length

  const completedSet = new Set(completedCells.map(([r, c]) => cellKey(r, c)))
  const depSet = new Set(dependencyCells.map(([r, c]) => cellKey(r, c)))
  const currentKey = currentCell ? cellKey(currentCell[0], currentCell[1]) : null
  const backtrackSet = new Set((backtrackPath ?? []).map(([r, c]) => cellKey(r, c)))
  const hasBacktrack = backtrackSet.size > 0

  const isLCS = algorithm === 'lcs'
  const fontSize = cols > 12 || rows > 12 ? 'text-[10px]' : cols > 8 || rows > 8 ? 'text-xs' : 'text-sm'
  const cellSize = cols > 12 || rows > 12 ? 'min-w-[30px] h-[30px]' : cols > 8 || rows > 8 ? 'min-w-[38px] h-[38px]' : 'min-w-[46px] h-[46px]'

  // Extract string characters for highlighting (LCS only)
  const strAChars = isLCS ? step.rowHeaders.slice(1) : []
  const strBChars = isLCS ? step.colHeaders.slice(1) : []
  const hlCharA = charIndices != null ? charIndices[0] : null
  const hlCharB = charIndices != null ? charIndices[1] : null

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Character Highlighting (LCS only) */}
      {isLCS && strAChars.length > 0 && (
        <div className="flex flex-col gap-2 px-2">
          <CharacterRow label="Str A" chars={strAChars} highlightIndex={stepType === 'compare' ? hlCharA : null} />
          <CharacterRow label="Str B" chars={strBChars} highlightIndex={stepType === 'compare' ? hlCharB : null} />
        </div>
      )}

      {/* DP Table with Arrow Overlay */}
      <div className="flex-1 overflow-auto flex items-start justify-center">
        <div className="inline-block relative" ref={tableContainerRef}>
          <ArrowOverlay
            containerRef={tableContainerRef}
            currentCell={stepType === 'compare' ? currentCell : null}
            dependencyCells={stepType === 'compare' ? dependencyCells : []}
          />

          <table className="border-collapse relative z-0">
            <thead>
              <tr>
                <th className={cn('p-1', fontSize)} />
                {step.colHeaders.map((h, ci) => (
                  <th key={ci} className={cn('p-1 font-semibold text-center', fontSize,
                    isLCS && hlCharB === ci - 1 && stepType === 'compare'
                      ? 'text-amber-400' : 'text-muted-foreground'
                  )}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, ri) => (
                <tr key={ri}>
                  <td className={cn('p-1 font-semibold text-right pr-2', fontSize,
                    isLCS && hlCharA === ri - 1 && stepType === 'compare'
                      ? 'text-amber-400' : 'text-muted-foreground'
                  )}>
                    {step.rowHeaders[ri] ?? ri}
                  </td>
                  {row.map((val, ci) => {
                    const key = cellKey(ri, ci)
                    const isCurrent = key === currentKey
                    const isDep = depSet.has(key)
                    const isCompleted = completedSet.has(key)
                    const isCacheHit = isCurrent && stepType === 'cache-hit'
                    const isWrite = isCurrent && stepType === 'write'
                    const isBacktrack = hasBacktrack && backtrackSet.has(key)
                    const isUninit = val === -1

                    // Dimming: when we have a current cell, dim everything that's not current/dep/write
                    const shouldDim = currentCell != null && !isCurrent && !isDep && !isWrite

                    let bgClass = 'bg-muted/20 border-border/30'
                    if (isBacktrack) {
                      bgClass = 'bg-emerald-500/35 border-emerald-400/70 ring-2 ring-emerald-400/30'
                    } else if (isCurrent && isWrite) {
                      bgClass = 'bg-cyan-500/30 border-cyan-400/60 ring-2 ring-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                    } else if (isCacheHit) {
                      bgClass = 'bg-purple-500/30 border-purple-400/60 ring-2 ring-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    } else if (isCurrent) {
                      bgClass = 'bg-amber-500/30 border-amber-400/60 ring-2 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    } else if (isDep) {
                      bgClass = 'bg-blue-500/25 border-blue-400/50 ring-1 ring-blue-400/30'
                    } else if (isCompleted) {
                      bgClass = 'bg-emerald-500/12 border-emerald-500/25'
                    }

                    return (
                      <td key={ci} className="p-0.5">
                        <motion.div
                          data-cell={key}
                          layout
                          initial={false}
                          animate={{
                            scale: isCurrent ? 1.12 : 1,
                            opacity: shouldDim ? 0.45 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={cn(
                            'flex items-center justify-center rounded-md border transition-colors duration-200',
                            cellSize, fontSize, bgClass,
                            isCurrent ? 'font-bold text-foreground z-20 relative' : isUninit ? 'text-muted-foreground/40' : 'text-foreground/80'
                          )}
                        >
                          {isUninit ? '–' : val}
                        </motion.div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] text-muted-foreground border-t border-border/20 pt-3">
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-amber-500/30 border border-amber-400/60 shadow-[0_0_6px_rgba(251,191,36,0.3)]" /> Current Cell</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-blue-500/25 border border-blue-400/50" /> Dependency</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-cyan-500/30 border border-cyan-400/60" /> Writing</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-emerald-500/12 border border-emerald-500/25" /> Completed</span>
        <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-purple-500/30 border border-purple-400/60" /> Cache Hit</span>
        {isLCS && (
          <span className="flex items-center gap-1.5"><span className="size-3 rounded bg-emerald-500/35 border border-emerald-400/70 ring-1 ring-emerald-400/30" /> Backtrack Path</span>
        )}
      </div>
    </div>
  )
}
