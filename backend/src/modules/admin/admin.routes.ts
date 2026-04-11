import { Router } from "express"

import { requireAuth } from "../../middleware/auth.middleware"
import { requireRole } from "../../middleware/role.middleware"
import { validate } from "../../middleware/validate.middleware"
import {
  deleteUserController,
  getAdminAnalyticsController,
  listUsersController,
  updateUserRoleController,
} from "./admin.controller"
import {
  listUsersQuerySchema,
  userIdParamSchema,
  updateUserRoleParamsSchema,
  updateUserRoleSchema,
} from "./admin.dto"

const adminRouter = Router()

adminRouter.use(requireAuth, requireRole("admin"))

adminRouter.get("/users", validate(listUsersQuerySchema, "query"), listUsersController)
adminRouter.patch(
  "/users/:id/role",
  validate(updateUserRoleParamsSchema, "params"),
  validate(updateUserRoleSchema),
  updateUserRoleController
)
adminRouter.delete("/users/:id", validate(userIdParamSchema, "params"), deleteUserController)
adminRouter.get("/analytics", getAdminAnalyticsController)

export { adminRouter }
