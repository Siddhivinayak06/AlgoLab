import { Router } from "express"

import { adminRouter } from "../modules/admin/admin.routes"
import { analyticsRouter } from "../modules/analytics/analytics.routes"
import { authRouter } from "../modules/auth/auth.routes"
import { experimentsRouter } from "../modules/experiments/experiments.routes"
import { reportsRouter } from "../modules/reports/reports.routes"
import { uploadRouter } from "../modules/upload/upload.routes"

const apiRouter = Router()

apiRouter.use("/auth", authRouter)
apiRouter.use("/experiments", experimentsRouter)
apiRouter.use("/analytics", analyticsRouter)
apiRouter.use("/reports", reportsRouter)
apiRouter.use("/admin", adminRouter)
apiRouter.use("/upload-image", uploadRouter)

export { apiRouter }
