import { Router } from "express"

import { requireAuth } from "../../middleware/auth.middleware"
import { requireRole } from "../../middleware/role.middleware"
import { validate } from "../../middleware/validate.middleware"
import {
  createReportController,
  deleteReportController,
  downloadReportController,
  generateReportController,
  getReportController,
  listReportsController,
} from "./reports.controller"
import {
  createReportSchema,
  generateReportParamsSchema,
  listReportsQuerySchema,
  reportIdParamSchema,
} from "./reports.dto"

const reportsRouter = Router()

reportsRouter.use(requireAuth, requireRole("student", "instructor", "admin"))

reportsRouter.post("/", validate(createReportSchema), createReportController)

reportsRouter.post(
  "/experiments/:experimentId/pdf",
  validate(generateReportParamsSchema, "params"),
  generateReportController
)
reportsRouter.get("/", validate(listReportsQuerySchema, "query"), listReportsController)
reportsRouter.get("/:reportId", validate(reportIdParamSchema, "params"), getReportController)
reportsRouter.get(
  "/:reportId/download",
  validate(reportIdParamSchema, "params"),
  downloadReportController
)
reportsRouter.delete("/:reportId", validate(reportIdParamSchema, "params"), deleteReportController)

export { reportsRouter }
