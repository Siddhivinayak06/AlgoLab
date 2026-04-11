import { Router } from "express"

import { requireAuth } from "../../middleware/auth.middleware"
import { validate } from "../../middleware/validate.middleware"
import {
  loginController,
  logoutController,
  meController,
  refreshController,
  signupController,
} from "./auth.controller"
import { loginSchema, signupSchema } from "./auth.dto"

const authRouter = Router()

authRouter.post("/signup", validate(signupSchema), signupController)
authRouter.post("/register", validate(signupSchema), signupController)
authRouter.post("/login", validate(loginSchema), loginController)
authRouter.post("/refresh", refreshController)
authRouter.post("/logout", requireAuth, logoutController)
authRouter.get("/me", requireAuth, meController)

export { authRouter }
