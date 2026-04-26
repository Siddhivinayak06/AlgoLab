'use client'

import React, { useState } from 'react'
import { BacktrackingVisualizer } from '@/components/backtracking-visualizer'
import { AlgorithmPageLayout } from '@/components/algorithm-page-layout'
import { BACKTRACKING_THEORY, BACKTRACKING_NAMES, BACKTRACKING_CODE, BACKTRACKING_QUIZ } from './theory-data'

type BacktrackingAlgorithm = 'n-queens' | 'sum-of-subsets' | 'graph-coloring' | 'tsp'

export default function BacktrackingPage() {
  const [algorithm, setAlgorithm] = useState<string>('n-queens')
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <AlgorithmPageLayout
      categoryName="Backtracking Algorithms"
      categoryBadgeClass="bg-pink-900/40 text-pink-400 border-pink-700/50 hover:bg-pink-900/50"
      themeAccent="pink"
      algorithms={BACKTRACKING_NAMES}
      theoryData={BACKTRACKING_THEORY}
      codeData={BACKTRACKING_CODE as any}
      quizData={BACKTRACKING_QUIZ}
      activeAlgorithm={algorithm}
      onAlgorithmChange={setAlgorithm}
      visualizerContent={
        <BacktrackingVisualizer
          guideOpen={isGuideOpen}
          onGuideOpenChange={setIsGuideOpen}
          hideGuideToggle
          algorithm={algorithm as BacktrackingAlgorithm}
          onAlgorithmChange={(v) => setAlgorithm(v)}
        />
      }
    />
  )
}
