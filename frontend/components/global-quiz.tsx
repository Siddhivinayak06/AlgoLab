'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import type { QuizQuestion } from '@/components/algorithm-page-layout'

// Import all questions
import { ALGORITHM_QUIZ } from '@/app/visualizer/theory-data'
import { SEARCH_QUIZ } from '@/app/binary-search/theory-data'
import { DP_QUIZ } from '@/app/dp/theory-data'
import { GREEDY_QUIZ } from '@/app/greedy/theory-data'
import { GRAPH_QUIZ } from '@/app/graph/theory-data'
import { BACKTRACKING_QUIZ } from '@/app/backtracking/theory-data'
import { BRANCH_BOUND_QUIZ } from '@/app/branch-bound/theory-data'

function getAllQuestions(): QuizQuestion[] {
  const allQuizzes = [
    ...Object.values(ALGORITHM_QUIZ),
    ...Object.values(SEARCH_QUIZ),
    ...Object.values(DP_QUIZ),
    ...Object.values(GREEDY_QUIZ),
    ...Object.values(GRAPH_QUIZ),
    ...Object.values(BACKTRACKING_QUIZ),
    ...Object.values(BRANCH_BOUND_QUIZ),
  ]
  return allQuizzes.flat()
}

function getRandomQuestions(questions: QuizQuestion[], count: number = 10): QuizQuestion[] {
  const shuffled = [...questions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function GlobalQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const all = getAllQuestions()
    setQuestions(getRandomQuestions(all, 10))
  }, [])

  const handleRefresh = () => {
    const all = getAllQuestions()
    setQuestions(getRandomQuestions(all, 10))
    setAnswers({})
  }

  if (!isClient) return null

  const isComplete = Object.keys(answers).length === questions.length
  const score = Object.entries(answers).filter(
    ([qIdx, aIdx]) => questions[parseInt(qIdx)].answer === aIdx
  ).length

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">10-Question Random Quiz</h2>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="size-4" /> Generate New Quiz
        </Button>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <Card key={qIdx} className="p-6 bg-background/50 border-border/50 backdrop-blur-sm">
            <h3 className="font-semibold text-lg text-foreground mb-4">
              {qIdx + 1}. {q.question}
            </h3>
            <div className="space-y-3">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[qIdx] === oIdx
                const hasAnswered = answers[qIdx] !== undefined
                const isCorrect = hasAnswered && oIdx === q.answer
                const isWrongSelection = isSelected && !isCorrect

                return (
                  <div
                    key={oIdx}
                    onClick={() => {
                      if (!hasAnswered) {
                        setAnswers(prev => ({ ...prev, [qIdx]: oIdx }))
                      }
                    }}
                    className={cn(
                      "p-4 rounded-lg border transition-all flex justify-between items-center",
                      !hasAnswered ? "border-border/40 hover:bg-background/80 hover:border-border cursor-pointer" : "cursor-default",
                      isSelected && !hasAnswered ? "border-cyan-400/50 bg-cyan-950/20" : "",
                      hasAnswered && isCorrect ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-medium" : "",
                      hasAnswered && isWrongSelection ? "border-red-500/50 bg-red-500/10 text-red-500" : "",
                      hasAnswered && !isCorrect && !isWrongSelection ? "opacity-50" : ""
                    )}
                  >
                    <span>{opt}</span>
                    {hasAnswered && isCorrect && <CheckCircle className="size-5 text-emerald-500" />}
                    {hasAnswered && isWrongSelection && <XCircle className="size-5 text-red-500" />}
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      {isComplete && (
        <Card className="p-8 text-center bg-cyan-950/20 border-cyan-500/30">
          <h2 className="text-3xl font-black text-cyan-400 mb-2">Quiz Complete!</h2>
          <p className="text-xl text-foreground mb-6">
            You scored <span className="font-bold text-cyan-400">{score}</span> out of {questions.length}
          </p>
          <Button onClick={handleRefresh} size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
            Take Another Quiz
          </Button>
        </Card>
      )}
    </div>
  )
}
