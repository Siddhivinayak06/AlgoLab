'use client'

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, Menu, Search, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getGroupedNavigationByRole, isNavItemActive, type NavSection } from '@/components/navigation/nav-config'
import { MobileSidebar } from '@/components/navigation/mobile-sidebar'
import { UserDropdown } from '@/components/navigation/user-dropdown'
import { cn } from '@/lib/utils'

interface SearchTarget {
  label: string
  href: string
  keywords: string[]
  description?: string
}

interface AppNavbarProps {
  focusMode?: boolean
  onFocusModeToggle?: () => void
}

// ─── Dropdown Menu ──────────────────────────────────────────────────────

function NavDropdown({ section, pathname }: { section: NavSection; pathname: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasActive = section.items.some(item => isNavItemActive(pathname, item))
  const isSingleItem = section.items.length === 1

  // For single-item sections like Dashboard, render as a direct link
  if (isSingleItem) {
    const item = section.items[0]
    const Icon = item.icon
    const isActive = isNavItemActive(pathname, item)
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150',
          isActive
            ? 'bg-primary/12 text-foreground'
            : 'text-foreground/65 hover:bg-foreground/[0.05] hover:text-foreground'
        )}
      >
        <Icon className="size-3.5" />
        {item.label}
      </Link>
    )
  }

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150',
          hasActive
            ? 'bg-primary/12 text-foreground'
            : 'text-foreground/65 hover:bg-foreground/[0.05] hover:text-foreground'
        )}
      >
        {section.title}
        <ChevronDown className={cn('size-3 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 top-full z-50 mt-1.5 min-w-[220px] overflow-hidden rounded-xl border border-border/40 bg-background/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl"
          >
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = isNavItemActive(pathname, item)
              const isPlaceholder = item.href.startsWith('#')

              return (
                <Link
                  key={item.href}
                  href={isPlaceholder ? '#' : item.href}
                  onClick={(e) => {
                    if (isPlaceholder) e.preventDefault()
                    else setOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-150',
                    isActive
                      ? 'bg-primary/12 font-semibold text-foreground'
                      : isPlaceholder
                        ? 'cursor-default text-foreground/30'
                        : 'text-foreground/70 hover:bg-foreground/[0.05] hover:text-foreground'
                  )}
                >
                  <Icon className={cn(
                    'size-4 shrink-0',
                    isActive ? 'text-primary' : isPlaceholder ? 'text-muted-foreground/25' : 'text-muted-foreground/60'
                  )} />
                  <span className="truncate">{item.label}</span>
                  {isPlaceholder && (
                    <span className="ml-auto rounded bg-muted/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground/40">
                      Soon
                    </span>
                  )}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Navbar ────────────────────────────────────────────────────────

export function AppNavbar({
  focusMode,
  onFocusModeToggle,
}: AppNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const navSections = useMemo(() => getGroupedNavigationByRole(undefined), [])
  const navItems = useMemo(() => navSections.flatMap(s => s.items), [navSections])

  const searchTargets = useMemo(() => {
    const fromNav: SearchTarget[] = navItems.map((item) => ({
      label: item.label,
      href: item.href,
      keywords: [item.label, item.href],
      description: 'Navigation section',
    }))

    const curatedTargets: SearchTarget[] = [
      { label: 'Binary Search Visualizer', href: '/binary-search', keywords: ['binary', 'search', 'array', 'target'], description: 'Find an element in a sorted list' },
      { label: 'Experiments Workspace', href: '/experiments', keywords: ['experiments', 'runs', 'benchmarks'], description: 'Run and compare algorithm experiments' },
    ]

    const dedupedTargets = new Map<string, SearchTarget>()
    ;[...fromNav, ...curatedTargets].forEach((target) => {
      const existing = dedupedTargets.get(target.href)
      if (!existing) {
        dedupedTargets.set(target.href, target)
        return
      }
      dedupedTargets.set(target.href, {
        ...existing,
        keywords: [...new Set([...existing.keywords, ...target.keywords])],
        description: existing.description ?? target.description,
      })
    })

    return Array.from(dedupedTargets.values())
  }, [navItems])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return []
    const terms = normalizedQuery.split(/\s+/)

    return searchTargets
      .map((target) => {
        const searchableText = [target.label, target.href, target.description ?? '', target.keywords.join(' ')].join(' ').toLowerCase()
        const matches = terms.every((term) => searchableText.includes(term))
        if (!matches) return null
        const label = target.label.toLowerCase()
        const rank = Number(!label.startsWith(normalizedQuery)) + Number(!label.includes(normalizedQuery))
        return { target, rank }
      })
      .filter((entry): entry is { target: SearchTarget; rank: number } => entry !== null)
      .sort((a, b) => a.rank - b.rank || a.target.label.localeCompare(b.target.label))
      .slice(0, 6)
      .map((entry) => entry.target)
  }, [normalizedQuery, searchTargets])

  useEffect(() => {
    setSearchQuery('')
    setIsSearchFocused(false)
  }, [pathname])

  const navigateFromSearch = (target: SearchTarget) => {
    setSearchQuery('')
    setIsSearchFocused(false)
    router.push(target.href)
  }

  const handleSearchSubmit = () => {
    const firstResult = searchResults[0]
    if (!firstResult) { toast('No matching section found'); return }
    navigateFromSearch(firstResult)
  }


  return (
    <header className="sticky top-0 z-50">
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="nav-gradient-border bg-background/60 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-3xl supports-[backdrop-filter]:bg-background/35"
        aria-label="Primary"
      >
        <div className="mx-auto max-w-[1600px] flex h-14 items-center gap-3 px-3 sm:px-4 lg:px-6">
          {/* ── Left: Logo + Nav Dropdowns ── */}
          <div className="flex items-center gap-1 lg:gap-2">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-lg px-1.5 py-1 mr-1 lg:mr-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            >
              <span className="flex size-7 items-center justify-center rounded-lg border border-primary/35 bg-primary/20 transition-colors group-hover:bg-primary/30 logo-glow">
                <Code2 className="size-3.5 text-primary" />
              </span>
              <span className="hidden text-sm font-bold tracking-tight text-foreground sm:block">AlgoLab</span>
            </Link>

            {/* Desktop nav dropdowns */}
            <div className="hidden items-center gap-0.5 lg:flex">
              {navSections.map((section) => (
                <NavDropdown key={section.title} section={section} pathname={pathname} />
              ))}
            </div>
          </div>

          {/* ── Center: Search ── */}
          <div className="hidden min-w-0 flex-1 px-2 md:block lg:px-6">
            <div className="relative mx-auto max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="search"
                placeholder="Search algorithms, datasets, reports…"
                className="h-9 rounded-full border-border/30 bg-foreground/[0.03] pl-9 pr-4 text-[13px] transition-all duration-300 focus:bg-background/70 focus:border-primary/30 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] dark:bg-foreground/[0.05] dark:focus:shadow-[0_0_0_3px_rgba(129,140,248,0.15)]"
                aria-label="Search AlgoLab"
                value={searchQuery}
                autoComplete="off"
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => { window.setTimeout(() => setIsSearchFocused(false), 120) }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') { event.preventDefault(); handleSearchSubmit() }
                  if (event.key === 'Escape') { setSearchQuery(''); setIsSearchFocused(false) }
                }}
              />

              {isSearchFocused && normalizedQuery && (
                <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-border/40 bg-background/95 shadow-xl backdrop-blur-xl">
                  {searchResults.length > 0 ? (
                    <ul className="max-h-72 space-y-0.5 overflow-y-auto p-1.5">
                      {searchResults.map((result) => (
                        <li key={result.href}>
                          <button
                            type="button"
                            className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent/70"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => navigateFromSearch(result)}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">{result.label}</span>
                              <span className="block truncate text-xs text-muted-foreground">{result.description ?? result.href}</span>
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">Enter</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No matching section found.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ModeToggle compact />

            <div className="hidden md:block">
              <UserDropdown
                user={null}
                isLoggingOut={false}
                onLogout={() => {}}
              />
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-border/35 bg-background/25 size-8"
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      <MobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        user={null}
        navItems={navItems}
        pathname={pathname}
        notificationCount={0}
        isLoggingOut={false}
        onLogout={() => {}}
      />
    </header>
  )
}
