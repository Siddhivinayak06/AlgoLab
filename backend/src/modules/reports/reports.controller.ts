import { Request, Response } from "express"

import { asyncHandler } from "../../utils/async-handler"
import { AppError } from "../../utils/http-error"
import { CreateReportDto, ListReportsQueryDto } from "./reports.dto"
import {
  deleteReport,
  downloadReport,
  generateExperimentReport,
  getReportById,
  listReports,
} from "./reports.service"

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED")
  }

  return req.user
}

export const generateReportController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const { experimentId } = req.params as { experimentId: string }

  const report = await generateExperimentReport(user.userId, user.role, experimentId)

  return res.status(201).json({ report })
})

export const createReportController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const { experimentId } = req.body as CreateReportDto

  const report = await generateExperimentReport(user.userId, user.role, experimentId)

  return res.status(201).json({ report })
})

export const listReportsController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const query = req.query as unknown as ListReportsQueryDto

  const result = await listReports(user.userId, user.role, query)

  return res.status(200).json(result)
})

export const getReportController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const { reportId } = req.params as { reportId: string }

  const report = await getReportById(user.userId, user.role, reportId)

  return res.status(200).json({ report })
})

export const downloadReportController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const { reportId } = req.params as { reportId: string }

  const report = await downloadReport(user.userId, user.role, reportId)

  res.setHeader("Content-Type", report.mimeType)
  res.setHeader("Content-Disposition", `attachment; filename=\"${report.fileName}\"`)

  return res.status(200).send(report.pdfData)
})

export const deleteReportController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const { reportId } = req.params as { reportId: string }

  await deleteReport(user.userId, user.role, reportId)

  return res.status(200).json({ message: "Report deleted" })
})
