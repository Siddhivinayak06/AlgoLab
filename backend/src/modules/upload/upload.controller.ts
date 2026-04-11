import { Request, Response } from "express"

import { asyncHandler } from "../../utils/async-handler"
import { AppError } from "../../utils/http-error"
import { extractPixelData } from "./upload.service"

export const uploadImageController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("Image file is required", 400, "FILE_REQUIRED")
  }

  const image = extractPixelData(req.file)

  return res.status(200).json({ image })
})
