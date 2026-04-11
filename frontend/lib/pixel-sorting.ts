export interface PixelData {
  r: number
  g: number
  b: number
  a: number
}

export function imageToPixels(imageData: ImageData): PixelData[] {
  const pixels: PixelData[] = []
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: data[i + 3],
    })
  }

  return pixels
}

export function pixelsToImageData(pixels: PixelData[], width: number, height: number): ImageData {
  const canvas = new OffscreenCanvas(width, height)
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

  return imageData
}

export function shufflePixels(pixels: PixelData[]): PixelData[] {
  const shuffled = [...pixels]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getPixelBrightness(pixel: PixelData): number {
  return (pixel.r * 299 + pixel.g * 587 + pixel.b * 114) / 1000
}

export function getPixelHue(pixel: PixelData): number {
  const r = pixel.r / 255
  const g = pixel.g / 255
  const b = pixel.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return 0

  let h = 0
  if (max === r) {
    h = ((g - b) / (max - min) + (g < b ? 6 : 0)) / 6
  } else if (max === g) {
    h = ((b - r) / (max - min) + 2) / 6
  } else {
    h = ((r - g) / (max - min) + 4) / 6
  }

  return h * 360
}

export async function sortPixelsByBrightness(
  pixels: PixelData[],
  onProgress?: (progress: number) => void
): Promise<PixelData[]> {
  const sorted = [...pixels]
  const n = sorted.length

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const brightness1 = getPixelBrightness(sorted[j])
      const brightness2 = getPixelBrightness(sorted[j + 1])

      if (brightness1 > brightness2) {
        ;[sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]]
      }
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / (n - 1)) * 100))
    }

    // Yield to browser
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  return sorted
}

export async function sortPixelsByHue(
  pixels: PixelData[],
  onProgress?: (progress: number) => void
): Promise<PixelData[]> {
  const sorted = [...pixels].sort((a, b) => {
    return getPixelHue(a) - getPixelHue(b)
  })

  if (onProgress) {
    onProgress(100)
  }

  return sorted
}
