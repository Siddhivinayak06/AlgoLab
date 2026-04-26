'use client'

import React, { useState } from 'react'
import { GreedyVisualizer } from '@/components/greedy-visualizer'
import { AlgorithmPageLayout } from '@/components/algorithm-page-layout'
import { GREEDY_THEORY, GREEDY_NAMES, GREEDY_CODE, GREEDY_QUIZ } from './theory-data'

type GreedyAlgorithm = 'dijkstra' | 'fractional-knapsack' | 'job-scheduling' | 'prims' | 'kruskals'

export default function GreedyPage() {
  const [algorithm, setAlgorithm] = useState<string>('dijkstra')
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <AlgorithmPageLayout
      categoryName="Greedy Algorithms"
      categoryBadgeClass="bg-amber-900/40 text-amber-400 border-amber-700/50 hover:bg-amber-900/50"
      themeAccent="amber"
      algorithms={GREEDY_NAMES}
      theoryData={GREEDY_THEORY}
      codeData={GREEDY_CODE as any}
      quizData={GREEDY_QUIZ}
      activeAlgorithm={algorithm}
      onAlgorithmChange={setAlgorithm}
      visualizerContent={
        <GreedyVisualizer
          guideOpen={isGuideOpen}
          onGuideOpenChange={setIsGuideOpen}
          hideGuideToggle
          algorithm={algorithm as GreedyAlgorithm}
          onAlgorithmChange={(v) => setAlgorithm(v)}
        />
      }
    />
  )
}
