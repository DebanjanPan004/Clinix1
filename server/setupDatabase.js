/* eslint-env node */
/* global process */
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Pool } from 'pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = Number(process.env.DB_PORT || 5432)
const DB_USER = process.env.DB_USER || 'postgres'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_NAME = process.env.DB_NAME || 'clinixone'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql')

async function ensureDatabase() {
  const adminPool = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: 'postgres',
  })

  try {
    const existsResult = await adminPool.query('select 1 from pg_database where datname = $1', [DB_NAME])

    if (existsResult.rowCount === 0) {
      await adminPool.query(`create database ${DB_NAME}`)
      console.log(`Database created: ${DB_NAME}`)
    } else {
      console.log(`Database already exists: ${DB_NAME}`)
    }
  } finally {
    await adminPool.end()
  }
}

async function applySchema() {
  const sql = fs.readFileSync(schemaPath, 'utf8')

  const appPool = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  })

  try {
    await appPool.query(sql)
    console.log(`Schema applied successfully to: ${DB_NAME}`)
  } finally {
    await appPool.end()
  }
}

async function ensureDoctorAvailabilityColumn() {
  const appPool = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  })

  try {
    await appPool.query(
      `alter table if exists public.doctors
       add column if not exists availability_schedule jsonb default '{"working_days": ["mon", "tue", "wed", "thu", "fri"], "working_hours": {"mon": {"start": "09:00", "end": "17:00"}, "tue": {"start": "09:00", "end": "17:00"}, "wed": {"start": "09:00", "end": "17:00"}, "thu": {"start": "09:00", "end": "17:00"}, "fri": {"start": "09:00", "end": "17:00"}, "sat": {"start": "10:00", "end": "14:00"}, "sun": null}, "break_times": {"mon": [], "tue": [], "wed": [], "thu": [], "fri": [], "sat": [], "sun": []}, "consultation_modes": ["online", "in-clinic"], "slot_interval_minutes": 30}'::jsonb`
    )

    await appPool.query(
      `update public.doctors
       set availability_schedule = coalesce(availability_schedule, available_hours)
       where availability_schedule is null`
    )
  } finally {
    await appPool.end()
  }
}

async function main() {
  await ensureDatabase()
  await applySchema()
  await ensureDoctorAvailabilityColumn()
  console.log('PostgreSQL setup complete.')
}

main().catch((error) => {
  console.error('Database setup failed:', error.message)
  process.exit(1)
})
