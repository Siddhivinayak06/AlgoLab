'use client'

import React, { useEffect, useState } from 'react'

import { DashboardNav } from '@/components/dashboard-nav'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  deleteUserById,
  getAdminAnalytics,
  getApiErrorMessage,
  getCurrentUser,
  listUsers,
  updateUserRole,
  type AdminAnalytics,
  type AdminUser,
  type AuthUser,
  type UserRole,
} from '@/lib/api'
import { RefreshCw, ShieldAlert, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const isAdmin = user?.role === 'admin'

  const loadAdminData = async () => {
    setIsLoading(true)

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (currentUser.role !== 'admin') {
        return
      }

      const [analyticsResponse, usersResponse] = await Promise.all([
        getAdminAnalytics(),
        listUsers({ limit: 100, page: 1 }),
      ])

      setAnalytics(analyticsResponse)
      setUsers(usersResponse.items)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load admin data'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAdminData()
  }, [])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      await loadAdminData()
      toast.success('Admin data refreshed')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRoleChange = async (targetUserId: string, role: UserRole) => {
    try {
      setUpdatingUserId(targetUserId)
      const updatedUser = await updateUserRole(targetUserId, role)

      setUsers((previous) =>
        previous.map((item) => (item.id === updatedUser.id ? updatedUser : item))
      )
      toast.success('User role updated')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update role'))
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteUser = async (targetUserId: string) => {
    if (!window.confirm('Delete this user account? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingUserId(targetUserId)
      await deleteUserById(targetUserId)
      setUsers((previous) => previous.filter((item) => item.id !== targetUserId))
      toast.success('User deleted')
      await loadAdminData()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete user'))
    } finally {
      setDeletingUserId(null)
    }
  }

  return (
    <main className="gradient-mesh min-h-screen">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-foreground/60">Manage users, roles, and system health</p>
        </div>

        {isLoading ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-foreground/60">Loading admin dashboard...</p>
          </Card>
        ) : !isAdmin ? (
          <Card className="glass-card p-8 text-center">
            <ShieldAlert className="w-10 h-10 mx-auto text-destructive mb-3" />
            <p className="text-foreground/60">Admin access required.</p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card text-center">
                <p className="text-foreground/60 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-primary">{analytics?.totalUsers ?? 0}</p>
              </Card>
              <Card className="glass-card text-center">
                <p className="text-foreground/60 text-sm">Experiments</p>
                <p className="text-3xl font-bold text-accent">{analytics?.totalExperiments ?? 0}</p>
              </Card>
              <Card className="glass-card text-center">
                <p className="text-foreground/60 text-sm">Reports</p>
                <p className="text-3xl font-bold text-secondary">{analytics?.totalReports ?? 0}</p>
              </Card>
              <Card className="glass-card text-center">
                <p className="text-foreground/60 text-sm">Instructors</p>
                <p className="text-3xl font-bold text-foreground">{analytics?.usersByRole.instructor ?? 0}</p>
              </Card>
            </div>

            <Card id="user-management" className="glass-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">User Management</h2>
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

              {users.length === 0 ? (
                <p className="text-foreground/60">No users found.</p>
              ) : (
                <div className="space-y-3">
                  {users.map((row) => {
                    const isCurrentUser = row.id === user?.id
                    const isBusy = updatingUserId === row.id || deletingUserId === row.id

                    return (
                      <div key={row.id} className="glass rounded-lg p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{row.name}</p>
                            <p className="text-sm text-foreground/60">{row.email}</p>
                            <p className="text-xs text-foreground/50">
                              Joined: {new Date(row.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Select
                              value={row.role}
                              onValueChange={(value) =>
                                void handleRoleChange(row.id, value as UserRole)
                              }
                              disabled={isBusy || isCurrentUser}
                            >
                              <SelectTrigger className="w-44 bg-input/50 border-border/50 text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border/50">
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              variant="outline"
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                              onClick={() => void handleDeleteUser(row.id)}
                              disabled={isBusy || isCurrentUser}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </main>
  )
}
