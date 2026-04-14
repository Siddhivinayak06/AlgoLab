'use client'

import React from 'react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { BinarySearchVisualizer } from '@/components/binary-search-visualizer'
import { Card } from '@/components/ui/card'
import { BookOpen, AlertCircle, Zap, Code2 } from 'lucide-react'

export default function BinarySearchPage() {
  return (
    <WorkspaceShell
      title="Binary Search Lab"
      description="Visualize the logarithmic efficiency of searching in sorted data"
      rightPanel={<BinarySearchKnowledgeBase />}
    >
      <BinarySearchVisualizer />
    </WorkspaceShell>
  )
}

function BinarySearchKnowledgeBase() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="size-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Concept</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Binary search is a "divide and conquer" algorithm. It compares the target value to the middle element of the array. If they are not equal, the half in which the target cannot lie is eliminated.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-orange-400">
          <AlertCircle className="size-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Constraint</h3>
        </div>
        <Card className="p-3 bg-orange-400/5 border-orange-400/20">
          <p className="text-[11px] text-orange-200/80">
            <strong>Mandatory:</strong> Data must be sorted! Standard binary search will return incorrect results on unsorted sets.
          </p>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <Zap className="size-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Efficiency</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Logarithmic Time</span>
            <span className="text-emerald-400">O(log n)</span>
          </div>
          <div className="w-full bg-muted/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-[15%]" />
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Binary Search can find an item in 1 billion elements in just 30 comparisons.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-border/20">
        <div className="flex items-center gap-2 text-blue-400">
          <Code2 className="size-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Properties</h3>
        </div>
        <ul className="space-y-2">
          {[
            'Recursive or Iterative',
            'Internal Memory only',
            'Non-stable Search',
            'Requires Random Access',
          ].map((prop) => (
            <li key={prop} className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <div className="size-1 rounded-full bg-blue-400/50" />
              {prop}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
