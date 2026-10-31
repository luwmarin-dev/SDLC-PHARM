import { app } from "./server.ts"
import env from "../env.ts"

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`\n==============================================`)
  console.log(`🚀 TES-Hub Backend API running on port ${env.PORT}`)
  console.log(`🌐 Base URL:      http://localhost:${env.PORT}`)
  console.log(`📋 Health Check:  http://localhost:${env.PORT}/api/health`)
  console.log(`🐘 Database:      Neon PostgreSQL Connected`)
  console.log(`==============================================\n`)
})
