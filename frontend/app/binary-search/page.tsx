'use client'

import React from 'react'
import { DashboardNav } from '@/components/dashboard-nav'
import { BinarySearchVisualizer } from '@/components/binary-search-visualizer'

export default function BinarySearchPage() {
  return (
    <main className="gradient-mesh min-h-screen">
      <DashboardNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Binary Search Visualizer
          </h1>
          <p className="text-foreground/60">
            Visualize binary search algorithm finding target values in sorted arrays
          </p>
        </div>

        <BinarySearchVisualizer />
      </div>
    </main>
  )
}
