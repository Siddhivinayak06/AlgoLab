'use client'

import React, { useState } from 'react'
import { AlgorithmVisualizer } from '@/components/algorithm-visualizer'
import { ALGORITHM_THEORY, ALGORITHM_CODE, ALGORITHM_QUIZ } from './theory-data'
import { AlgorithmPageLayout } from '@/components/algorithm-page-layout'

type SupportedAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap' | 'shell' | 'counting' | 'radix' | 'bucket'

const ALGORITHM_NAMES: Record<SupportedAlgorithm, string> = {
  bubble: 'Bubble Sort',
  selection: 'Selection Sort',
  insertion: 'Insertion Sort',
  merge: 'Merge Sort',
  quick: 'Quick Sort',
  heap: 'Heap Sort',
  shell: 'Shell Sort',
  counting: 'Counting Sort',
  radix: 'Radix Sort',
  bucket: 'Bucket Sort',
}



export default function VisualizerPage() {
  const [algorithm, setAlgorithm] = useState<string>('bubble')
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <AlgorithmPageLayout
      categoryName="Sorting Algorithms"
      categoryBadgeClass="bg-purple-900/40 text-purple-400 border-purple-700/50 hover:bg-purple-900/50"
      themeAccent="purple"
      algorithms={ALGORITHM_NAMES}
      theoryData={ALGORITHM_THEORY}
      codeData={ALGORITHM_CODE as any}
      quizData={ALGORITHM_QUIZ}
      activeAlgorithm={algorithm}
      onAlgorithmChange={setAlgorithm}
      visualizerContent={
        <AlgorithmVisualizer
          guideOpen={isGuideOpen}
          onGuideOpenChange={setIsGuideOpen}
          hideGuideToggle
          algorithm={algorithm as SupportedAlgorithm}
          onAlgorithmChange={(v) => setAlgorithm(v)}
        />
      }
    />
  )
}
