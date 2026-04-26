'use client'

import React, { useState } from 'react'
import { BranchBoundVisualizer } from '@/components/branch-bound-visualizer'
import { AlgorithmPageLayout } from '@/components/algorithm-page-layout'
import { BRANCH_BOUND_THEORY, BRANCH_BOUND_NAMES, BRANCH_BOUND_CODE, BRANCH_BOUND_QUIZ } from './theory-data'

export default function BranchBoundPage() {
  const [algorithm, setAlgorithm] = useState<string>('15-puzzle')
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <AlgorithmPageLayout
      categoryName="Branch & Bound Algorithms"
      categoryBadgeClass="bg-teal-900/40 text-teal-400 border-teal-700/50 hover:bg-teal-900/50"
      themeAccent="teal"
      algorithms={BRANCH_BOUND_NAMES}
      theoryData={BRANCH_BOUND_THEORY}
      codeData={BRANCH_BOUND_CODE as any}
      quizData={BRANCH_BOUND_QUIZ}
      activeAlgorithm={algorithm}
      onAlgorithmChange={setAlgorithm}
      visualizerContent={
        <BranchBoundVisualizer
          guideOpen={isGuideOpen}
          onGuideOpenChange={setIsGuideOpen}
          hideGuideToggle
        />
      }
    />
  )
}
