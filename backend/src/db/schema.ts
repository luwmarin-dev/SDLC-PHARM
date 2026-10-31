import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// 1. Users Table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  avatar: text('avatar'),
  role: varchar('role', { length: 50 }).default('member').notNull(),
  bio: text('bio'),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  isBanned: boolean('is_banned').default(false).notNull(),
  verificationCode: varchar('verification_code', { length: 10 }),
  resetCode: varchar('reset_code', { length: 10 }),
  languages: text('languages').array().default(['en']).notNull(),
  interests: text('interests').array().default([]).notNull(),
  oblast: varchar('oblast', { length: 100 }),
  raion: varchar('raion', { length: 100 }),
  village: varchar('village', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 2. User Settings Table
export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  contentLanguages: text('content_languages').array().default(['ru']).notNull(),
  emailReplies: boolean('email_replies').default(true).notNull(),
  emailSessions: boolean('email_sessions').default(true).notNull(),
  emailCourses: boolean('email_courses').default(false).notNull(),
  emailNewsletter: boolean('email_newsletter').default(false).notNull(),
  publicProfile: boolean('public_profile').default(true).notNull(),
  showRegion: boolean('show_region').default(true).notNull(),
  allowMessages: boolean('allow_messages').default(true).notNull(),
})

// 3. Contact Inquiries Table
export const contactInquiries = pgTable('contact_inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 100 }).notNull(),
  message: text('message').notNull(),
  receivedAt: timestamp('received_at').defaultNow().notNull(),
})

// 4. Downloadable Resources Table
export const resources = pgTable('resources', {
  id: text('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'guide' | 'template' | 'dataset' | 'toolkit' | 'video' | 'link'
  category: varchar('category', { length: 100 }).notNull(),
  language: varchar('language', { length: 10 }).default('ru').notNull(),
  fileUrl: text('file_url'),
  fileName: varchar('file_name', { length: 255 }),
  sizeKb: integer('size_kb'),
  externalUrl: text('external_url'),
  downloadCount: integer('download_count').default(0).notNull(),
  tags: text('tags').array().default([]).notNull(),
  requiresAuth: boolean('requires_auth').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const userRelations = relations(users, ({ one }) => ({
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}))

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}))

// Inferred Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserSetting = typeof userSettings.$inferSelect
export type ContactInquiry = typeof contactInquiries.$inferSelect
export type NewContactInquiry = typeof contactInquiries.$inferInsert
export type Resource = typeof resources.$inferSelect
export type NewResource = typeof resources.$inferInsert

// Zod Schemas via drizzle-zod
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)
export const insertContactSchema = createInsertSchema(contactInquiries)
export const insertResourceSchema = createInsertSchema(resources)
export const selectResourceSchema = createSelectSchema(resources)
