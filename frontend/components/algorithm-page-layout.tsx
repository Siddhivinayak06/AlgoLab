import React, { useState } from 'react'
import { DashboardNav } from '@/components/dashboard-nav'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LayoutGrid } from 'lucide-react'

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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className={cn("mb-3", categoryBadgeClass)}>
              {categoryName}
            </Badge>
            <h1 className={cn("text-4xl font-black tracking-tight", theme.text)}>
              {algorithms[activeAlgorithm]}
            </h1>
          </div>
          
          <div className="flex flex-col gap-1.5 sm:min-w-[250px]">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <LayoutGrid className="size-3.5" /> Select Algorithm
            </label>
            <Select value={activeAlgorithm} onValueChange={(v) => onAlgorithmChange(v)}>
              <SelectTrigger className={cn("h-11 bg-background/50 border-border/50 transition-all font-medium text-foreground", theme.focus)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50">
                {Object.entries(algorithms).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="theory" className="w-full">
          <TabsList className="bg-transparent border-b border-border/40 w-full justify-start rounded-none p-0 h-auto gap-6 mb-6 overflow-x-auto overflow-y-hidden whitespace-nowrap">
            <TabsTrigger 
              value="theory" 
              className={cn("rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-all data-[state=active]:shadow-none", theme.active)}
            >
              Theory
            </TabsTrigger>
            <TabsTrigger 
              value="visualizer" 
              className={cn("rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-all data-[state=active]:shadow-none", theme.active)}
            >
              Visualizer
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className={cn("rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-all data-[state=active]:shadow-none", theme.active)}
            >
              Code
            </TabsTrigger>
            <TabsTrigger 
              value="quiz" 
              className={cn("rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-all data-[state=active]:shadow-none", theme.active)}
            >
              Quiz
            </TabsTrigger>
            <TabsTrigger 
              value="analysis" 
              className={cn("rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-all data-[state=active]:shadow-none", theme.active)}
            >
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theory" className="mt-0 outline-none">
            <div className="rounded-xl border border-border/40 bg-background/35 p-6 md:p-8 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-cyan-400 mb-3">Simple Explanation</h3>
                  <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                    {currentTheory.simpleExplanation}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">Real Life Example</h3>
                  <p className="text-foreground/80 leading-relaxed italic text-sm md:text-base">
                    {currentTheory.realLifeExample}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-purple-400 mb-3">Use Cases</h3>
                  <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                    {currentTheory.useCases}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-400 mb-3">Advantages</h3>
                    <ul className="list-disc list-inside space-y-1 text-foreground/80 text-sm md:text-base">
                      {currentTheory.advantages.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-400 mb-3">Disadvantages</h3>
                    <ul className="list-disc list-inside space-y-1 text-foreground/80 text-sm md:text-base">
                      {currentTheory.disadvantages.map((disadv, i) => (
                        <li key={i}>{disadv}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-background/80 p-6 border border-border/50">
                  <h3 className="text-base font-bold text-foreground mb-4">Complexities</h3>
                  <div className="space-y-4 font-mono text-sm md:text-base">
                    <p className="text-foreground/90">
                      Time: Best <span className="font-bold text-foreground">{currentTheory.timeComplexity.best}</span> | Avg <span className="font-bold text-foreground">{currentTheory.timeComplexity.average}</span> | Worst <span className="font-bold text-foreground">{currentTheory.timeComplexity.worst}</span>
                    </p>
                    <p className="text-foreground/90">
                      Space: <span className="font-bold text-foreground">{currentTheory.spaceComplexity}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualizer" className="mt-0 outline-none">
            <section className="rounded-xl border border-border/40 bg-background/35 p-5 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl sm:p-6">
              {visualizerContent}
            </section>
          </TabsContent>

          <TabsContent value="code" className="mt-0 outline-none">
            <section className="rounded-xl border border-border/40 bg-background/35 p-6 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
              <h3 className={cn("text-lg font-bold mb-4", theme.text)}>Implementation Code</h3>
              
              {isMultiLangCode ? (
                <Tabs value={activeCodeLang} onValueChange={setActiveCodeLang} className="w-full">
                  <TabsList className="bg-background/50 border-b border-border/40 w-full justify-start rounded-none p-0 h-auto gap-4 mb-4">
                    {Object.keys(currentCodeData).map(lang => (
                      <TabsTrigger 
                        key={lang}
                        value={lang} 
                        className={cn("rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium transition-all capitalize data-[state=active]:shadow-none", theme.active)}
                      >
                        {lang}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(currentCodeData).map(([lang, codeSnippet]) => (
                    <TabsContent key={lang} value={lang} className="mt-0 outline-none">
                      <div className="rounded-lg bg-background/80 border border-border/50 p-4 overflow-x-auto">
                        <pre className="text-sm font-mono text-foreground/90">
                          <code>{codeSnippet as string}</code>
                        </pre>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="rounded-lg bg-background/80 border border-border/50 p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-foreground/90">
                    <code>{singleLangCode}</code>
                  </pre>
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="quiz" className="mt-0 outline-none">
            <section className="rounded-xl border border-border/40 bg-background/35 p-6 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
              <h3 className={cn("text-lg font-bold mb-4", theme.text)}>Knowledge Check: {algorithms[activeAlgorithm]}</h3>
              <div className="space-y-6">
                {currentQuizData.map((q, qIdx) => (
                  <div key={qIdx} className="bg-background/50 rounded-lg p-5 border border-border/50">
                    <p className="font-medium text-foreground mb-4">{qIdx + 1}. {q.question}</p>
                    <div className="space-y-2">
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
                              "p-3 rounded-md border transition-colors",
                              !hasAnswered ? "border-border/40 hover:bg-background/80 cursor-pointer" : "cursor-default",
                              isSelected ? cn("border-border/50", theme.resultBg, theme.resultBorder) : "",
                              isCorrect ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 font-medium" : "",
                              isWrongSelection ? "border-red-500/50 bg-red-500/10 text-red-500" : "",
                            )}
                          >
                            {opt}
                            {isCorrect && <span className="ml-2 float-right">✓</span>}
                            {isWrongSelection && <span className="ml-2 float-right">✗</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
                
                {Object.keys(quizAnswers).length === currentQuizData.length && (
                  <div className={cn("mt-6 p-4 rounded-lg border text-center", theme.resultBg, theme.resultBorder)}>
                    <p className={cn("font-bold", theme.text)}>
                      You scored {Object.entries(quizAnswers).filter(([qIdx, aIdx]) => currentQuizData[parseInt(qIdx)].answer === aIdx).length} out of {currentQuizData.length}!
                    </p>
                    <Button 
                      variant="outline" 
                      className={cn("mt-4 border-border/50", theme.text, theme.hover)}
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
            <section className="rounded-xl border border-border/40 bg-background/35 p-6 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
               <h3 className="text-lg font-bold text-purple-400 mb-4">Performance Analysis</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background/50 rounded-lg p-5 border border-border/50 h-48 flex flex-col items-center justify-center">
                    <p className="text-muted-foreground mb-2">Time Complexity Graph</p>
                    <div className="w-full h-full bg-primary/5 rounded border border-primary/10 flex items-end justify-between px-4 pb-2">
                       <div className="w-1/6 bg-cyan-400/40 rounded-t h-[20%]"></div>
                       <div className="w-1/6 bg-cyan-400/50 rounded-t h-[40%]"></div>
                       <div className="w-1/6 bg-cyan-400/60 rounded-t h-[60%]"></div>
                       <div className="w-1/6 bg-cyan-400/80 rounded-t h-[80%]"></div>
                       <div className="w-1/6 bg-cyan-400 rounded-t h-[100%]"></div>
                    </div>
                  </div>
                  <div className="bg-background/50 rounded-lg p-5 border border-border/50">
                    <h4 className="font-bold text-foreground mb-2">Algorithm Behavior</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                      {currentTheory.simpleExplanation} This algorithm is particularly suited for scenarios matching: {currentTheory.useCases}
                    </p>
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between text-sm"><span>Memory Efficiency</span><span className="font-mono text-emerald-400">{currentTheory.spaceComplexity}</span></div>
                       <div className="w-full bg-border/50 rounded-full h-2"><div className="bg-emerald-400 h-2 rounded-full" style={{width: currentTheory.spaceComplexity === 'O(1)' ? '90%' : '40%'}}></div></div>
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
