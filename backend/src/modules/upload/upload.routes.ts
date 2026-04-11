import multer from "multer"
import { Router } from "express"

import { requireAuth } from "../../middleware/auth.middleware"
import { AppError } from "../../utils/http-error"
import { uploadImageController } from "./upload.controller"

const uploadRouter = Router()

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/jpg"])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new AppError("Only png, jpg, and jpeg are allowed", 400, "INVALID_FILE_TYPE"))
    }

    return callback(null, true)
  },
})

uploadRouter.post("/", requireAuth, upload.single("image"), uploadImageController)

export { uploadRouter }
