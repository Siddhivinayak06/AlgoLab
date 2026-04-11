'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, FlaskConical, LogOut, Settings, UserCircle2 } from 'lucide-react'

import type { AuthUser } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { type NavItem, isNavItemActive } from '@/components/navigation/nav-config'

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AuthUser | null
  navItems: NavItem[]
  pathname: string
  notificationCount: number
  onLogout: () => Promise<void> | void
  isLoggingOut?: boolean
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0 },
}

export function MobileSidebar({
  open,
  onOpenChange,
  user,
  navItems,
  pathname,
  notificationCount,
  onLogout,
  isLoggingOut = false,
}: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[86vw] max-w-sm border-r border-border/40 bg-background/70 p-0 backdrop-blur-2xl"
      >
        <SheetHeader className="border-b border-border/30 px-5 py-4 text-left">
          <SheetTitle className="text-lg">AlgoLab Navigation</SheetTitle>
          <SheetDescription>Switch modules and manage your account</SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col overflow-hidden px-4 pb-4">
          <motion.nav
            id="mobile-navigation"
            initial="hidden"
            animate={open ? 'show' : 'hidden'}
            variants={containerVariants}
            className="mt-4 space-y-2 overflow-y-auto pr-1"
            aria-label="Mobile primary"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = isNavItemActive(pathname, item)

              return (
                <motion.div key={item.href} variants={itemVariants}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                        isActive
                          ? 'border-primary/40 bg-primary/15 text-foreground shadow-lg shadow-primary/10'
                          : 'border-border/30 bg-background/25 text-foreground/80 hover:border-primary/25 hover:bg-background/45 hover:text-foreground'
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="mobile-active-item"
                          className="pointer-events-none absolute inset-0 rounded-xl border border-primary/30"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                      <Icon className="relative z-10 size-4" />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  </SheetClose>
                </motion.div>
              )
            })}
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.25, delay: 0.12 }}
            className="mt-4 rounded-xl border border-border/30 bg-background/30 px-3 py-2.5"
          >
            <div className="flex items-center justify-between text-sm text-foreground/80">
              <div className="flex items-center gap-2">
                <Bell className="size-4" />
                <span>Notifications</span>
              </div>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                {notificationCount}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.25, delay: 0.16 }}
            className="mt-auto space-y-2 pt-4"
          >
            <SheetClose asChild>
              <Link
                href="/dashboard?view=profile"
                className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/20 px-3 py-2.5 text-sm text-foreground/85 hover:bg-background/40"
              >
                <UserCircle2 className="size-4" />
                Profile
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/dashboard?view=settings"
                className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/20 px-3 py-2.5 text-sm text-foreground/85 hover:bg-background/40"
              >
                <Settings className="size-4" />
                Settings
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/experiments"
                className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/20 px-3 py-2.5 text-sm text-foreground/85 hover:bg-background/40"
              >
                <FlaskConical className="size-4" />
                My Experiments
              </Link>
            </SheetClose>

            <Button
              variant="outline"
              className="h-10 w-full rounded-xl border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive/10"
              disabled={isLoggingOut}
              onClick={() => {
                onOpenChange(false)
                void onLogout()
              }}
            >
              <LogOut className="size-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>

            <p className="px-1 text-xs text-foreground/50">
              Signed in as {user?.name ?? 'AlgoLab User'}
            </p>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
