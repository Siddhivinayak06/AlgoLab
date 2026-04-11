import { Request, Response } from "express"

import { asyncHandler } from "../../utils/async-handler"
import { AppError } from "../../utils/http-error"
import { ListUsersQueryDto, UpdateUserRoleDto } from "./admin.dto"
import { deleteUser, getAdminAnalytics, listUsers, updateUserRole } from "./admin.service"

export const listUsersController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListUsersQueryDto

  const result = await listUsers(query)

  return res.status(200).json(result)
})

export const updateUserRoleController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string }
  const body = req.body as UpdateUserRoleDto

  const user = await updateUserRole(id, body)

  return res.status(200).json({ user })
})

export const deleteUserController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED")
  }

  const { id } = req.params as { id: string }

  await deleteUser(id, req.user.userId)

  return res.status(200).json({ message: "User deleted" })
})

export const getAdminAnalyticsController = asyncHandler(async (_req: Request, res: Response) => {
  const analytics = await getAdminAnalytics()

  return res.status(200).json({ analytics })
})
