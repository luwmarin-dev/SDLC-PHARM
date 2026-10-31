import express from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import { isTest } from "../env.ts"
import { errorHandler } from "./middleware/errorHandler.ts"
import resourceRoutes from "./routes/resourceRoutes.ts"
import authRoutes from "./routes/authRoutes.ts"

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(morgan('dev', {
  skip: () => isTest(),
}))

const apiRouter = express.Router()

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: "ok",
    service: "tes-hub-backend",
    timestamp: new Date().toISOString()
  })
})

// Resources routes
apiRouter.use('/resources', resourceRoutes)

// Auth routes
apiRouter.use('/auth', authRoutes)

// Mount routers to /api
app.use('/api', apiRouter)

// Global error handler
app.use(errorHandler)

export default app
export { app, apiRouter }
