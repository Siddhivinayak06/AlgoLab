import type { Metadata } from 'next'
import { GitBranch } from 'lucide-react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { BacktrackingVisualizer } from '@/components/backtracking-visualizer'

export const metadata: Metadata = {
  title: 'Backtracking | AlgoLab',
  description: 'Visualize Backtracking algorithms including N-Queens, Sum of Subsets, Graph Coloring, and TSP.',
}

export default function BacktrackingPage() {
  return (
    <WorkspaceShell
      title="Backtracking Algorithms"
      description="Explore the state space tree incrementally. Watch the algorithm prune invalid paths and backtrack to find valid solutions."
      headerAction={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
          <GitBranch className="size-6 text-primary" />
        </div>
      }
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <BacktrackingVisualizer hideGuideToggle={false} />
      </div>
    </WorkspaceShell>
  )
}
