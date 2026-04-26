'use client'

import React, { useState } from 'react'
import { GraphVisualizer } from '@/components/graph-visualizer'
import { AlgorithmPageLayout } from '@/components/algorithm-page-layout'
import { GRAPH_THEORY, GRAPH_NAMES, GRAPH_CODE, GRAPH_QUIZ } from './theory-data'

type GraphAlgorithm = 'multistage' | 'bellman-ford' | 'floyd-warshall'

export default function GraphPage() {
  const [algorithm, setAlgorithm] = useState<string>('bellman-ford')
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <AlgorithmPageLayout
      categoryName="Graph Algorithms"
      categoryBadgeClass="bg-rose-900/40 text-rose-400 border-rose-700/50 hover:bg-rose-900/50"
      themeAccent="rose"
      algorithms={GRAPH_NAMES}
      theoryData={GRAPH_THEORY}
      codeData={GRAPH_CODE}
      quizData={GRAPH_QUIZ}
      activeAlgorithm={algorithm}
      onAlgorithmChange={setAlgorithm}
      visualizerContent={
        <GraphVisualizer
          guideOpen={isGuideOpen}
          onGuideOpenChange={setIsGuideOpen}
          hideGuideToggle
          algorithm={algorithm as GraphAlgorithm}
          onAlgorithmChange={(v) => setAlgorithm(v)}
        />
      }
    />
  )
}
