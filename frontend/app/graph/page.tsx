import type { Metadata } from 'next'
import { Network } from 'lucide-react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { GraphVisualizer } from '@/components/graph-visualizer'

export const metadata: Metadata = {
  title: 'Graph Algorithms | AlgoLab',
  description: 'Visualize Graph algorithms including Bellman-Ford, Floyd-Warshall, and Multistage.',
}

export default function GraphPage() {
  return (
    <WorkspaceShell
      title="Graph Algorithms"
      description="Explore DP-based graph algorithms for shortest paths. Watch the dynamic table updates alongside edge relaxations."
      headerAction={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
          <Network className="size-6 text-primary" />
        </div>
      }
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <GraphVisualizer hideGuideToggle={false} />
      </div>
    </WorkspaceShell>
  )
}
