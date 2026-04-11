'use client'

import React from 'react'
import { PixelSortingLab } from '@/components/pixel-sorting-lab'
import { WorkspaceShell } from '@/components/layout/workspace-shell'

export default function PixelSortPage() {
  return (
    <WorkspaceShell
      title="Pixel Sorting Lab"
      description="Upload an image, scramble pixels, and watch sorting algorithms reconstruct visual order."
      contentClassName="2xl:col-span-1"
    >
      <div className="mx-auto max-w-4xl">
        <PixelSortingLab />
      </div>
    </WorkspaceShell>
  )
}
