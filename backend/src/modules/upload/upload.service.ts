import jpeg from "jpeg-js"
import { PNG } from "pngjs"

import { AppError } from "../../utils/http-error"

export interface PixelValue {
  r: number
  g: number
  b: number
  a: number
}

export interface ParsedImageData {
  width: number
  height: number
  pixels: PixelValue[]
}

function parseRawImage(data: Uint8Array, width: number, height: number): ParsedImageData {
  const pixels: PixelValue[] = []

  for (let index = 0; index < data.length; index += 4) {
    pixels.push({
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3],
    })
  }

  return {
    width,
    height,
    pixels,
  }
}

export function extractPixelData(file: Express.Multer.File): ParsedImageData {
  if (file.mimetype === "image/png") {
    const png = PNG.sync.read(file.buffer)
    return parseRawImage(png.data, png.width, png.height)
  }

  if (file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
    const jpegImage = jpeg.decode(file.buffer, { useTArray: true })
    return parseRawImage(jpegImage.data, jpegImage.width, jpegImage.height)
  }

  throw new AppError("Unsupported file type", 400, "UNSUPPORTED_FILE_TYPE")
}
