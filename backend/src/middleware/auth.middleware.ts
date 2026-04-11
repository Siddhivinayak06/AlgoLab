import { NextFunction, Request, Response } from "express"

import { verifyAccessToken } from "../config/jwt"
import { AppError } from "../utils/http-error"

function readAccessToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }

  if (typeof req.cookies?.accessToken === "string") {
    return req.cookies.accessToken
  }

  return undefined
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const accessToken = readAccessToken(req)

  if (!accessToken) {
    return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"))
  }

  try {
    const payload = verifyAccessToken(accessToken)
    req.user = {
      userId: payload.userId,
      role: payload.role,
    }
    return next()
  } catch (_error) {
    return next(new AppError("Invalid or expired access token", 401, "INVALID_TOKEN"))
  }
}
