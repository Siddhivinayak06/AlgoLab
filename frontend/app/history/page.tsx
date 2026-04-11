'use client'

import React from 'react'
import { ExperimentHistory } from '@/components/experiment-history'
import { WorkspaceShell } from '@/components/layout/workspace-shell'

export default function HistoryPage() {
  return (
    <WorkspaceShell
      title="Experiment History"
      description="Filter, inspect, and manage stored experiment runs with quick actions for report generation."
    >
      <div className="space-y-6">
        <ExperimentHistory showActions={true} />
      </div>
    </WorkspaceShell>
  )
}
