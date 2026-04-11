'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { downloadPDFReport } from '@/lib/pdf-generator'
import { Experiment } from '@/lib/experiment-tracker'
import { Download, FileText } from 'lucide-react'

interface ReportGeneratorProps {
  experiment: Experiment | null
}

export function ReportGenerator({ experiment }: ReportGeneratorProps) {
  if (!experiment) {
    return (
      <Card className="glass-card p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-foreground/30 mb-3" />
        <p className="text-foreground/60">Select an experiment to generate a report</p>
      </Card>
    )
  }

  const handleGenerateReport = () => {
    downloadPDFReport(experiment)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Generate Report</h3>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass p-3 rounded-lg">
              <p className="text-foreground/60 text-xs mb-1">Algorithm</p>
              <p className="font-semibold text-foreground">{experiment.algorithm}</p>
            </div>
            <div className="glass p-3 rounded-lg">
              <p className="text-foreground/60 text-xs mb-1">Array Size</p>
              <p className="font-semibold text-foreground">{experiment.arraySize}</p>
            </div>
            <div className="glass p-3 rounded-lg">
              <p className="text-foreground/60 text-xs mb-1">Time</p>
              <p className="font-semibold text-primary">{experiment.executionTime}ms</p>
            </div>
            <div className="glass p-3 rounded-lg">
              <p className="text-foreground/60 text-xs mb-1">Comparisons</p>
              <p className="font-semibold text-accent">{experiment.comparisons}</p>
            </div>
          </div>
        </div>

        <div className="bg-input/20 p-4 rounded-lg mb-6">
          <p className="text-sm text-foreground/70">
            This report will include detailed analysis of the algorithm&apos;s performance, 
            complexity explanation, and metrics breakdown. You can print it directly from your browser.
          </p>
        </div>

        <Button
          onClick={handleGenerateReport}
          className="w-full bg-primary hover:bg-primary/90 text-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Generate & Download Report
        </Button>
      </Card>
    </motion.div>
  )
}
