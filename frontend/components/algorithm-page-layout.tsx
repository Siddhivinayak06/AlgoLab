import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardNav } from '@/components/dashboard-nav'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LayoutGrid, BookOpen, Play, Code2, HelpCircle, BarChart2, CheckCircle2, XCircle, Clock, Cpu, TrendingUp, Lightbulb, Target, ThumbsUp, ThumbsDown, Copy } from 'lucide-react'

const TAB_ITEMS = [
  { value: 'theory', label: 'Theory', icon: BookOpen },
  { value: 'visualizer', label: 'Visualizer', icon: Play },
  { value: 'code', label: 'Code', icon: Code2 },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'analysis', label: 'Analysis', icon: BarChart2 },
] as const

export type AlgorithmTheory = {
  simpleExplanation: string;
  realLifeExample: string;
  useCases: string;
  advantages: string[];
  disadvantages: string[];
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
};

export type ThemeColor = 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'blue' | 'pink' | 'teal';

export interface AlgorithmPageLayoutProps {
  categoryName: string;
  categoryBadgeClass?: string;
  themeAccent?: ThemeColor;
  algorithms: Record<string, string>; // e.g. { bubble: 'Bubble Sort' }
  theoryData: Record<string, AlgorithmTheory>;
  codeData?: Record<string, string | Record<string, string>>;
  quizData?: Record<string, QuizQuestion[]>;
  analysisData?: Record<string, any>;
  activeAlgorithm: string;
  onAlgorithmChange: (key: string) => void;
  visualizerContent: React.ReactNode;
}

