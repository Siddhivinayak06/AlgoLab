'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { DashboardNav } from '@/components/dashboard-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage, getClassAnalytics, getCurrentUser, type AuthUser } from '@/lib/api'
import { BarChart3, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface ChartPoint {
  inputSize: number
  executionTime: number
  algorithm: string
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [series, setSeries] = useState<
    Array<{
      algorithm: string
      points: Array<{
        inputSize: number
        executionTime: number
        comparisons: number
        operations: number
        runs: number
      }>
    }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const canViewAnalytics = user?.role === 'instructor' || user?.role === 'admin'

  const chartData = useMemo(() => {
    const points: ChartPoint[] = []

    for (const algorithmSeries of series) {
      for (const point of algorithmSeries.points) {
        points.push({
          inputSize: point.inputSize,
          executionTime: point.executionTime,
          algorithm: algorithmSeries.algorithm,
        })
      }
    }

    return points
  }, [series])

  const loadAnalytics = async () => {
    setIsLoading(true)

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser.role !== 'instructor' && currentUser.role !== 'admin') {
        return
      }

      const response = await getClassAnalytics()
      setSeries(response.series)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load class analytics'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAnalytics()
  }, [])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const response = await getClassAnalytics()
      setSeries(response.series)
      toast.success('Analytics refreshed')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to refresh analytics'))
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <main className="gradient-mesh min-h-screen">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Class Analytics</h1>
          <p className="text-foreground/60">
            Instructor and admin view of experiment performance across students
          </p>
        </div>

        {isLoading ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-foreground/60">Loading analytics...</p>
          </Card>
        ) : !canViewAnalytics ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-foreground/60">
              Your role does not have access to class analytics.
            </p>
          </Card>
        ) : (
          <>
            <Card className="glass-card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  <BarChart3 className="w-5 h-5 inline mr-2" />
                  Execution Time Trends
                </h2>
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

              {chartData.length === 0 ? (
                <p className="text-foreground/60">No analytics data available yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="inputSize" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10, 10, 30, 0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="executionTime"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="glass-card">
              <h2 className="text-2xl font-bold text-foreground mb-6">Algorithm Breakdown</h2>

              {series.length === 0 ? (
                <p className="text-foreground/60">No algorithm data available.</p>
              ) : (
                <div className="space-y-4">
                  {series.map((algorithmSeries) => (
                    <div key={algorithmSeries.algorithm} className="glass rounded-lg p-4">
                      <p className="font-semibold text-foreground capitalize mb-2">
                        {algorithmSeries.algorithm}
                      </p>
                      <p className="text-sm text-foreground/60">
                        Data points: {algorithmSeries.points.length}
                      </p>
                      <p className="text-sm text-foreground/60">
                        Total runs: {algorithmSeries.points.reduce((sum, point) => sum + point.runs, 0)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </main>
  )
}
