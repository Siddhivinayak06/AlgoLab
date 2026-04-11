import { NextFunction, Request, Response } from "express"
import multer from "multer"

import { AppError } from "../utils/http-error"

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"))
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        code: "FILE_TOO_LARGE",
        message: "File size must be 2MB or less",
      })
    }

    return res.status(400).json({
      code: "UPLOAD_ERROR",
      message: error.message,
    })
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details,
    })
  }

  console.error("Unhandled error", error)

  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  })
}
