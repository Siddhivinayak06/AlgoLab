'use client'

import Link from 'next/link'
import { FlaskConical, LayoutDashboard, UserCircle2 } from 'lucide-react'

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
  user?: null
  onLogout?: () => void
  isLoggingOut?: boolean
}

export function UserDropdown(_props: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 rounded-full border border-border/40 bg-background/30 px-2.5 hover:bg-background/50"
          aria-label="Open navigation menu"
        >
          <Avatar className="size-7 border border-border/40">
            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
              AL
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-24 truncate text-sm font-medium lg:inline-block">
            AlgoLab
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-border/50 bg-popover/95 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">AlgoLab</p>
          <p className="text-xs text-muted-foreground">Algorithm Performance Analyzer</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/visualizer">
            <UserCircle2 className="size-4" />
            Visualizer
          </Link>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
