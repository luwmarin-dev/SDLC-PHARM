import { Router } from 'express'
import { z } from 'zod'
import { validateParams } from '../middleware/validation.ts'
import {
  getAllResources,
  getResourceById,
  trackResourceDownload,
} from '../controllers/resourceController.ts'

const router = Router()

const idParamSchema = z.object({
  id: z.string().min(1, 'Resource ID is required'),
})

// Public endpoints
router.get('/', getAllResources)
router.get('/:id', validateParams(idParamSchema), getResourceById)
router.post('/:id/download', validateParams(idParamSchema), trackResourceDownload)

export default router
