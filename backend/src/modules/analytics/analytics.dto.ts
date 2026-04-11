import { z } from "zod"

export const performanceQuerySchema = z.object({
  algorithm: z.string().min(1).optional(),
  mode: z.string().min(1).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

export const benchmarkRequestSchema = z.object({
  algorithm: z.enum(["bubble", "quick", "merge", "binary"]),
  inputSizes: z.array(z.number().int().positive()).min(1).max(20),
  runs: z.coerce.number().int().min(1).max(20).default(3),
})

export type PerformanceQueryDto = z.infer<typeof performanceQuerySchema>
export type BenchmarkRequestDto = z.infer<typeof benchmarkRequestSchema>
