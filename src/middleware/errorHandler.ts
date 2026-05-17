import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  status?: number
  statusCode?: number
  details?: any
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Not Found' })
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  const payload: any = { message }

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack
    if (err.details) payload.details = err.details
  }

  res.status(status).json(payload)
}

export default errorHandler
