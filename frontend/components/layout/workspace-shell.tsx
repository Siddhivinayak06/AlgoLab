'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'

import { DashboardNav } from '@/components/dashboard-nav'
import { cn } from '@/lib/utils'

interface WorkspaceShellProps {
  title: string
  description: string
  children: ReactNode
  rightPanel?: ReactNode
  contentClassName?: string
  headerAction?: ReactNode
}

export function WorkspaceShell({
  title,
  description,
  children,
  contentClassName,
  headerAction,
}: WorkspaceShellProps) {
  const [focusMode, setFocusMode] = useState(false)

  return (
    <main className="gradient-mesh min-h-screen">
      <DashboardNav
        focusMode={focusMode}
        onFocusModeToggle={() => setFocusMode(prev => !prev)}
      />

      <div className={cn(
        'mx-auto px-3 pb-8 sm:px-4 lg:px-6 transition-all duration-300',
        focusMode ? 'max-w-[1800px] pt-4' : 'max-w-[1400px] pt-6',
      )}>
        <section
          className={cn(
            'min-w-0 rounded-2xl border border-border/40 bg-background/35 p-5 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:p-6',
            contentClassName
          )}
        >
          {!focusMode && (
            <header className="mb-6 border-b border-border/30 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                  <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{description}</p>
                </div>

                {headerAction && (
                  <div className="shrink-0 self-start">{headerAction}</div>
                )}
              </div>
            </header>
          )}

          {children}
        </section>
      </div>
    </main>
  )
}
