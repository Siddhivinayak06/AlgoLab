import type { ReactNode } from 'react'

import { DashboardNav } from '@/components/dashboard-nav'
import { RightInfoPanel } from '@/components/layout/right-info-panel'
import { WorkspaceSidebar } from '@/components/layout/workspace-sidebar'
import { cn } from '@/lib/utils'

interface WorkspaceShellProps {
  title: string
  description: string
  children: ReactNode
  rightPanel?: ReactNode
  contentClassName?: string
}

export function WorkspaceShell({
  title,
  description,
  children,
  rightPanel,
  contentClassName,
}: WorkspaceShellProps) {
  return (
    <main className="gradient-mesh min-h-screen">
      <DashboardNav />

      <div className="mx-auto max-w-[1600px] px-3 pb-8 pt-6 sm:px-4 lg:px-5">
        <div className="grid gap-4 lg:grid-cols-[4.2rem_minmax(0,1fr)] xl:grid-cols-[12.75rem_minmax(0,1fr)] 2xl:grid-cols-[12.75rem_minmax(0,1fr)_17.5rem]">
          <WorkspaceSidebar className="hidden lg:block" />

          <section
            className={cn(
              'rounded-2xl border border-border/40 bg-background/35 p-5 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:p-6',
              contentClassName
            )}
          >
            <header className="mb-6 border-b border-border/30 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{description}</p>
            </header>

            {children}
          </section>

          <RightInfoPanel className="hidden 2xl:block">{rightPanel}</RightInfoPanel>
        </div>
      </div>
    </main>
  )
}
