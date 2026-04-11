import { CookieOptions, Request, Response } from "express"

import { env } from "../../config/env"
import { asyncHandler } from "../../utils/async-handler"
import { AppError } from "../../utils/http-error"
import { LoginDto, RefreshDto, SignupDto } from "./auth.dto"
import { getCurrentUser, login, logout, refreshSession, signup } from "./auth.service"

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api",
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function sendAuthResponse(res: Response, statusCode: number, data: Awaited<ReturnType<typeof login>>) {
  res.cookie("refreshToken", data.refreshToken, refreshCookieOptions)

  return res.status(statusCode).json({
    user: data.user,
    accessToken: data.accessToken,
  })
}

export const signupController = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as SignupDto
  const result = await signup(body)
  return sendAuthResponse(res, 201, result)
})

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginDto
  const result = await login(body)
  return sendAuthResponse(res, 200, result)
})

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const fromBody = (req.body as Partial<RefreshDto> | undefined)?.refreshToken
  const fromCookie = req.cookies?.refreshToken as string | undefined
  const refreshToken = fromBody ?? fromCookie

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400, "REFRESH_TOKEN_REQUIRED")
  }

  const result = await refreshSession(refreshToken)
  return sendAuthResponse(res, 200, result)
})

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED")
  }

  await logout(req.user.userId)
  res.clearCookie("refreshToken", refreshCookieOptions)

  return res.status(200).json({ message: "Logged out successfully" })
})

export const meController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED")
  }

  const user = await getCurrentUser(req.user.userId)
  return res.status(200).json({ user })
})
