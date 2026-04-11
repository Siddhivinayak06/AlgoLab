import { Router } from "express"

import { requireAuth } from "../../middleware/auth.middleware"
import { requireRole } from "../../middleware/role.middleware"
import { validate } from "../../middleware/validate.middleware"
import {
  getClassPerformanceSeriesController,
  getPerformanceSeriesController,
  runBenchmarkController,
} from "./analytics.controller"
import { benchmarkRequestSchema, performanceQuerySchema } from "./analytics.dto"

const analyticsRouter = Router()

analyticsRouter.use(requireAuth, requireRole("student", "instructor", "admin"))

analyticsRouter.get(
  "/performance",
  validate(performanceQuerySchema, "query"),
  getPerformanceSeriesController
)
analyticsRouter.get(
  "/class",
  requireRole("instructor", "admin"),
  validate(performanceQuerySchema, "query"),
  getClassPerformanceSeriesController
)
analyticsRouter.post("/benchmark", validate(benchmarkRequestSchema), runBenchmarkController)

export { analyticsRouter }
