'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ALGORITHM_PSEUDOCODE } from '@/lib/pseudocode'

interface PseudocodePanelProps {
  algorithm: string
  activeLine?: number
}

export function PseudocodePanel({ algorithm, activeLine }: PseudocodePanelProps) {
  const code = ALGORITHM_PSEUDOCODE[algorithm] || []

  return (
    <Card className="glass-card p-0 overflow-hidden flex flex-col h-full border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <div className="bg-primary/10 border-b border-primary/20 px-5 py-3 flex items-center gap-2">
        <Code2 className="size-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Live Execution</h2>
      </div>
      <div className="p-4 bg-background/50 font-mono text-xs leading-relaxed overflow-x-auto flex-1">
        {code.map((line, index) => {
          const isHighlight = activeLine === index
          return (
            <div
              key={index}
              className={cn(
                'px-2 py-1 rounded whitespace-pre transition-colors',
                isHighlight ? 'bg-primary/20 text-primary font-bold border-l-2 border-primary' : 'text-foreground/70 border-l-2 border-transparent'
              )}
            >
              {line}
            </div>
          )
        })}
        {code.length === 0 && (
          <div className="text-muted-foreground italic px-2">
            Pseudocode not available for this algorithm.
          </div>
        )}
      </div>
    </Card>
  )
}
