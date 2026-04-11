import { SortOrder, Types } from "mongoose"

import { UserRole } from "../../constants/roles"
import { AppError } from "../../utils/http-error"
import { CreateExperimentDto, ListExperimentsQueryDto } from "./experiments.dto"
import { ExperimentModel } from "./experiment.model"

function buildScopeFilter(userId: string, role: UserRole): Record<string, unknown> {
  if (role === "admin") {
    return {}
  }

  return { userId: new Types.ObjectId(userId) }
}

function buildSort(sortBy: ListExperimentsQueryDto["sortBy"]): Record<string, SortOrder> {
  switch (sortBy) {
    case "fastest":
      return { executionTime: 1 }
    case "algorithm":
      return { algorithm: 1, createdAt: -1 }
    case "newest":
    default:
      return { createdAt: -1 }
  }
}

export async function createExperiment(userId: string, input: CreateExperimentDto) {
  const experiment = await ExperimentModel.create({
    ...input,
    userId: new Types.ObjectId(userId),
  })

  return experiment.toObject()
}

export async function listExperiments(
  userId: string,
  role: UserRole,
  query: ListExperimentsQueryDto
) {
  const filter: Record<string, unknown> = {
    ...buildScopeFilter(userId, role),
  }

  if (query.algorithm) {
    filter.algorithm = query.algorithm
  }

  if (query.mode) {
    filter.mode = query.mode
  }

  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {
      ...(query.dateFrom ? { $gte: new Date(query.dateFrom) } : {}),
      ...(query.dateTo ? { $lte: new Date(query.dateTo) } : {}),
    }
  }

  const skip = (query.page - 1) * query.limit

  const [items, total] = await Promise.all([
    ExperimentModel.find(filter).sort(buildSort(query.sortBy)).skip(skip).limit(query.limit).lean(),
    ExperimentModel.countDocuments(filter),
  ])

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  }
}

export async function listAllExperiments(query: ListExperimentsQueryDto) {
  const filter: Record<string, unknown> = {}

  if (query.algorithm) {
    filter.algorithm = query.algorithm
  }

  if (query.mode) {
    filter.mode = query.mode
  }

  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {
      ...(query.dateFrom ? { $gte: new Date(query.dateFrom) } : {}),
      ...(query.dateTo ? { $lte: new Date(query.dateTo) } : {}),
    }
  }

  const skip = (query.page - 1) * query.limit

  const [items, total] = await Promise.all([
    ExperimentModel.find(filter).sort(buildSort(query.sortBy)).skip(skip).limit(query.limit).lean(),
    ExperimentModel.countDocuments(filter),
  ])

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  }
}

export async function getExperimentById(userId: string, role: UserRole, id: string) {
  const filter: Record<string, unknown> = {
    _id: id,
    ...buildScopeFilter(userId, role),
  }

  const experiment = await ExperimentModel.findOne(filter).lean()

  if (!experiment) {
    throw new AppError("Experiment not found", 404, "EXPERIMENT_NOT_FOUND")
  }

  return experiment
}

export async function deleteExperiment(userId: string, role: UserRole, id: string) {
  const filter: Record<string, unknown> = {
    _id: id,
    ...buildScopeFilter(userId, role),
  }

  const deleted = await ExperimentModel.findOneAndDelete(filter)

  if (!deleted) {
    throw new AppError("Experiment not found", 404, "EXPERIMENT_NOT_FOUND")
  }
}

export async function getExperimentSummary(userId: string, role: UserRole) {
  const match: Record<string, unknown> = {
    ...buildScopeFilter(userId, role),
  }

  const [summary] = await ExperimentModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalExperiments: { $sum: 1 },
        averageExecutionTime: { $avg: "$executionTime" },
        fastestExecutionTime: { $min: "$executionTime" },
        slowestExecutionTime: { $max: "$executionTime" },
        totalComparisons: { $sum: "$comparisons" },
        totalOperations: { $sum: "$operations" },
      },
    },
  ])

  return (
    summary ?? {
      totalExperiments: 0,
      averageExecutionTime: 0,
      fastestExecutionTime: 0,
      slowestExecutionTime: 0,
      totalComparisons: 0,
      totalOperations: 0,
    }
  )
}
