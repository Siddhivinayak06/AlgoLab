import type { Metadata } from 'next'
import { Binary } from 'lucide-react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { BranchBoundVisualizer } from '@/components/branch-bound-visualizer'

export const metadata: Metadata = {
  title: 'Branch & Bound | AlgoLab',
  description: 'Visualize Branch and Bound algorithms including the 15-Puzzle solver.',
}

export default function BranchBoundPage() {
  return (
    <WorkspaceShell
      title="Branch & Bound Algorithms"
      description="Use heuristic cost functions to guide the search through the state space tree efficiently. See it in action with the 15-Puzzle."
      headerAction={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
          <Binary className="size-6 text-primary" />
        </div>
      }
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <BranchBoundVisualizer hideGuideToggle={false} />
      </div>
    </WorkspaceShell>
  )
}
