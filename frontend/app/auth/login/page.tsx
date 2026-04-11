'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage, login } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Code2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login({ email, password })
      toast.success('Login successful!')
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid credentials'))
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

      {/* Login Card */}
      <Card className="glass-card w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Code2 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-foreground"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center text-foreground/60">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </main>
  )
}
