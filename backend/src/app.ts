import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import morgan from "morgan"

import { env } from "./config/env"
import { errorHandler, notFoundHandler } from "./middleware/error.middleware"
import { apiRouter } from "./routes"

const app = express()

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1)
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 200 : 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "RATE_LIMITED",
    message: "Too many requests, please try again later",
  },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === "production" ? 25 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: "AUTH_RATE_LIMITED",
    message: "Too many authentication attempts, please try again later",
  },
})

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((value) => value.trim()),
    credentials: true,
  })
)
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

app.use("/api", apiLimiter)
app.use("/api/auth", authLimiter)

app.use("/api", apiRouter)
app.use("/api/v1", apiRouter)
app.use(notFoundHandler)
app.use(errorHandler)

export { app }
