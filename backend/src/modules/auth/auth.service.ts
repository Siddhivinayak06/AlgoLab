import bcrypt from "bcryptjs"

import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../config/jwt"
import { UserRole } from "../../constants/roles"
import { UserModel } from "../users/user.model"
import { LoginDto, SignupDto } from "./auth.dto"

import { AppError } from "../../utils/http-error"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthResult {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

function toAuthUser(user: {
  _id: unknown
  name: string
  email: string
  role: UserRole
}): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  }
}

async function createSession(user: {
  _id: unknown
  role: UserRole
  name: string
  email: string
  refreshTokenHash?: string | null
  save: () => Promise<unknown>
}): Promise<AuthResult> {
  const payload = {
    userId: String(user._id),
    role: user.role,
  }

  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

  user.refreshTokenHash = refreshTokenHash
  await user.save()

  return {
    user: toAuthUser(user),
    accessToken,
    refreshToken,
  }
}

export async function signup(input: SignupDto): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim()

  const existingUser = await UserModel.findOne({ email })
  if (existingUser) {
    throw new AppError("An account with this email already exists", 409, "EMAIL_ALREADY_EXISTS")
  }

  const passwordHash = await bcrypt.hash(input.password, 10)
  const user = await UserModel.create({
    name: input.name.trim(),
    email,
    passwordHash,
    role: input.role,
  })

  return createSession(user)
}

export async function login(input: LoginDto): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim()
  const user = await UserModel.findOne({ email })

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS")
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)
  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS")
  }

  return createSession(user)
}

export async function refreshSession(refreshToken: string): Promise<AuthResult> {
  let payload: { userId: string; role: UserRole }

  try {
    payload = verifyRefreshToken(refreshToken)
  } catch (_error) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN")
  }

  const user = await UserModel.findById(payload.userId)

  if (!user || !user.refreshTokenHash) {
    throw new AppError("Refresh token is no longer valid", 401, "INVALID_REFRESH_TOKEN")
  }

  const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash)

  if (!tokenMatches) {
    throw new AppError("Refresh token is no longer valid", 401, "INVALID_REFRESH_TOKEN")
  }

  return createSession(user)
}

export async function logout(userId: string): Promise<void> {
  await UserModel.findByIdAndUpdate(userId, { $set: { refreshTokenHash: null } })
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await UserModel.findById(userId)
  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND")
  }

  return toAuthUser(user)
}
