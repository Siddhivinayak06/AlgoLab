import jwt from "jsonwebtoken"

import { UserRole } from "../constants/roles"
import { env } from "./env"

export interface AuthTokenPayload {
  userId: string
  role: UserRole
}

interface RawAuthTokenPayload extends jwt.JwtPayload {
  userId?: string
  role?: UserRole
}

function asExpiresIn(value: string): jwt.SignOptions["expiresIn"] {
  return value as jwt.SignOptions["expiresIn"]
}

function normalizeTokenPayload(payload: RawAuthTokenPayload): AuthTokenPayload {
  const userId = payload.userId ?? (typeof payload.sub === "string" ? payload.sub : undefined)

  if (!userId || !payload.role) {
    throw new Error("Invalid token payload")
  }

  return {
    userId,
    role: payload.role,
  }
}

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign({ userId: payload.userId, role: payload.role, sub: payload.userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: asExpiresIn(env.JWT_ACCESS_EXPIRES_IN),
  })
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign({ userId: payload.userId, role: payload.role, sub: payload.userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: asExpiresIn(env.JWT_REFRESH_EXPIRES_IN),
  })
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as RawAuthTokenPayload
  return normalizeTokenPayload(payload)
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RawAuthTokenPayload
  return normalizeTokenPayload(payload)
}
