'use client'

import React, { useState } from 'react'
import { BinarySearchVisualizer } from '@/components/binary-search-visualizer'
import { AlgorithmPageLayout } from '@/components/algorithm-page-layout'
import { SEARCH_THEORY, SEARCH_NAMES, SEARCH_CODE, SEARCH_QUIZ } from './theory-data'

type SearchAlgorithm = 'binary' | 'linear' | 'jump' | 'interpolation' | 'exponential' | 'fibonacci' | 'bfs' | 'dfs'

export default function BinarySearchPage() {
  const [algorithm, setAlgorithm] = useState<string>('binary')
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <AlgorithmPageLayout
      categoryName="Searching Algorithms"
      categoryBadgeClass="bg-blue-900/40 text-blue-400 border-blue-700/50 hover:bg-blue-900/50"
      themeAccent="blue"
      algorithms={SEARCH_NAMES}
      theoryData={SEARCH_THEORY}
      codeData={SEARCH_CODE}
      quizData={SEARCH_QUIZ}
      activeAlgorithm={algorithm}
      onAlgorithmChange={setAlgorithm}
      visualizerContent={
        <BinarySearchVisualizer
          guideOpen={isGuideOpen}
          onGuideOpenChange={setIsGuideOpen}
          hideGuideToggle
          algorithm={algorithm as SearchAlgorithm}
          onAlgorithmChange={(v) => setAlgorithm(v)}
        />
      }
    />
  )
}
