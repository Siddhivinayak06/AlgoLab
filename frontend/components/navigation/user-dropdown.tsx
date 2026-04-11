'use client'

import Link from 'next/link'
import { ChevronDown, FlaskConical, LogOut, Settings, UserCircle2 } from 'lucide-react'

import type { AuthUser } from '@/lib/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserDropdownProps {
  user: AuthUser | null
  onLogout: () => Promise<void> | void
  isLoggingOut?: boolean
}

function getInitials(name: string | undefined) {
  if (!name) {
    return 'AL'
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || 'AL'
}

export function UserDropdown({
  user,
  onLogout,
  isLoggingOut = false,
}: UserDropdownProps) {
  const firstName = user?.name?.split(' ')[0] ?? 'User'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 rounded-full border border-border/40 bg-background/30 px-2.5 hover:bg-background/50"
          aria-label="Open user menu"
        >
          <Avatar className="size-7 border border-border/40">
            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-24 truncate text-sm font-medium lg:inline-block">
            {firstName}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-border/50 bg-popover/95 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{user?.name ?? 'AlgoLab User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email ?? 'Signed in user'}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard?view=profile">
            <UserCircle2 className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard?view=settings">
            <Settings className="size-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/experiments">
            <FlaskConical className="size-4" />
            My Experiments
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={isLoggingOut}
          onSelect={() => {
            void onLogout()
          }}
        >
          <LogOut className="size-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
