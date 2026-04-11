import { z } from "zod"

import { USER_ROLES } from "../../constants/roles"

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const updateUserRoleParamsSchema = z.object({
  id: z.string().min(1),
})

export const userIdParamSchema = z.object({
  id: z.string().min(1),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(USER_ROLES),
})

export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>
export type UpdateUserRoleDto = z.infer<typeof updateUserRoleSchema>
export type UserIdParamDto = z.infer<typeof userIdParamSchema>
