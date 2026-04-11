'use client'

import React, { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { Card } from '@/components/ui/card'
import {
  AuthUser,
  ExperimentRecord,
  getCurrentUser,
  listExperiments,
  listReports,
} from '@/lib/api'

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentExperiments, setRecentExperiments] = useState<ExperimentRecord[]>([])
  const [usageData, setUsageData] = useState<Array<{ algorithm: string; count: number }>>([])
  const [summary, setSummary] = useState({
    totalExperiments: 0,
    mostUsedAlgorithm: 'N/A',
    avgExecutionTime: 0,
    savedReports: 0,
  })

  useEffect(() => {
    let active = true

    void Promise.all([
      getCurrentUser(),
      listExperiments({ sortBy: 'newest', limit: 100 }),
      listReports({ limit: 1 }),
    ])
      .then(([currentUser, experimentResponse, reportResponse]) => {
        if (active) {
          setUser(currentUser)

          const experiments = experimentResponse.items
          setRecentExperiments(experiments.slice(0, 6))

          const algorithmCountMap = experiments.reduce<Record<string, number>>((acc, item) => {
            const key = item.algorithm
            acc[key] = (acc[key] ?? 0) + 1
            return acc
          }, {})

          const normalizedUsage = Object.entries(algorithmCountMap)
            .map(([algorithm, count]) => ({ algorithm, count }))
            .sort((a, b) => b.count - a.count)

          const avgExecutionTime =
            experiments.length > 0
              ? Math.round(
                experiments.reduce((total, item) => total + item.executionTime, 0) / experiments.length
              )
              : 0

          setUsageData(normalizedUsage)
          setSummary({
            totalExperiments: experimentResponse.total,
            mostUsedAlgorithm: normalizedUsage[0]?.algorithm ?? 'N/A',
            avgExecutionTime,
            savedReports: reportResponse.total,
          })
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setUser(null)
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <WorkspaceShell
      title="Dashboard"
      description={`Quick overview of the AlgoLab system for ${user?.name ?? 'Learner'}`}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="glass-card border-primary/25 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Experiments</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{summary.totalExperiments}</p>
          </Card>

          <Card className="glass-card border-secondary/25 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Most Used Algorithm</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{summary.mostUsedAlgorithm}</p>
          </Card>

          <Card className="glass-card border-accent/25 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Avg Execution Time</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{summary.avgExecutionTime} ms</p>
          </Card>

          <Card className="glass-card border-primary/25 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saved Reports</p>
            <p className="mt-3 text-3xl font-bold text-foreground">{summary.savedReports}</p>
          </Card>
        </div>

        <Card className="glass-card p-0">
          <div className="border-b border-border/30 px-5 py-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Experiments</h2>
          </div>

          {isLoading ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">Loading recent experiments...</p>
          ) : recentExperiments.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">
              No experiments yet. Run an algorithm to populate this table.
            </p>
          ) : (
            <div className="overflow-x-auto px-2 pb-2">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/20 text-left text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Algorithm</th>
                    <th className="px-3 py-3 font-medium">Dataset</th>
                    <th className="px-3 py-3 font-medium">Time</th>
                    <th className="px-3 py-3 font-medium">Operations</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExperiments.map((item) => (
                    <tr key={item.id} className="border-b border-border/10 text-foreground/90 hover:bg-background/35">
                      <td className="px-3 py-3">{item.algorithm}</td>
                      <td className="px-3 py-3">{item.arraySize}</td>
                      <td className="px-3 py-3">{item.executionTime} ms</td>
                      <td className="px-3 py-3">{item.operations}</td>
                      <td className="px-3 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="glass-card p-5">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Algorithm Usage Statistics</h2>

          {usageData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No algorithm usage data available yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={usageData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                <XAxis dataKey="algorithm" stroke="currentColor" tick={{ fill: 'currentColor', fontSize: 12 }} />
                <YAxis stroke="currentColor" tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(99,102,241,0.1)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--popover)',
                  }}
                />
                <Bar dataKey="count" name="Experiments" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </WorkspaceShell>
  )
}
