import { z } from "zod"

import { USER_ROLES } from "../../constants/roles"

export const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(USER_ROLES).default("student"),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export type SignupDto = z.infer<typeof signupSchema>
export type LoginDto = z.infer<typeof loginSchema>
export type RefreshDto = z.infer<typeof refreshSchema>
