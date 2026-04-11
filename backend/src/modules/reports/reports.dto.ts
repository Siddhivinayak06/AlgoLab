import { z } from "zod"

export const generateReportParamsSchema = z.object({
  experimentId: z.string().min(1),
})

export const createReportSchema = z.object({
  experimentId: z.string().min(1),
})

export const reportIdParamSchema = z.object({
  reportId: z.string().min(1),
})

export const listReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type GenerateReportParamsDto = z.infer<typeof generateReportParamsSchema>
export type CreateReportDto = z.infer<typeof createReportSchema>
export type ReportIdParamDto = z.infer<typeof reportIdParamSchema>
export type ListReportsQueryDto = z.infer<typeof listReportsQuerySchema>
