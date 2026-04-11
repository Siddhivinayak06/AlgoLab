'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserRole, getApiErrorMessage, register } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Code2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [nextPath, setNextPath] = useState('/dashboard')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const redirectParam = new URLSearchParams(window.location.search).get('redirect')
    if (redirectParam && redirectParam.startsWith('/')) {
      setNextPath(redirectParam)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await register({ name, email, password, role })
      toast.success('Account created successfully!')
      router.push(nextPath)
      router.refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Signup failed. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="gradient-mesh min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -top-40 -left-40 float"></div>
        <div className="absolute w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 top-1/2 -right-40 float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back Button */}
      <Link href="/" className="absolute top-4 left-4 z-20">
        <Button variant="ghost" size="sm" className="text-foreground hover:bg-card/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </Link>

      {/* Signup Card */}
      <Card className="glass-card w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Code2 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Sign Up</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
            <p className="text-sm text-foreground/80">
              Select the role you want to create for this account.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-input/50 border-border/50 text-foreground placeholder:text-foreground/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input/50 border-border/50 text-foreground placeholder:text-foreground/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="bg-input/50 border-border/50 text-foreground">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input/50 border-border/50 text-foreground placeholder:text-foreground/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-foreground">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-input/50 border-border/50 text-foreground placeholder:text-foreground/50"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-foreground"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-foreground/60">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80">
              Login
            </Link>
          </p>
        </div>
      </Card>
    </main>
  )
}
