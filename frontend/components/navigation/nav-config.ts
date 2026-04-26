import type { LucideIcon } from 'lucide-react'
import {
  Binary,
  Flame,
  Gauge,
  GitBranch,
  Info,
  Image as ImageIcon,
  LayoutDashboard,
  LineChart,
  Search,
  Layers,
  Zap,
  Network,
  HelpCircle,
} from 'lucide-react'

import type { UserRole } from '@/lib/api'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
  activeMatchers?: string[]
}

export interface NavSection {
  title: string
  items: NavItem[]
}

const roleHierarchy: UserRole[] = ['student', 'instructor', 'admin']

const navigationSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['student', 'instructor', 'admin'],
      },
    ],
  },
  {
    title: 'Algorithms',
    items: [
      {
        label: 'Sorting Algorithms',
        href: '/visualizer',
        icon: Gauge,
        roles: ['student', 'instructor', 'admin'],
      },
      {
        label: 'Searching Algorithms',
        href: '/binary-search',
        icon: Search,
        roles: ['student', 'instructor', 'admin'],
      },
      {
        label: 'Dynamic Programming',
        href: '/dp',
        icon: Layers,
        roles: ['student', 'instructor', 'admin'],
      },
      {
        label: 'Greedy Algorithms',
        href: '/greedy',
        icon: Zap,
        roles: ['student', 'instructor', 'admin'],
      },
      {
        label: 'Graph Algorithms',
        href: '/graph',
        icon: Network,
        roles: ['student', 'instructor', 'admin'],
      },
      {
        label: 'Backtracking',
        href: '/backtracking',
        icon: GitBranch,
        roles: ['student', 'instructor', 'admin'],
      },
      {
        label: 'Branch & Bound',
        href: '/branch-bound',
        icon: Binary,
        roles: ['student', 'instructor', 'admin'],
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        label: 'Algorithm Racing',
        href: '/racing',
        icon: Flame,
        roles: ['student', 'instructor', 'admin'],
      },
      {
        label: 'Pixel Sort Lab',
        href: '/pixel-sort',
        icon: ImageIcon,
        roles: ['student', 'instructor', 'admin'],
      },
    ],
  },
  {
    title: 'Analysis',
    items: [
      {
        label: 'Performance Analysis',
        href: '/analysis',
        icon: LineChart,
        roles: ['student', 'instructor', 'admin'],
      },
      {
        label: 'Global Quiz',
        href: '/quiz',
        icon: HelpCircle,
        roles: ['student', 'instructor', 'admin'],
      },
    ],
  },
  {
    title: 'Info',
    items: [
      {
        label: 'About Team',
        href: '/about',
        icon: Info,
        roles: ['student', 'instructor', 'admin'],
      },
    ],
  },
]

/** Flat list for backward compatibility */
export function getNavigationByRole(role: UserRole | null | undefined): NavItem[] {
  const resolvedRole: UserRole = role ?? 'student'
  const roleIndex = roleHierarchy.indexOf(resolvedRole)
  const visibleRoles = roleHierarchy.slice(0, roleIndex + 1)

  return navigationSections.flatMap((section) =>
    section.items.filter((item) =>
      item.roles.some((allowedRole) => visibleRoles.includes(allowedRole))
    )
  )
}

/** Grouped list for the new sidebar */
export function getGroupedNavigationByRole(role: UserRole | null | undefined): NavSection[] {
  const resolvedRole: UserRole = role ?? 'student'
  const roleIndex = roleHierarchy.indexOf(resolvedRole)
  const visibleRoles = roleHierarchy.slice(0, roleIndex + 1)

  return navigationSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.roles.some((allowedRole) => visibleRoles.includes(allowedRole))
      ),
    }))
    .filter((section) => section.items.length > 0)
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.href.startsWith('#')) {
    return false
  }

  const hrefWithoutHash = item.href.split('#')[0]
  const matchers = [hrefWithoutHash, ...(item.activeMatchers ?? [])]

  return matchers.some(
    (matcher) => pathname === matcher || pathname.startsWith(`${matcher}/`)
  )
}
