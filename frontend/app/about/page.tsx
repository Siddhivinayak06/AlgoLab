'use client'

import React from 'react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { Card } from '@/components/ui/card'
import { Code2, Users, BookOpen, Award } from 'lucide-react'

export default function AboutPage() {
  const teamMembers = [
    { name: 'Member 1', rollNo: 'XXXXXX' },
    { name: 'Member 2', rollNo: 'XXXXXX' },
    { name: 'Member 3', rollNo: 'XXXXXX' },
    { name: 'Member 4', rollNo: 'XXXXXX' },
  ]

  return (
    <WorkspaceShell
      title="About the Development Team"
      description="College submission details for AlgoLab and the FENRIR development team."
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
            <h2 className="text-2xl font-bold text-foreground">Team Name: FENRIR</h2>
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

          <div className="space-y-6 text-foreground/80">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Objective</h3>
              <p>
                The Algorithm Performance Analyzer is an interactive educational platform designed to help students visually understand algorithm efficiency and complexity through hands-on demonstrations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Interactive algorithm visualizations with real-time metrics</li>
                <li>Algorithm racing mode for comparative analysis</li>
                <li>Performance analysis with complexity curves</li>
                <li>Image pixel sorting with sorting algorithms</li>
                <li>PDF lab report generation</li>
                <li>Role-based user authentication (Student/Admin)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">Technology Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-input/30 rounded">
                  <p className="font-mono text-primary text-sm">Next.js 14</p>
                </div>
                <div className="text-center p-3 bg-input/30 rounded">
                  <p className="font-mono text-accent text-sm">React 18</p>
                </div>
                <div className="text-center p-3 bg-input/30 rounded">
                  <p className="font-mono text-secondary text-sm">Node.js</p>
                </div>
                <div className="text-center p-3 bg-input/30 rounded">
                  <p className="font-mono text-primary text-sm">Express.js</p>
                </div>
                <div className="text-center p-3 bg-input/30 rounded">
                  <p className="font-mono text-accent text-sm">MongoDB</p>
                </div>
                <div className="text-center p-3 bg-input/30 rounded">
                  <p className="font-mono text-secondary text-sm">Tailwind CSS</p>
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

          <div className="space-y-4 text-foreground/80">
            <div className="flex gap-4">
              <div className="text-primary font-bold">✓</div>
              <p>Understanding of various sorting algorithms and their time complexities</p>
            </div>
            <div className="flex gap-4">
              <div className="text-accent font-bold">✓</div>
              <p>Full-stack web development with modern JavaScript frameworks</p>
            </div>
            <div className="flex gap-4">
              <div className="text-secondary font-bold">✓</div>
              <p>Database design and management with MongoDB</p>
            </div>
            <div className="flex gap-4">
              <div className="text-primary font-bold">✓</div>
              <p>User authentication and authorization implementation</p>
            </div>
            <div className="flex gap-4">
              <div className="text-accent font-bold">✓</div>
              <p>Data visualization and performance analysis techniques</p>
            </div>
          </div>
        </Card>
      </div>
    </WorkspaceShell>
  )
}