export function AlgorithmPageLayout({
  categoryName,
  categoryBadgeClass = "bg-purple-900/40 text-purple-400 border-purple-700/50 hover:bg-purple-900/50",
  themeAccent = "cyan",
  algorithms,
  theoryData,
  codeData,
  quizData,
  analysisData,
  activeAlgorithm,
  onAlgorithmChange,
  visualizerContent,
}: AlgorithmPageLayoutProps) {
  const [focusMode, setFocusMode] = useState(false)
  const [activeCodeLang, setActiveCodeLang] = useState<string>('java')
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})

  const currentTheory = theoryData[activeAlgorithm] || {
    simpleExplanation: "No explanation provided.",
    realLifeExample: "No example provided.",
    useCases: "No use cases provided.",
    advantages: ["No data"],
    disadvantages: ["No data"],
    timeComplexity: { best: "?", average: "?", worst: "?" },
    spaceComplexity: "?"
  };

  const currentCodeData = codeData?.[activeAlgorithm];
  const isMultiLangCode = typeof currentCodeData === 'object' && currentCodeData !== null;
  const singleLangCode = typeof currentCodeData === 'string' ? currentCodeData : "// Code implementation coming soon...";

  const currentQuizData = quizData?.[activeAlgorithm] || [
    { question: `What is the worst-case time complexity for ${algorithms[activeAlgorithm]}?`, options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 0 },
    { question: `Is ${algorithms[activeAlgorithm]} an in-place algorithm?`, options: ['Yes', 'No'], answer: 0 }
  ];

  const themeClasses = {
    cyan: { text: "text-cyan-400", active: "data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-400 data-[state=active]:bg-cyan-950/20", focus: "focus:ring-cyan-400/40", resultBg: "bg-cyan-950/30", resultBorder: "border-cyan-400/30", hover: "hover:bg-cyan-950/50" },
    purple: { text: "text-purple-400", active: "data-[state=active]:border-purple-400 data-[state=active]:text-purple-400 data-[state=active]:bg-purple-950/20", focus: "focus:ring-purple-400/40", resultBg: "bg-purple-950/30", resultBorder: "border-purple-400/30", hover: "hover:bg-purple-950/50" },
    emerald: { text: "text-emerald-400", active: "data-[state=active]:border-emerald-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-950/20", focus: "focus:ring-emerald-400/40", resultBg: "bg-emerald-950/30", resultBorder: "border-emerald-400/30", hover: "hover:bg-emerald-950/50" },
    amber: { text: "text-amber-400", active: "data-[state=active]:border-amber-400 data-[state=active]:text-amber-400 data-[state=active]:bg-amber-950/20", focus: "focus:ring-amber-400/40", resultBg: "bg-amber-950/30", resultBorder: "border-amber-400/30", hover: "hover:bg-amber-950/50" },
    rose: { text: "text-rose-400", active: "data-[state=active]:border-rose-400 data-[state=active]:text-rose-400 data-[state=active]:bg-rose-950/20", focus: "focus:ring-rose-400/40", resultBg: "bg-rose-950/30", resultBorder: "border-rose-400/30", hover: "hover:bg-rose-950/50" },
    blue: { text: "text-blue-400", active: "data-[state=active]:border-blue-400 data-[state=active]:text-blue-400 data-[state=active]:bg-blue-950/20", focus: "focus:ring-blue-400/40", resultBg: "bg-blue-950/30", resultBorder: "border-blue-400/30", hover: "hover:bg-blue-950/50" },
    pink: { text: "text-pink-400", active: "data-[state=active]:border-pink-400 data-[state=active]:text-pink-400 data-[state=active]:bg-pink-950/20", focus: "focus:ring-pink-400/40", resultBg: "bg-pink-950/30", resultBorder: "border-pink-400/30", hover: "hover:bg-pink-950/50" },
    teal: { text: "text-teal-400", active: "data-[state=active]:border-teal-400 data-[state=active]:text-teal-400 data-[state=active]:bg-teal-950/20", focus: "focus:ring-teal-400/40", resultBg: "bg-teal-950/30", resultBorder: "border-teal-400/30", hover: "hover:bg-teal-950/50" },
  };

  const theme = themeClasses[themeAccent];

  return (
    <main className="gradient-mesh min-h-screen">
      <DashboardNav
        focusMode={focusMode}
        onFocusModeToggle={() => setFocusMode(prev => !prev)}
      />

      <div className={cn(
        'mx-auto px-3 pb-8 sm:px-4 lg:px-6 transition-all duration-300',
        focusMode ? 'max-w-[1800px] pt-4' : 'max-w-[1400px] pt-6',
      )}>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 text-xs font-semibold tracking-wide bg-primary/10 text-primary border-primary/25 hover:bg-primary/15">
              {categoryName}
            </Badge>
            <h1 className="text-4xl font-black tracking-tight text-gradient-primary">
              {algorithms[activeAlgorithm]}
            </h1>
          </div>
          
          <div className="flex flex-col gap-1.5 sm:min-w-[250px]">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <LayoutGrid className="size-3.5" /> Select Algorithm
            </label>
            <Select value={activeAlgorithm} onValueChange={(v) => onAlgorithmChange(v)}>
              <SelectTrigger className="h-11 bg-background/60 border-border/40 transition-all font-medium text-foreground rounded-xl hover:border-primary/30 focus:ring-2 focus:ring-primary/20 focus:border-primary/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/40 rounded-xl">
                {Object.entries(algorithms).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="theory" className="w-full">
          <TabsList className="tab-pill-bar w-full justify-start h-auto gap-1 mb-6 overflow-x-auto overflow-y-hidden whitespace-nowrap">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground data-[state=active]:tab-active-glow text-muted-foreground hover:text-foreground/80 hover:bg-foreground/[0.04] gap-2 border-none"
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                </TabsTrigger>
              )
            })
            }
          </TabsList>

          <TabsContent value="theory" className="mt-0 outline-none">
            <div className="glass-panel gradient-border-top p-6 md:p-8">
              <div className="space-y-8">
                <div>
                  <h3 className="section-heading text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="size-4 text-primary" /> Simple Explanation
                  </h3>
                  <p className="text-foreground/80 leading-relaxed text-sm md:text-base pl-3.5">
                    {currentTheory.simpleExplanation}
                  </p>
                </div>

                <div>
                  <h3 className="section-heading text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Target className="size-4 text-primary" /> Real Life Example
                  </h3>
                  <p className="text-foreground/70 leading-relaxed italic text-sm md:text-base pl-3.5 border-l-2 border-primary/15 ml-3.5 py-1">
                    {currentTheory.realLifeExample}
                  </p>
                </div>

                <div>
                  <h3 className="section-heading text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <Cpu className="size-4 text-primary" /> Use Cases
                  </h3>
                  <p className="text-foreground/80 leading-relaxed text-sm md:text-base pl-3.5">
                    {currentTheory.useCases}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15 p-5">
                    <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                      <ThumbsUp className="size-4" /> Advantages
                    </h3>
                    <ul className="space-y-2 text-foreground/80 text-sm md:text-base">
                      {currentTheory.advantages.map((adv, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-red-500/[0.04] border border-red-500/15 p-5">
                    <h3 className="text-base font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                      <ThumbsDown className="size-4" /> Disadvantages
                    </h3>
                    <ul className="space-y-2 text-foreground/80 text-sm md:text-base">
                      {currentTheory.disadvantages.map((disadv, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <XCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
                          <span>{disadv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-foreground/[0.02] border border-border/40 p-6">
                  <h3 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
                    <TrendingUp className="size-4 text-primary" /> Complexities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-background/60 border border-border/30 p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Best</p>
                      <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{currentTheory.timeComplexity.best}</p>
                    </div>
                    <div className="rounded-lg bg-background/60 border border-border/30 p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Average</p>
                      <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">{currentTheory.timeComplexity.average}</p>
                    </div>
                    <div className="rounded-lg bg-background/60 border border-border/30 p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Worst</p>
                      <p className="text-lg font-bold font-mono text-red-600 dark:text-red-400">{currentTheory.timeComplexity.worst}</p>
                    </div>
                    <div className="rounded-lg bg-background/60 border border-border/30 p-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Space</p>
                      <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">{currentTheory.spaceComplexity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualizer" className="mt-0 outline-none">
            <section className="glass-panel gradient-border-top p-5 sm:p-6">
              {visualizerContent}
            </section>
          </TabsContent>

          <TabsContent value="code" className="mt-0 outline-none">
            <section className="glass-panel gradient-border-top p-6">
              <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                <Code2 className="size-4 text-primary" /> Implementation Code
              </h3>
              
              {isMultiLangCode ? (
                <Tabs value={activeCodeLang} onValueChange={setActiveCodeLang} className="w-full">
                  <TabsList className="bg-foreground/[0.03] border border-border/30 w-fit justify-start rounded-xl p-1 h-auto gap-1 mb-4">
                    {Object.keys(currentCodeData).map(lang => (
                      <TabsTrigger 
                        key={lang}
                        value={lang} 
                        className="rounded-lg px-4 py-1.5 text-sm font-medium transition-all capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground border-none"
                      >
                        {lang}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(currentCodeData).map(([lang, codeSnippet]) => (
                    <TabsContent key={lang} value={lang} className="mt-0 outline-none">
                      <div className="rounded-xl bg-[#1e1e2e] dark:bg-[#0d0d14] border border-border/30 p-5 overflow-x-auto">
                        <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                          <code>{codeSnippet as string}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="rounded-xl bg-[#1e1e2e] dark:bg-[#0d0d14] border border-border/30 p-5 overflow-x-auto">
                  <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                    <code>{singleLangCode}</code>
                  </pre>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="quiz" className="mt-0 outline-none">
            <section className="glass-panel gradient-border-top p-6">
              <h3 className="text-lg font-bold mb-2 text-foreground flex items-center gap-2">
                <HelpCircle className="size-4 text-primary" /> Knowledge Check: {algorithms[activeAlgorithm]}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {Object.keys(quizAnswers).length} of {currentQuizData.length} answered
              </p>
              <div className="space-y-6">
                {currentQuizData.map((q, qIdx) => (
                  <div key={qIdx} className="rounded-xl bg-foreground/[0.02] border border-border/30 p-5">
                    <p className="font-medium text-foreground mb-4 flex items-start gap-2">
                      <span className="shrink-0 flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold">{qIdx + 1}</span>
                      <span>{q.question}</span>
                    </p>
                    <div className="space-y-2 pl-8">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        const hasAnswered = quizAnswers[qIdx] !== undefined;
                        const isCorrect = hasAnswered && oIdx === q.answer;
                        const isWrongSelection = isSelected && !isCorrect;
                        
                        return (
                          <div 
                            key={oIdx} 
                            onClick={() => !hasAnswered && setQuizAnswers(prev => ({...prev, [qIdx]: oIdx}))}
                            className={cn(
                              "p-3 rounded-xl border transition-all duration-200 flex items-center justify-between",
                              !hasAnswered ? "border-border/30 hover:bg-primary/[0.04] hover:border-primary/20 cursor-pointer" : "cursor-default",
                              isCorrect ? "border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-700 dark:text-emerald-400 font-medium" : "",
                              isWrongSelection ? "border-red-500/40 bg-red-500/[0.06] text-red-700 dark:text-red-400" : "",
                            )}
                          >
                            <span>{opt}</span>
                            {isCorrect && <CheckCircle2 className="size-4 text-emerald-500" />}
                            {isWrongSelection && <XCircle className="size-4 text-red-500" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
                
                {Object.keys(quizAnswers).length === currentQuizData.length && (
                  <div className="mt-6 p-5 rounded-xl border border-primary/20 bg-primary/[0.04] text-center">
                    <p className="font-bold text-foreground text-lg">
                      You scored {Object.entries(quizAnswers).filter(([qIdx, aIdx]) => currentQuizData[parseInt(qIdx)].answer === aIdx).length} out of {currentQuizData.length}!
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4 rounded-xl border-primary/25 text-primary hover:bg-primary/10"
                      onClick={() => setQuizAnswers({})}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-0 outline-none">
            <section className="glass-panel gradient-border-top p-6">
               <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                 <BarChart2 className="size-4 text-primary" /> Performance Analysis
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl bg-foreground/[0.02] border border-border/30 p-5 h-52 flex flex-col">
                    <p className="text-sm font-semibold text-foreground mb-3">Time Complexity Growth</p>
                    <div className="flex-1 bg-primary/[0.03] rounded-xl border border-border/20 flex items-end justify-between px-4 pb-3 pt-2 gap-2">
                       {[20, 40, 60, 80, 100].map((h, i) => (
                         <div key={i} className="flex-1 rounded-t-lg transition-all duration-500" style={{height: `${h}%`, background: `linear-gradient(180deg, rgba(99,102,241,${0.3 + i * 0.15}), rgba(139,92,246,${0.4 + i * 0.12}))`}} />
                       ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-foreground/[0.02] border border-border/30 p-5">
                    <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <Cpu className="size-4 text-primary" /> Algorithm Behavior
                    </h4>
                    <p className="text-sm text-foreground/70 leading-relaxed mb-5">
                      {currentTheory.simpleExplanation}
                    </p>
                    <div className="flex flex-col gap-3">
                       <div>
                         <div className="flex justify-between text-sm mb-1.5"><span className="text-muted-foreground">Memory Efficiency</span><span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{currentTheory.spaceComplexity}</span></div>
                         <div className="w-full bg-border/30 rounded-full h-2 overflow-hidden"><div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-700" style={{width: currentTheory.spaceComplexity === 'O(1)' ? '90%' : '40%'}} /></div>
                       </div>
                    </div>
                  </div>
               </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
