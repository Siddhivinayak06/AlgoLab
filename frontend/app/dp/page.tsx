'use client'

import React, { useState } from 'react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { DPVisualizer } from '@/components/dp-visualizer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown, HelpCircle } from 'lucide-react'

export default function DPPage() {
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <WorkspaceShell
      title="Dynamic Programming Visualizer"
      description="Visualize DP table construction step-by-step for classic algorithms like LCS and Knapsack."
      headerAction={(
        <Button
          variant="ghost"
          className="text-muted-foreground text-xs hover:text-primary transition-colors"
          onClick={() => setIsGuideOpen((previous) => !previous)}
        >
          <HelpCircle className="mr-2 size-3.5" />
          DP Guide
          <ChevronDown className={cn('ml-1.5 size-3.5 transition-transform', isGuideOpen && 'rotate-180')} />
        </Button>
      )}
      rightPanel={(
        <section className="rounded-xl border border-border/30 bg-background/35 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            DP Tips
          </h3>
          <ul className="mt-2 space-y-1.5 text-xs text-foreground/90">
            <li>1. Configure inputs in the Dataset tab.</li>
            <li>2. Choose between LCS, Knapsack Bottom-Up, or Top-Down.</li>
            <li>3. Use Pause + Step Forward to inspect each cell computation.</li>
            <li>4. Watch how the DP table fills row by row.</li>
          </ul>

          <div className="mt-3 rounded-lg border border-border/30 bg-background/40 p-2.5 text-xs text-foreground/80">
            <p className="font-semibold text-foreground">Pro Tip</p>
            <p className="mt-1">Start with small inputs to understand the recurrence, then increase size to see how the table grows.</p>
          </div>
        </section>
      )}
    >
      <DPVisualizer
        guideOpen={isGuideOpen}
        onGuideOpenChange={setIsGuideOpen}
        hideGuideToggle
      />
    </WorkspaceShell>
  )
}
