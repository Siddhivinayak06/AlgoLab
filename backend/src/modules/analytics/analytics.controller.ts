import { Request, Response } from "express"

import { asyncHandler } from "../../utils/async-handler"
import { AppError } from "../../utils/http-error"
import { BenchmarkRequestDto, PerformanceQueryDto } from "./analytics.dto"
import { getClassPerformanceSeries, getPerformanceSeries, runBenchmark } from "./analytics.service"

function requireUser(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED")
  }

  return req.user
}

export const getPerformanceSeriesController = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req)
  const query = req.query as unknown as PerformanceQueryDto

  const result = await getPerformanceSeries(user.userId, user.role, query)

  return res.status(200).json(result)
})

export const runBenchmarkController = asyncHandler(async (req: Request, res: Response) => {
  const _user = requireUser(req)
  const body = req.body as BenchmarkRequestDto

  const result = await runBenchmark(body)

  return res.status(200).json(result)
})

export const getClassPerformanceSeriesController = asyncHandler(async (req: Request, res: Response) => {
  const _user = requireUser(req)
  const query = req.query as unknown as PerformanceQueryDto

  const result = await getClassPerformanceSeries(query)

  return res.status(200).json(result)
})
