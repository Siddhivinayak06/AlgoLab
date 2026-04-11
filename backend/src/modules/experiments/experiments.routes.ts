import { Router } from "express"

import { requireAuth } from "../../middleware/auth.middleware"
import { requireRole } from "../../middleware/role.middleware"
import { validate } from "../../middleware/validate.middleware"
import {
  createExperimentController,
  deleteExperimentController,
  getExperimentController,
  getExperimentSummaryController,
  listAllExperimentsController,
  listExperimentsController,
} from "./experiments.controller"
import {
  createExperimentSchema,
  experimentIdParamSchema,
  listExperimentsQuerySchema,
} from "./experiments.dto"

const experimentsRouter = Router()

experimentsRouter.use(requireAuth, requireRole("student", "instructor", "admin"))

experimentsRouter.get(
  "/all",
  requireRole("instructor", "admin"),
  validate(listExperimentsQuerySchema, "query"),
  listAllExperimentsController
)

experimentsRouter.post("/", validate(createExperimentSchema), createExperimentController)
experimentsRouter.get("/", validate(listExperimentsQuerySchema, "query"), listExperimentsController)
experimentsRouter.get("/summary", getExperimentSummaryController)
experimentsRouter.get("/:id", validate(experimentIdParamSchema, "params"), getExperimentController)
experimentsRouter.delete(
  "/:id",
  validate(experimentIdParamSchema, "params"),
  deleteExperimentController
)

export { experimentsRouter }
