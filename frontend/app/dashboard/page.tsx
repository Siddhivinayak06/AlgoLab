'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart2,
  FileText,
  Gauge,
  Layers,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react'

import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { Button } from '@/components/ui/button'

/* ─── helpers ─────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ─── quick action card ───────────────────────────────────── */
interface QuickActionProps {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  gradient: string
}

function QuickAction({ href, icon, label, description, gradient }: QuickActionProps) {
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-2xl border border-border/30 bg-background/40 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg cursor-pointer h-full">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity duration-300 ${gradient}`} />
        <div className="relative z-10">
          <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${gradient} text-white shadow-md`}>
            {icon}
          </div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="absolute bottom-4 right-4 h-3.5 w-3.5 text-muted-foreground/40 transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

/* ─── page ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const quickActions: QuickActionProps[] = [
    {
      href: '/visualizer',
      icon: <Gauge className="h-4 w-4" />,
      label: 'Sort Algorithms Visualiser',
      description: 'Visualize sorting step by step',
      gradient: 'bg-gradient-to-br from-violet-500 to-indigo-600',
    },
    {
      href: '/analysis',
      icon: <BarChart2 className="h-4 w-4" />,
      label: 'Performance Analysis',
      description: 'Compare algorithm performance',
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    },
    {
      href: '/binary-search',
      icon: <Search className="h-4 w-4" />,
      label: 'Search Algorithms Visualiser',
      description: 'Explore search traversal behaviors',
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    },
    {
      href: '/racing',
      icon: <Zap className="h-4 w-4" />,
      label: 'Algorithm Racing',
      description: 'Race two algorithms head-to-head',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    },
    {
      href: '/dp',
      icon: <Layers className="h-4 w-4" />,
      label: 'Dynamic Programming',
      description: 'Visualize DP problem solutions',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    },
    {
      href: '/pixel-sort',
      icon: <FileText className="h-4 w-4" />,
      label: 'Pixel Sort Lab',
      description: 'Sort pixels in images artistically',
      gradient: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    },
  ]

  return (
    <WorkspaceShell
      title="Dashboard"
      description={`${getGreeting()}, Learner — here's your AlgoLab overview`}
    >
      <div className="space-y-7">

        {/* ── Welcome hero ── */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-6 shadow-lg backdrop-blur-xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  AlgoLab Workspace
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {getGreeting()},{' '}
                <span className="text-primary">Learner</span>!
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a tool below to start exploring algorithms interactively.
              </p>
            </div>
            <Link href="/visualizer">
              <Button className="shrink-0 gap-2">
                <Zap className="h-4 w-4" />
                Start Visualizing
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Tools
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {quickActions.map((a) => (
              <QuickAction key={a.href} {...a} />
            ))}
          </div>
        </div>

      </div>
    </WorkspaceShell>
  )
}
