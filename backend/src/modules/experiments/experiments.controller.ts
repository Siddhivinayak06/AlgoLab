import { Request, Response } from "express"

import { asyncHandler } from "../../utils/async-handler"
import { AppError } from "../../utils/http-error"
import { CreateExperimentDto, ListExperimentsQueryDto } from "./experiments.dto"
import {
  createExperiment,
  deleteExperiment,
  getExperimentById,
  getExperimentSummary,
  listAllExperiments,
  listExperiments,
} from "./experiments.service"

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED")
  }

  return req.user
}

export const createExperimentController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const body = req.body as CreateExperimentDto

  const experiment = await createExperiment(user.userId, body)

  return res.status(201).json({ experiment })
})

export const listExperimentsController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const query = req.query as unknown as ListExperimentsQueryDto

  const result = await listExperiments(user.userId, user.role, query)

  return res.status(200).json(result)
})

export const listAllExperimentsController = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListExperimentsQueryDto

  const result = await listAllExperiments(query)

  return res.status(200).json(result)
})

export const getExperimentController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const { id } = req.params as { id: string }

  const experiment = await getExperimentById(user.userId, user.role, id)

  return res.status(200).json({ experiment })
})

export const deleteExperimentController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const { id } = req.params as { id: string }

  await deleteExperiment(user.userId, user.role, id)

  return res.status(200).json({ message: "Experiment deleted" })
})

export const getExperimentSummaryController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)

  const summary = await getExperimentSummary(user.userId, user.role)

  return res.status(200).json({ summary })
})
