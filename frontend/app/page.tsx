'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Zap, BarChart3, Flame, Code2, GitBranch } from 'lucide-react'

export default function Home() {
  return (
    <main className="gradient-mesh min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -top-40 -left-40 float"></div>
        <div className="absolute w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 top-1/2 -right-40 float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 bottom-0 left-1/4 float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border/30 backdrop-blur-md bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Algorithm Analyzer</span>
          </div>
          <div className="flex gap-4">
            <Link href="/visualizer">
              <Button variant="ghost" className="text-foreground hover:bg-card/50">
                Visualizer
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-foreground">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-balance text-foreground">
            Visualize Algorithm
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Complexity & Performance
            </span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
            Master algorithm efficiency with interactive visualizations. Watch sorting algorithms compete, analyze performance metrics, and understand computational complexity in real-time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-foreground">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/visualizer">
              <Button size="lg" variant="outline" className="border-border/50 text-foreground hover:bg-card/50">
                Try Visualizer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">
          Powerful Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Algorithm Visualizer */}
          <Card className="glass-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Algorithm Visualizer
            </h3>
            <p className="text-foreground/60">
              Watch sorting algorithms in action with animated visualizations and real-time metrics tracking.
            </p>
          </Card>

          {/* Racing Mode */}
          <Card className="glass-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                <Flame className="w-6 h-6 text-accent" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Algorithm Racing
            </h3>
            <p className="text-foreground/60">
              Compare two algorithms side-by-side to see which performs better on the same dataset.
            </p>
          </Card>

          {/* Performance Analysis */}
          <Card className="glass-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-secondary/20 rounded-lg group-hover:bg-secondary/30 transition-colors">
                <BarChart3 className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Performance Graphs
            </h3>
            <p className="text-foreground/60">
              Analyze algorithm complexity with overlaid theoretical curves and empirical data.
            </p>
          </Card>

          {/* Dataset Generator */}
          <Card className="glass-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                <GitBranch className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Dataset Generator
            </h3>
            <p className="text-foreground/60">
              Create custom arrays or generate random datasets from 10 to 1000 elements.
            </p>
          </Card>

          {/* Image Pixel Sorting */}
          <Card className="glass-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
                <Code2 className="w-6 h-6 text-accent" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Image Pixel Sorting
            </h3>
            <p className="text-foreground/60">
              Upload images and sort pixels using algorithms to create artistic effects.
            </p>
          </Card>

          {/* PDF Reports */}
          <Card className="glass-card group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-secondary/20 rounded-lg group-hover:bg-secondary/30 transition-colors">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Lab Reports
            </h3>
            <p className="text-foreground/60">
              Generate detailed PDF reports with graphs and complexity analysis for your experiments.
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="glass-card">
            <p className="text-3xl font-bold text-primary mb-2">4+</p>
            <p className="text-foreground/60">Sorting Algorithms</p>
          </div>
          <div className="glass-card">
            <p className="text-3xl font-bold text-accent mb-2">5</p>
            <p className="text-foreground/60">Data Sizes</p>
          </div>
          <div className="glass-card">
            <p className="text-3xl font-bold text-secondary mb-2">∞</p>
            <p className="text-foreground/60">Learning</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 backdrop-blur-md bg-background/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-foreground/60">
          <p>Algorithm Performance Analyzer © 2024. Built with Next.js & React.</p>
        </div>
      </footer>
    </main>
  )
}
