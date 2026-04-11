import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  FileText,
  Flame,
  Gauge,
  History,
  Info,
  Image as ImageIcon,
  LayoutDashboard,
  LineChart,
  Shield,
  Users,
} from 'lucide-react'

import type { UserRole } from '@/lib/api'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
  activeMatchers?: string[]
}

const roleHierarchy: UserRole[] = ['student', 'instructor', 'admin']

const navigationCatalog: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Algorithm Visualizer',
    href: '/visualizer',
    icon: Gauge,
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Racing Mode',
    href: '/racing',
    icon: Flame,
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Performance Analysis',
    href: '/analysis',
    icon: LineChart,
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Experiment History',
    href: '/history',
    icon: History,
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Pixel Sort Lab',
    href: '/pixel-sort',
    icon: ImageIcon,
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'About Team',
    href: '/about',
    icon: Info,
    roles: ['student', 'instructor', 'admin'],
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['instructor', 'admin'],
  },
  {
    label: 'Admin Dashboard',
    href: '/admin',
    icon: Shield,
    roles: ['admin'],
  },
  {
    label: 'User Management',
    href: '/admin#user-management',
    icon: Users,
    roles: ['admin'],
    activeMatchers: ['/admin'],
  },
]

export function getNavigationByRole(role: UserRole | null | undefined): NavItem[] {
  const resolvedRole: UserRole = role ?? 'student'
  const roleIndex = roleHierarchy.indexOf(resolvedRole)
  const visibleRoles = roleHierarchy.slice(0, roleIndex + 1)

  return navigationCatalog.filter((item) =>
    item.roles.some((allowedRole) => visibleRoles.includes(allowedRole))
  )
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  const hrefWithoutHash = item.href.split('#')[0]
  const matchers = [hrefWithoutHash, ...(item.activeMatchers ?? [])]

  return matchers.some(
    (matcher) => pathname === matcher || pathname.startsWith(`${matcher}/`)
  )
}
