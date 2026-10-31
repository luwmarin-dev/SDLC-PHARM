import { Router } from 'express'
import { z } from 'zod'
import { validateBody } from '../middleware/validation.ts'
import { authenticateToken } from '../db/auth.ts'
import {
  login,
  register,
  verifyEmail,
  resendVerification,
  getMe,
} from '../controllers/authController.ts'

const router = Router()

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(6).max(6, 'Verification code must be 6 digits'),
})

const emailOnlySchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Public Auth Endpoints
router.post('/login', validateBody(loginSchema), login)
router.post('/signup', validateBody(registerSchema), register)
router.post('/register', validateBody(registerSchema), register)
router.post('/verify-email', validateBody(verifyEmailSchema), verifyEmail)
router.post('/resend-verification', validateBody(emailOnlySchema), resendVerification)

// Protected Current User Endpoint
router.get('/me', authenticateToken, getMe)

export default router
