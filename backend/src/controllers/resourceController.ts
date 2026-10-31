import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/connection.ts'
import { resources } from '../db/schema.ts'
import { eq, desc, sql } from 'drizzle-orm'

export const getAllResources = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await db
      .select()
      .from(resources)
      .orderBy(desc(resources.updatedAt))

    res.status(200).json(list)
  } catch (error) {
    console.error('Error fetching resources:', error)
    next(error)
  }
}

export const getResourceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id))
      .limit(1)

    if (!resource) {
      res.status(404).json({ message: 'Resource not found.' })
      return
    }

    res.status(200).json(resource)
  } catch (error) {
    console.error('Error fetching resource:', error)
    next(error)
  }
}

export const trackResourceDownload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const [updated] = await db
      .update(resources)
      .set({
        downloadCount: sql`${resources.downloadCount} + 1`,
      })
      .where(eq(resources.id, id))
      .returning()

    if (!updated) {
      res.status(404).json({ message: 'Resource not found.' })
      return
    }

    res.status(200).json(updated)
  } catch (error) {
    console.error('Error tracking download:', error)
    next(error)
  }
}
