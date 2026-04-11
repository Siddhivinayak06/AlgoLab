import { NextFunction, Request, Response } from "express"

import { UserRole } from "../constants/roles"
import { AppError } from "../utils/http-error"

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403, "FORBIDDEN"))
    }

    return next()
  }
}
