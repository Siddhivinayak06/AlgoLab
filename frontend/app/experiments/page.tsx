'use client'

import React, { useEffect, useState } from 'react'

import { DashboardNav } from '@/components/dashboard-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getApiErrorMessage,
  getCurrentUser,
  listAllExperiments,
  listExperiments,
  type AuthUser,
  type ExperimentRecord,
} from '@/lib/api'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function ExperimentsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadExperiments = async () => {
    setIsLoading(true)

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      const isInstructorOrAdmin = currentUser.role === 'instructor' || currentUser.role === 'admin'
      const response = isInstructorOrAdmin
        ? await listAllExperiments({ limit: 100, sortBy: 'newest' })
        : await listExperiments({ limit: 100, sortBy: 'newest' })

      setExperiments(response.items)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load experiments'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadExperiments()
  }, [])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await loadExperiments()
      toast.success('Experiments refreshed')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <main className="gradient-mesh min-h-screen">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Experiments</h1>
          <p className="text-foreground/60">
            {user?.role === 'instructor' || user?.role === 'admin'
              ? 'Viewing all student experiments'
              : 'Viewing your personal experiment history'}
          </p>
        </div>

        <Card className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Experiment Records</h2>
            <Button
              variant="outline"
              className="border-border/50 text-foreground hover:bg-card/50"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {isLoading ? (
            <p className="text-foreground/60">Loading experiments...</p>
          ) : experiments.length === 0 ? (
            <p className="text-foreground/60">No experiments found.</p>
          ) : (
            <div className="space-y-3">
              {experiments.map((experiment) => (
                <div key={experiment.id} className="glass rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="font-semibold text-foreground capitalize">
                      {experiment.algorithm} | {experiment.mode}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {new Date(experiment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-foreground/60">Array Size</p>
                      <p className="font-semibold text-foreground">{experiment.arraySize}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Time</p>
                      <p className="font-semibold text-primary">{experiment.executionTime}ms</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Comparisons</p>
                      <p className="font-semibold text-accent">{experiment.comparisons}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Operations</p>
                      <p className="font-semibold text-secondary">{experiment.operations}</p>
                    </div>
                    <div>
                      <p className="text-foreground/60">Data Type</p>
                      <p className="font-semibold text-foreground capitalize">{experiment.dataType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
