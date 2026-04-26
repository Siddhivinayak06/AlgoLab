'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Beaker, ChevronDown, ChevronRight } from 'lucide-react'

import { getCurrentUser, type UserRole } from '@/lib/api'
import { cn } from '@/lib/utils'
import { getGroupedNavigationByRole, isNavItemActive, type NavSection } from '@/components/navigation/nav-config'

interface WorkspaceSidebarProps {
  className?: string
}

const DEFAULT_EXPANDED = ['Main', 'Algorithms', 'Tools']
const STORAGE_KEY = 'algolab_sidebar_state'

function useSidebarState(sections: NavSection[]) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setExpandedSections(JSON.parse(stored))
      } else {
        const initial: Record<string, boolean> = {}
        sections.forEach(s => {
          initial[s.title] = DEFAULT_EXPANDED.includes(s.title)
        })
        setExpandedSections(initial)
      }
    } catch { /* ignore */ }
    setIsLoaded(true)
  }, [sections])

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const next = { ...prev, [title]: !prev[title] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  return { expandedSections, toggleSection, isLoaded }
}

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.03 } },
}
const listItem = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0 },
}

export function WorkspaceSidebar({ className }: WorkspaceSidebarProps) {
  const pathname = usePathname()
  const [role, setRole] = useState<UserRole>('student')

  useEffect(() => {
    let mounted = true
    void getCurrentUser()
      .then(u => { if (mounted) setRole(u.role) })
      .catch(() => { if (mounted) setRole('student') })
    return () => { mounted = false }
  }, [])

  const navSections = useMemo(() => getGroupedNavigationByRole(role), [role])
  const { expandedSections, toggleSection, isLoaded } = useSidebarState(navSections)

  return (
    <aside
      className={cn(
        'sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border/40 bg-background/45 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl',
        'scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent',
        className
      )}
      aria-label="Sidebar navigation"
    >
      {/* ── Logo Header ── */}
      <div className="flex items-center gap-2.5 border-b border-border/30 px-4 py-4 lg:justify-center xl:justify-start">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 shadow-[0_0_12px_rgba(var(--primary-rgb,124,58,237),0.15)]">
          <Beaker className="size-4 text-primary" />
        </div>
        <div className="hidden xl:block">
          <p className="text-sm font-bold tracking-tight text-foreground">AlgoLab</p>
          <p className="text-[10px] text-muted-foreground">Algorithm Performance Analyzer</p>
        </div>
      </div>

      {/* ── Navigation Sections ── */}
      <nav className="p-2">
        {navSections.map((section, sectionIndex) => {
          const isExpanded = expandedSections[section.title] ?? DEFAULT_EXPANDED.includes(section.title)

          return (
            <div key={section.title} className={cn(sectionIndex > 0 && 'mt-1')}>
              {/* Separator */}
              {sectionIndex > 0 && (
                <div className="mx-3 mb-2 border-t border-border/20" />
              )}

              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 transition-colors duration-150',
                  'hover:bg-foreground/[0.04] dark:hover:bg-foreground/[0.03]',
                  'lg:justify-center xl:justify-between'
                )}
                aria-expanded={isExpanded}
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60 select-none">
                  {section.title}
                </span>
                <span className="hidden xl:inline-block text-muted-foreground/50 transition-transform duration-200">
                  {isExpanded
                    ? <ChevronDown className="size-3" />
                    : <ChevronRight className="size-3" />
                  }
                </span>
              </button>

              {/* Collapsible Items */}
              <AnimatePresence initial={false}>
                {(isExpanded || !isLoaded) && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={{
                      expanded: { opacity: 1, height: 'auto' },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <motion.ul
                      initial="hidden"
                      animate="show"
                      variants={listContainer}
                      className="mt-0.5 space-y-0.5 pb-1"
                    >
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = isNavItemActive(pathname, item)
                        const isPlaceholder = item.href.startsWith('#')

                        return (
                          <motion.li key={item.href} variants={listItem}>
                            <Link
                              href={isPlaceholder ? '#' : item.href}
                              aria-current={isActive ? 'page' : undefined}
                              aria-disabled={isPlaceholder}
                              title={item.label}
                              className={cn(
                                'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all duration-150',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
                                'lg:justify-center lg:px-2.5 xl:justify-start xl:px-3',
                                isActive
                                  ? 'border-l-[3px] border-l-primary bg-primary/15 font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                                  : isPlaceholder
                                    ? 'cursor-default border-l-[3px] border-l-transparent text-foreground/30'
                                    : 'border-l-[3px] border-l-transparent text-foreground/65 hover:bg-foreground/[0.05] hover:text-foreground hover:scale-[1.01]'
                              )}
                              onClick={isPlaceholder ? (e) => e.preventDefault() : undefined}
                            >
                              <Icon
                                className={cn(
                                  'relative z-10 size-4 shrink-0 transition-colors duration-150',
                                  isActive
                                    ? 'text-primary drop-shadow-[0_0_4px_rgba(var(--primary-rgb,124,58,237),0.4)]'
                                    : isPlaceholder
                                      ? 'text-muted-foreground/25'
                                      : 'text-muted-foreground/70 group-hover:text-foreground/80'
                                )}
                              />
                              <span className="relative z-10 hidden truncate text-xs lg:hidden xl:inline">
                                {item.label}
                              </span>
                              {isPlaceholder && (
                                <span className="ml-auto hidden rounded bg-muted/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground/40 xl:inline">
                                  Soon
                                </span>
                              )}

                              {/* Active glow */}
                              {isActive && (
                                <motion.span
                                  layoutId="sidebar-active-glow"
                                  className="pointer-events-none absolute inset-0 rounded-xl bg-primary/8"
                                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                              )}
                            </Link>
                          </motion.li>
                        )
                      })}
                    </motion.ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
