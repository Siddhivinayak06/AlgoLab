import dotenv from "dotenv"
import { z } from "zod"

dotenv.config()

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars").optional(),
    JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars").optional(),
    JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
  })
  .refine((values) => Boolean(values.JWT_ACCESS_SECRET ?? values.JWT_SECRET), {
    message: "Either JWT_ACCESS_SECRET or JWT_SECRET must be configured",
    path: ["JWT_ACCESS_SECRET"],
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors)
  throw new Error("Invalid environment configuration")
}

export const env = {
  ...parsed.data,
  JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET ?? parsed.data.JWT_SECRET!,
}
