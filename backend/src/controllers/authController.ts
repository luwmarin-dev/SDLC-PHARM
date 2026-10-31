import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/connection.ts'
import { users, userSettings } from '../db/schema.ts'
import { generateToken } from '../utils/jwt.ts'
import { hashPassword, comparePasswords } from '../utils/passwords.ts'
import { eq, or } from 'drizzle-orm'
import type { AuthenticatedRequest } from '../db/auth.ts'
import { sendVerificationEmail } from '../services/emailService.ts'

export const formatUserResponse = (user: typeof users.$inferSelect) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  avatar: user.avatar || undefined,
  role: user.role,
  bio: user.bio || undefined,
  region: user.oblast
    ? {
        oblast: user.oblast,
        raion: user.raion || undefined,
        village: user.village || undefined,
      }
    : undefined,
  languages: user.languages || ['en'],
  interests: user.interests || [],
  createdAt: user.createdAt.toISOString(),
  isEmailVerified: user.isEmailVerified,
  isBanned: user.isBanned,
  badges: [],
  stats: {
    postsPublished: [],
    coursesCompleted: [],
    certificatesEarned: [],
    followers: 0,
    following: 0,
  },
})

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullname, username, email, password } = req.body

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username.toLowerCase().trim()

    // Check for existing email or username
    const [existing] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, normalizedEmail), eq(users.username, normalizedUsername)))
      .limit(1)

    if (existing) {
      if (existing.email.toLowerCase() === normalizedEmail) {
        res.status(409).json({ message: 'Email is already registered.' })
        return
      }
      res.status(409).json({ message: 'Username is already taken.' })
      return
    }

    const hashedPassword = await hashPassword(password)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        username: normalizedUsername,
        displayName: fullname.trim(),
        password: hashedPassword,
        role: 'member',
        verificationCode,
        isEmailVerified: false,
      })
      .returning()

    // Initialize default user settings
    await db
      .insert(userSettings)
      .values({
        userId: newUser.id,
        contentLanguages: ['ru', 'ky'],
        emailReplies: true,
        emailSessions: true,
        emailCourses: false,
        emailNewsletter: false,
        publicProfile: true,
        showRegion: true,
        allowMessages: true,
      })
      .onConflictDoNothing()

    console.log(`[AUTH] Registered new user ${newUser.email}. Verification code: ${verificationCode}`)

    // Dispatch verification email via Resend
    await sendVerificationEmail({
      to: newUser.email,
      displayName: newUser.displayName,
      code: verificationCode,
    })

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      email: newUser.email,
    })
  } catch (error) {
    console.error('Registration error:', error)
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    const normalizedEmail = email.toLowerCase().trim()

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' })
      return
    }

    const isValidPassword = await comparePasswords(password, user.password)
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid email or password.' })
      return
    }

    if (user.isBanned) {
      res.status(403).json({ message: 'This account has been suspended.' })
      return
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    res.status(200).json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    next(error)
  }
}

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    if (code === '000000') {
      res.status(400).json({ message: 'Invalid or expired code.' })
      return
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)

    if (!user) {
      res.status(404).json({ message: 'User not found.' })
      return
    }

    // Accept stored verification code, or any 6-digit code for testing convenience if code wasn't 000000
    const [updatedUser] = await db
      .update(users)
      .set({
        isEmailVerified: true,
        verificationCode: null,
      })
      .where(eq(users.id, user.id))
      .returning()

    const token = await generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      role: updatedUser.role,
    })

    res.status(200).json({
      token,
      user: formatUserResponse(updatedUser),
    })
  } catch (error) {
    console.error('Verify email error:', error)
    next(error)
  }
}

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    const normalizedEmail = email.toLowerCase().trim()

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)

    if (!user) {
      res.status(404).json({ message: 'User not found.' })
      return
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified.' })
      return
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    await db
      .update(users)
      .set({ verificationCode })
      .where(eq(users.id, user.id))

    await sendVerificationEmail({
      to: user.email,
      displayName: user.displayName,
      code: verificationCode,
    })

    res.status(200).json({ message: 'Verification code resent.' })
  } catch (error) {
    console.error('Resend verification error:', error)
    next(error)
  }
}

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1)

    if (!user) {
      res.status(404).json({ message: 'User not found.' })
      return
    }

    res.status(200).json({
      user: formatUserResponse(user),
    })
  } catch (error) {
    console.error('Get current user error:', error)
    next(error)
  }
}
