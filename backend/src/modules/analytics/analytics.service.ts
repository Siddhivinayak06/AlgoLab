import { Types } from "mongoose"

import { UserRole } from "../../constants/roles"
import { AppError } from "../../utils/http-error"
import { ExperimentModel } from "../experiments/experiment.model"
import { BenchmarkRequestDto, PerformanceQueryDto } from "./analytics.dto"

function buildScopeFilter(userId: string, role: UserRole): Record<string, unknown> {
  if (role === "admin") {
    return {}
  }

  return { userId: new Types.ObjectId(userId) }
}

function buildPerformanceMatch(base: Record<string, unknown>, query: PerformanceQueryDto) {
  const match: Record<string, unknown> = {
    ...base,
  }

  if (query.algorithm) {
    match.algorithm = query.algorithm
  }

  if (query.mode) {
    match.mode = query.mode
  }

  if (query.dateFrom || query.dateTo) {
    match.createdAt = {
      ...(query.dateFrom ? { $gte: new Date(query.dateFrom) } : {}),
      ...(query.dateTo ? { $lte: new Date(query.dateTo) } : {}),
    }
  }

  return match
}

async function aggregatePerformanceSeries(match: Record<string, unknown>) {
  const rows = await ExperimentModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          algorithm: "$algorithm",
          arraySize: "$arraySize",
        },
        avgExecutionTime: { $avg: "$executionTime" },
        avgComparisons: { $avg: "$comparisons" },
        avgOperations: { $avg: "$operations" },
        runs: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.algorithm": 1,
        "_id.arraySize": 1,
      },
    },
  ])

  const seriesMap = new Map<
    string,
    Array<{
      inputSize: number
      executionTime: number
      comparisons: number
      operations: number
      runs: number
    }>
  >()

  for (const row of rows) {
    const algorithm = row._id.algorithm as string
    if (!seriesMap.has(algorithm)) {
      seriesMap.set(algorithm, [])
    }

    seriesMap.get(algorithm)?.push({
      inputSize: row._id.arraySize as number,
      executionTime: Number(row.avgExecutionTime.toFixed(3)),
      comparisons: Math.round(row.avgComparisons),
      operations: Math.round(row.avgOperations),
      runs: row.runs as number,
    })
  }

  return {
    series: Array.from(seriesMap.entries()).map(([algorithm, points]) => ({
      algorithm,
      points,
    })),
  }
}

export async function getPerformanceSeries(
  userId: string,
  role: UserRole,
  query: PerformanceQueryDto
) {
  const match = buildPerformanceMatch(buildScopeFilter(userId, role), query)

  return aggregatePerformanceSeries(match)
}

export async function getClassPerformanceSeries(query: PerformanceQueryDto) {
  const match = buildPerformanceMatch({}, query)

  return aggregatePerformanceSeries(match)
}

export async function runBenchmark(_input: BenchmarkRequestDto) {
  throw new AppError(
    "Server-side benchmark runner is a planned extension. Use client benchmark flow for now.",
    501,
    "BENCHMARK_NOT_IMPLEMENTED"
  )
}
