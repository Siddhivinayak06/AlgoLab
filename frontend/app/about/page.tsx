'use client'

import React from 'react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { Card } from '@/components/ui/card'
import {
  BookOpen,
  Code2,
  Database,
  Gauge,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Award,
} from 'lucide-react'

export default function AboutPage() {
  const teamMembers = [
    { name: 'Nishan Menezes', rollNo: '1023202' },
    { name: 'Siddhivinayak Sawant', rollNo: '1023243' },
    { name: 'Reagan John Samuel', rollNo: '1023233' },
    { name: 'Aditya Patil', rollNo: '1023216' },
    { name: 'Sandra Kappani', rollNo: '1023238' },
    { name: 'Aanshi Thomas', rollNo: '1023265' },
  ]

  return (
    <WorkspaceShell
      title="About the Development Team"
      description="College submission details for AlgoLab and the AlgoArchitects development team."
    >
      <div className="space-y-8">
        <Card className="glass-card mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Institution & Course Details</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-foreground/85">
            <div className="rounded-lg border border-border/25 bg-background/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Institution</p>
              <p className="mt-1.5 font-semibold">Fr. C. Rodrigues Institute of Technology</p>
            </div>
            <div className="rounded-lg border border-border/25 bg-background/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Department</p>
              <p className="mt-1.5 font-semibold">Computer Engineering</p>
            </div>
            <div className="rounded-lg border border-border/25 bg-background/35 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subject</p>
              <p className="mt-1.5 font-semibold">Full Stack Development Laboratory</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-accent/20 rounded-lg">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Team Name: AlgoArchitects</h2>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/20">
            <table className="min-w-full text-sm">
              <thead className="bg-background/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Roll No</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={`${member.name}-${member.rollNo}`} className="border-t border-border/15">
                    <td className="px-4 py-3 text-foreground">{member.name}</td>
                    <td className="px-4 py-3 text-foreground/80">{member.rollNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="glass-card mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-secondary/20 rounded-lg">
              <Code2 className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Project Overview</h2>
          </div>

          <div className="space-y-6 text-foreground/90">
            <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-background/30 to-secondary/10 p-5">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Mission</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                    AlgoLab transforms algorithm learning from static theory into measurable practice through
                    visual execution, real-time metrics, and experiment-based comparison workflows.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Project Snapshot
              </h3>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                  <p className="text-xs text-muted-foreground">Core Modules</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">8+</p>
                  <p className="mt-1 text-xs text-foreground/70">Visualizer, Analytics, Reports, Admin</p>
                </div>
                <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                  <p className="text-xs text-muted-foreground">Algorithms</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">4+</p>
                  <p className="mt-1 text-xs text-foreground/70">Sorting and search workflows</p>
                </div>
                <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                  <p className="text-xs text-muted-foreground">User Roles</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">3</p>
                  <p className="mt-1 text-xs text-foreground/70">Student, Instructor, Admin</p>
                </div>
                <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                  <p className="text-xs text-muted-foreground">Primary Goal</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">Learning</p>
                  <p className="mt-1 text-xs text-foreground/70">Hands-on algorithm understanding</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-secondary" />
                  <h3 className="font-semibold text-foreground">What the Platform Delivers</h3>
                </div>
                <ul className="space-y-2 text-sm text-foreground/85">
                  <li>Step-controlled visualizers for sorting and binary search execution.</li>
                  <li>Dataset patterns for normal, nearly sorted, reverse, and edge-case inputs.</li>
                  <li>Live operational metrics: comparisons, swaps, operations, runtime, progress.</li>
                  <li>Experiment tracking and report-ready output for lab documentation.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Academic Relevance</h3>
                </div>
                <ul className="space-y-2 text-sm text-foreground/85">
                  <li>Maps theoretical complexity to observed behavior through controlled experiments.</li>
                  <li>Supports both faculty demonstrations and self-paced student exploration.</li>
                  <li>Promotes evidence-based reasoning with repeatable datasets and metrics.</li>
                  <li>Strengthens technical communication via reproducible experiment narratives.</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Technology Stack
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border border-border/25 bg-background/30 p-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="font-mono text-sm text-foreground">Next.js + React + TypeScript</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/25 bg-background/30 p-3">
                  <Database className="h-4 w-4 text-accent" />
                  <p className="font-mono text-sm text-foreground">Node.js + Express + MongoDB</p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/25 bg-background/30 p-3">
                  <Layers className="h-4 w-4 text-secondary" />
                  <p className="font-mono text-sm text-foreground">Tailwind CSS + Framer Motion</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/20 rounded-lg">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Learning Outcomes</h2>
          </div>

          <div className="space-y-4 text-foreground/90">
            <div className="rounded-xl border border-border/25 bg-background/30 p-4">
              <p className="text-sm leading-relaxed text-foreground/85">
                The project outcomes are aligned with both academic objectives and practical software engineering standards,
                ensuring students gain conceptual clarity as well as implementation confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-foreground">Algorithmic Mastery</p>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/85">
                  <li>Interpret algorithm flow with stepwise visual reasoning.</li>
                  <li>Compare best/average/worst behavior using controlled datasets.</li>
                  <li>Relate observed outcomes to complexity classes.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-accent" />
                  <p className="font-semibold text-foreground">Engineering Competence</p>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/85">
                  <li>Build full-stack workflows using modern frontend and backend tooling.</li>
                  <li>Implement secure role-based access and experiment persistence.</li>
                  <li>Design reusable components with maintainable architecture.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-secondary" />
                  <p className="font-semibold text-foreground">Analytical Thinking</p>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/85">
                  <li>Form hypotheses and test them with quantitative measurements.</li>
                  <li>Use metrics to evaluate trade-offs across algorithms.</li>
                  <li>Communicate results through structured experiment logs.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border/25 bg-background/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-foreground">Professional Practice</p>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/85">
                  <li>Apply version control and collaborative development workflows.</li>
                  <li>Document features and usage for reproducible learning outcomes.</li>
                  <li>Align implementation quality with production-grade standards.</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  )
}
