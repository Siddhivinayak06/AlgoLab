import type { Metadata } from 'next'
import { Zap } from 'lucide-react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { GreedyVisualizer } from '@/components/greedy-visualizer'

export const metadata: Metadata = {
  title: 'Greedy Algorithms | AlgoLab',
  description: 'Visualize Greedy algorithms including Dijkstra, Kruskal, and Job Scheduling.',
}

export default function GreedyPage() {
  return (
    <WorkspaceShell
      title="Greedy Algorithms"
      description="Make locally optimal choices at each stage to find a global optimum. Observe algorithms like Dijkstra's, Fractional Knapsack, and MSTs."
      headerAction={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
          <Zap className="size-6 text-primary" />
        </div>
      }
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <GreedyVisualizer hideGuideToggle={false} />
      </div>
    </WorkspaceShell>
  )
}
