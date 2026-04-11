import type { ReactNode } from 'react'
import { CheckCircle2, Compass, Workflow } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RightInfoPanelProps {
  className?: string
  title?: string
  description?: string
  children?: ReactNode
}

const defaultPractices = [
  'Clear step-by-step controls',
  'Visual legend and color coding',
  'Consistent navigation layout',
  'Live metrics for performance',
  'Responsive mobile-first structure',
]

const defaultFlow = [
  'User Login',
  'Dashboard',
  'Visualizer / Racing / Analysis',
  'Run Experiments',
  'Save History',
  'Generate Reports',
]

export function RightInfoPanel({
  className,
  title = 'UX Guidance',
  description = 'Reference panel for expected AlgoLab flow and quality checks.',
  children,
}: RightInfoPanelProps) {
  return (
    <aside
      className={cn(
        'sticky top-24 space-y-4 rounded-2xl border border-border/40 bg-background/45 p-4 shadow-[0_8px_26px_rgba(0,0,0,0.16)] backdrop-blur-2xl',
        className
      )}
      aria-label="Page information"
    >
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <section className="rounded-xl border border-border/30 bg-background/35 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Compass className="size-3.5" />
          Best Practices
        </div>
        <ul className="space-y-2">
          {defaultPractices.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-foreground/85">
              <CheckCircle2 className="mt-0.5 size-3.5 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border/30 bg-background/35 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Workflow className="size-3.5" />
          UI Flow
        </div>
        <ol className="space-y-1.5 text-xs text-foreground/85">
          {defaultFlow.map((step, idx) => (
            <li key={step} className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/18 text-[10px] font-semibold text-primary">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {children}
    </aside>
  )
}
