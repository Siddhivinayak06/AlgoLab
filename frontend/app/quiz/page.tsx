import React from 'react'
import { Metadata } from 'next'
import { GlobalQuiz } from '@/components/global-quiz'
import { WorkspaceShell } from '@/components/layout/workspace-shell'

export const metadata: Metadata = {
  title: 'Global Algorithm Quiz | AlgoLab',
  description: 'Test your knowledge across all algorithm categories with a randomized 10-question quiz.',
}

export default function QuizPage() {
  return (
    <WorkspaceShell
      title="Global Algorithm Quiz"
      description="Test your comprehensive algorithm knowledge. Each refresh provides a new set of 10 random questions."
      contentClassName="2xl:col-span-10 mx-auto w-full max-w-4xl"
    >
      <GlobalQuiz />
    </WorkspaceShell>
  )
}
