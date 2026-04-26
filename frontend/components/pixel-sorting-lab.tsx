'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  shufflePixels,
  sortPixelsByBrightness,
  sortPixelsByHue,
  type PixelData,
} from '@/lib/pixel-sorting'
import { toast } from 'sonner'
import { Play, Upload, Download, RotateCcw } from 'lucide-react'

export function PixelSortingLab() {
  const [imageInfo, setImageInfo] = useState<{
    name: string
    width: number
    height: number
  } | null>(null)
  const [basePixels, setBasePixels] = useState<PixelData[] | null>(null)
  const [shuffledPixels, setShuffledPixels] = useState<PixelData[] | null>(null)
  const [sortedPixels, setSortedPixels] = useState<PixelData[] | null>(null)
  const [sortMethod, setSortMethod] = useState<'brightness' | 'hue'>('brightness')
  const [isSorting, setIsSorting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Scale down image if too large (e.g., pixel sorting is slow)
      let targetWidth = img.width
      let targetHeight = img.height
      const maxPixels = 100 * 100 // 10,000 pixels limit for fast sorting

      if (img.width * img.height > maxPixels) {
        const ratio = Math.sqrt(maxPixels / (img.width * img.height))
        targetWidth = Math.floor(img.width * ratio)
        targetHeight = Math.floor(img.height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
      const data = imageData.data
      const pixels: PixelData[] = []

      for (let i = 0; i < data.length; i += 4) {
        pixels.push({
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
          a: data[i + 3],
        })
      }

      setImageInfo({
        name: file.name,
        width: targetWidth,
        height: targetHeight,
      })
      setBasePixels(pixels)
      setSortedPixels(null)
      setProgress(0)

      const shuffled = shufflePixels(pixels)
      setShuffledPixels(shuffled)
      drawPixels(shuffled, targetWidth, targetHeight)

      toast.success('Image loaded successfully')
    } catch (error) {
      toast.error('Image load failed')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const drawPixels = (pixels: PixelData[], width: number, height: number) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')!
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    pixels.forEach((pixel, i) => {
      const idx = i * 4
      data[idx] = pixel.r
      data[idx + 1] = pixel.g
      data[idx + 2] = pixel.b
      data[idx + 3] = pixel.a
    })

    ctx.putImageData(imageData, 0, 0)
  }

  const handleSortPixels = async () => {
    if (!imageInfo || !shuffledPixels) return

    setIsSorting(true)
    setProgress(0)

    try {
      let sorted
      if (sortMethod === 'brightness') {
        sorted = await sortPixelsByBrightness(shuffledPixels, setProgress)
      } else {
        sorted = await sortPixelsByHue(shuffledPixels, setProgress)
      }

      setSortedPixels(sorted)
      drawPixels(sorted, imageInfo.width, imageInfo.height)
    } catch (error) {
      console.error('Sorting failed:', error)
    } finally {
      setIsSorting(false)
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.href = canvasRef.current.toDataURL()
    link.download = `pixel-sorted-${sortMethod}.png`
    link.click()
  }

  const handleReset = () => {
    if (!imageInfo || !basePixels) return

    const shuffled = shufflePixels(basePixels)
    setShuffledPixels(shuffled)
    drawPixels(shuffled, imageInfo.width, imageInfo.height)

    setSortedPixels(null)
    setProgress(0)
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="glass-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upload Image</h3>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-primary hover:bg-primary/90 text-foreground w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Choose Image'}
        </Button>

        {imageInfo && (
          <p className="text-sm text-foreground/60 mt-3">
            Image: {imageInfo.name} ({imageInfo.width}x{imageInfo.height}px)
          </p>
        )}
      </Card>

      {/* Sorting Controls */}
      {imageInfo && (
        <Card className="glass-card space-y-4">
          <div>
            <Label className="text-foreground mb-2">Sort Method</Label>
            <Select value={sortMethod} onValueChange={(v: any) => setSortMethod(v)}>
              <SelectTrigger className="bg-input/50 border-border/50 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                <SelectItem value="brightness">By Brightness</SelectItem>
                <SelectItem value="hue">By Hue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleSortPixels}
              disabled={isSorting}
              className="bg-primary hover:bg-primary/90 text-foreground flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              {isSorting ? `Sorting... ${progress}%` : 'Start Sorting'}
            </Button>

            {sortedPixels && (
              <>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-border/50 text-foreground hover:bg-card/50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-border/50 text-foreground hover:bg-card/50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Canvas */}
      <Card className="glass-card overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-h-96 mx-auto"
          style={{ maxWidth: '600px' }}
        />
      </Card>

      {/* Info */}
      <Card className="glass-card">
        <h3 className="text-lg font-semibold text-foreground mb-3">How It Works</h3>
        <div className="space-y-2 text-sm text-foreground/70">
          <p>
            1. Upload a small image (recommended: under 100x100 pixels for faster results)
          </p>
          <p>
            2. The app extracts all pixel colors and shuffles them randomly
          </p>
          <p>
            3. Watch as a sorting algorithm rearranges pixels by brightness or hue
          </p>
          <p>
            4. Download the sorted image to see the artistic result
          </p>
        </div>
      </Card>
    </div>
  )
}
