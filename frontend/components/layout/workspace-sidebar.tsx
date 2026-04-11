'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

import { getCurrentUser, type UserRole } from '@/lib/api'
import { cn } from '@/lib/utils'
import { getNavigationByRole, isNavItemActive } from '@/components/navigation/nav-config'

interface WorkspaceSidebarProps {
  className?: string
}

const sidebarContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

const sidebarItem = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
}

export function WorkspaceSidebar({ className }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  const [role, setRole] = useState<UserRole>('student')

  useEffect(() => {
    let mounted = true

    void getCurrentUser()
      .then((user) => {
        if (mounted) {
          setRole(user.role)
        }
      })
      .catch(() => {
        if (mounted) {
          setRole('student')
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const navItems = useMemo(() => getNavigationByRole(role), [role])

  return (
    <aside
      className={cn(
        'sticky top-24 rounded-2xl border border-border/40 bg-background/45 p-2 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl',
        className
      )}
      aria-label="Sidebar navigation"
    >
      <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground lg:text-center xl:text-left">
        Workspaces
      </p>

      <motion.nav initial="hidden" animate="show" variants={sidebarContainer}>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavItemActive(pathname, item)

            return (
              <motion.li key={item.href} variants={sidebarItem}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl border px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 lg:justify-center lg:px-2 xl:justify-start xl:px-2.5',
                    isActive
                      ? 'border-primary/40 bg-primary/16 text-foreground'
                      : 'border-transparent text-foreground/75 hover:border-primary/25 hover:bg-background/50 hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="desktop-sidebar-active"
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      transition={{ type: 'spring', stiffness: 430, damping: 36 }}
                    />
                  )}
                  <Icon className="relative z-10 size-4 shrink-0" />
                  <span className="relative z-10 hidden text-xs font-medium lg:hidden xl:inline">
                    {item.label}
                  </span>
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </motion.nav>
    </aside>
  )
}
