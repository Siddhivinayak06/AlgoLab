import { z } from "zod"

export const createExperimentSchema = z.object({
  algorithm: z.string().min(1).max(50),
  mode: z.string().min(1).max(50).default("visualizer"),
  arraySize: z.number().int().positive(),
  executionTime: z.number().nonnegative(),
  comparisons: z.number().int().nonnegative(),
  operations: z.number().int().nonnegative(),
  dataType: z.string().min(1).max(50).default("random"),
  metadata: z.record(z.unknown()).optional(),
})

export const listExperimentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["newest", "fastest", "algorithm"]).default("newest"),
  algorithm: z.string().min(1).optional(),
  mode: z.string().min(1).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

export const experimentIdParamSchema = z.object({
  id: z.string().min(1),
})

export type CreateExperimentDto = z.infer<typeof createExperimentSchema>
export type ListExperimentsQueryDto = z.infer<typeof listExperimentsQuerySchema>
