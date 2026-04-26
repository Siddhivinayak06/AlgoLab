'use client'

import React, { useState } from 'react'
import { DPVisualizer } from '@/components/dp-visualizer'
import { AlgorithmPageLayout } from '@/components/algorithm-page-layout'
import { DP_THEORY, DP_NAMES, DP_CODE, DP_QUIZ } from './theory-data'

type DPAlgorithm = 'lcs' | 'knapsack-bottom-up' | 'knapsack-top-down'

export default function DPPage() {
  const [algorithm, setAlgorithm] = useState<string>('lcs')
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <AlgorithmPageLayout
      categoryName="Dynamic Programming"
      categoryBadgeClass="bg-emerald-900/40 text-emerald-400 border-emerald-700/50 hover:bg-emerald-900/50"
      themeAccent="emerald"
      algorithms={DP_NAMES}
      theoryData={DP_THEORY}
      codeData={DP_CODE}
      quizData={DP_QUIZ}
      activeAlgorithm={algorithm}
      onAlgorithmChange={setAlgorithm}
      visualizerContent={
        <DPVisualizer
          guideOpen={isGuideOpen}
          onGuideOpenChange={setIsGuideOpen}
          hideGuideToggle
          algorithm={algorithm as DPAlgorithm}
          onAlgorithmChange={(v) => setAlgorithm(v)}
        />
      }
    />
  )
}
