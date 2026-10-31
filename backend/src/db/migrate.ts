import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db } from './connection.ts'

async function runMigrations() {
  console.log('🔄 Applying Drizzle migrations to Neon PostgreSQL...')
  await migrate(db, { migrationsFolder: './migrations' })
  console.log('✅ Migrations applied successfully to Neon PostgreSQL!')
  process.exit(0)
}

runMigrations().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
