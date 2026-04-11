import {
  createExperiment,
  deleteExperimentById,
  EXPERIMENTS_MAX_LIMIT,
  ExperimentPayload,
  ExperimentRecord,
  listExperiments,
} from './api'

export interface Experiment extends ExperimentRecord {}

interface ExperimentStats {
  totalExperiments: number
  averageTime: number
  fastestTime: number
  slowestTime: number
  algorithmCounts: Record<string, number>
}

interface AlgorithmStats {
  count: number
  averageTime: number
  averageComparisons: number
  averageOperations: number
  experiments: Experiment[]
}

interface ExperimentFilters {
  sortBy?: 'newest' | 'fastest' | 'algorithm'
  algorithm?: string
  mode?: string
}

export async function getExperiments(params?: {
  sortBy?: 'newest' | 'fastest' | 'algorithm'
  page?: number
  limit?: number
}): Promise<Experiment[]> {
  const response = await listExperiments({
    sortBy: params?.sortBy ?? 'newest',
    page: params?.page ?? 1,
    limit: params?.limit ?? 100,
  })

  return response.items
}

async function getAllExperiments(filters?: ExperimentFilters): Promise<Experiment[]> {
  const experiments: Experiment[] = []
  let page = 1

  while (true) {
    const response = await listExperiments({
      sortBy: filters?.sortBy ?? 'newest',
      algorithm: filters?.algorithm,
      mode: filters?.mode,
      page,
      limit: EXPERIMENTS_MAX_LIMIT,
    })

    experiments.push(...response.items)

    if (response.totalPages <= page) {
      break
    }

    page += 1
  }

  return experiments
}

export async function saveExperiment(experiment: ExperimentPayload): Promise<Experiment> {
  return createExperiment(experiment)
}

export async function deleteExperiment(id: string): Promise<void> {
  await deleteExperimentById(id)
}

export async function clearAllExperiments(): Promise<void> {
  const experiments = await getAllExperiments()
  await Promise.all(experiments.map((experiment) => deleteExperimentById(experiment.id)))
}

export async function getExperimentStats(): Promise<ExperimentStats> {
  const experiments = await getAllExperiments()

  if (experiments.length === 0) {
    return {
      totalExperiments: 0,
      averageTime: 0,
      fastestTime: 0,
      slowestTime: 0,
      algorithmCounts: {},
    }
  }

  const algorithmCounts: Record<string, number> = {}
  let totalTime = 0
  let minTime = Infinity
  let maxTime = -Infinity

  experiments.forEach((experiment) => {
    algorithmCounts[experiment.algorithm] = (algorithmCounts[experiment.algorithm] || 0) + 1
    totalTime += experiment.executionTime
    minTime = Math.min(minTime, experiment.executionTime)
    maxTime = Math.max(maxTime, experiment.executionTime)
  })

  return {
    totalExperiments: experiments.length,
    averageTime: Math.round(totalTime / experiments.length),
    fastestTime: minTime,
    slowestTime: maxTime,
    algorithmCounts,
  }
}

export async function getAlgorithmStats(algorithm: string): Promise<AlgorithmStats | null> {
  const experiments = await getAllExperiments({ algorithm })

  if (experiments.length === 0) {
    return null
  }

  const totalTime = experiments.reduce((sum, experiment) => sum + experiment.executionTime, 0)
  const totalComparisons = experiments.reduce(
    (sum, experiment) => sum + experiment.comparisons,
    0
  )
  const totalOperations = experiments.reduce(
    (sum, experiment) => sum + experiment.operations,
    0
  )

  return {
    count: experiments.length,
    averageTime: Math.round(totalTime / experiments.length),
    averageComparisons: Math.round(totalComparisons / experiments.length),
    averageOperations: Math.round(totalOperations / experiments.length),
    experiments,
  }
}
