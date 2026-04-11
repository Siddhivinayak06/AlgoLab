import { app } from "./app"
import { connectToDatabase } from "./config/db"
import { env } from "./config/env"

async function bootstrap() {
  await connectToDatabase()

  app.listen(env.PORT, () => {
    console.log(`Backend API listening on port ${env.PORT}`)
  })
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error)
  process.exit(1)
})
