import { NextFunction, Request, Response } from "express"
import { ZodTypeAny } from "zod"

import { AppError } from "../utils/http-error"

type RequestSource = "body" | "params" | "query"

export function validate(schema: ZodTypeAny, source: RequestSource = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[source])

    if (!parsed.success) {
      return next(
        new AppError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten().fieldErrors)
      )
    }

    ;(req as unknown as Record<string, unknown>)[source] = parsed.data
    return next()
  }
}
