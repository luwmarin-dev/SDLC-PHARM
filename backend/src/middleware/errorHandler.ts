import type { NextFunction, Request, Response } from "express"
import { env } from "../../env.ts"

export class APIError extends Error {
  status: number
  name: string
  message: string
  constructor(message: string, name = "APIError", status = 500) {
    super(message)
    this.message = message
    this.name = name
    this.status = status
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (env.APP_STAGE === 'dev') {
    console.error('❌ Error caught by errorHandler:', err)
  }

  let status = err.status || 500
  let message = err.message || 'Internal server error'

  if (err.name === 'ValidationError') {
    status = 400
    message = 'Validation Error'
  }

  if (err.name === 'UnauthorizedError') {
    status = 401
    message = 'Unauthorized'
  }

  return res.status(status).json({
    error: message,
    ...(env.APP_STAGE === 'dev' && {
      stack: err.stack,
      details: err.message
    })
  })
}
