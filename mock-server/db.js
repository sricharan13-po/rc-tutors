const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

// Supabase / any Postgres connection string. When unset, we fall back to
// in-memory storage (+ db.json) so local dev works with zero setup.
const DATABASE_URL = process.env.DATABASE_URL || ''
const usePg = !!DATABASE_URL

const pool = usePg
  ? new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null

async function connect() {
  if (!usePg) {
    console.log('DATABASE_URL not set — using in-memory storage (data resets on restart).')
    return
  }
  // Verify connection + create tables if they don't exist yet.
  await pool.query('SELECT 1')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT, email TEXT UNIQUE,
      password_hash TEXT, role TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER, order_id TEXT UNIQUE, payment_id TEXT,
      tier TEXT, price NUMERIC, grades TEXT,
      status TEXT, source TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER, order_id TEXT,
      tier TEXT, price NUMERIC, grades TEXT,
      meet_link TEXT, schedule TEXT, paid_at TEXT
    );
    CREATE TABLE IF NOT EXISTS enquiries (
      id SERIAL PRIMARY KEY,
      name TEXT, email TEXT, phone TEXT,
      subject TEXT, grade TEXT, tutor TEXT, message TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY, value TEXT
    );
    CREATE TABLE IF NOT EXISTS meet_rooms (
      tier TEXT PRIMARY KEY, meet_link TEXT, calendar_event_id TEXT
    );
  `)
  console.log('Connected to Postgres (Supabase) — data will persist across restarts.')
}

// ── Row → app-shape mappers (snake_case columns → camelCase the app expects) ──
const mapEnrollment = (r) => r && ({
  id: r.id, student_id: r.student_id, order_id: r.order_id,
  tier: r.tier, price: Number(r.price), grades: r.grades,
  meetLink: r.meet_link, schedule: r.schedule, paidAt: r.paid_at,
})
const mapPayment = (r) => r && ({
  id: r.id, student_id: r.student_id, order_id: r.order_id, payment_id: r.payment_id,
  tier: r.tier, price: Number(r.price), grades: r.grades,
  status: r.status, source: r.source, created_at: r.created_at,
})
const mapMeetRoom = (r) => r && ({ tier: r.tier, meetLink: r.meet_link, calendarEventId: r.calendar_event_id })

// ── IN-MEMORY FALLBACK (dev mode, no DATABASE_URL) ──────────
const DB_FILE = path.join(__dirname, 'db.json')
function loadFile() {
  try {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
  } catch {}
  return { users: [], payments: [], enrollments: [], enquiries: [], nextId: 1 }
}
const mem = loadFile()
mem.payments = mem.payments || []
mem.enrollments = mem.enrollments || []
mem.enquiries = mem.enquiries || []
mem.meetRooms = mem.meetRooms || {}
mem.config = mem.config || {}

function saveFile() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(mem, null, 2))
  } catch (e) {
    console.warn('Could not persist db.json:', e.message)
  }
}

// ── USERS ────────────────────────────────────────────────
async function findUserByEmail(email) {
  if (usePg) return (await pool.query('SELECT * FROM users WHERE email = $1', [email])).rows[0] || null
  return mem.users.find(u => u.email === email) || null
}

async function findUserById(id) {
  if (usePg) return (await pool.query('SELECT * FROM users WHERE id = $1', [id])).rows[0] || null
  return mem.users.find(u => u.id === id) || null
}

async function createUser({ name, email, password_hash, role }) {
  const created_at = new Date().toISOString()
  if (usePg) {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, created_at) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, email, password_hash, role, created_at]
    )
    return rows[0]
  }
  const user = { id: mem.nextId++, name, email, password_hash, role, created_at }
  mem.users.push(user)
  saveFile()
  return user
}

// Create the admin if missing, or keep its password/role in sync with config.
async function ensureAdmin({ name, email, password_hash }) {
  if (usePg) {
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, created_at)
      VALUES ($1,$2,$3,'admin',$4)
      ON CONFLICT (email) DO UPDATE SET name = $1, password_hash = $3, role = 'admin'
    `, [name, email, password_hash, new Date().toISOString()])
    return
  }
  const existing = mem.users.find(u => u.email === email)
  if (existing) {
    existing.name = name; existing.password_hash = password_hash; existing.role = 'admin'
  } else {
    mem.users.push({ id: mem.nextId++, name, email, password_hash, role: 'admin', created_at: new Date().toISOString() })
  }
  saveFile()
}

// ── PAYMENTS ─────────────────────────────────────────────
async function findPaymentByOrderId(order_id) {
  if (usePg) return mapPayment((await pool.query('SELECT * FROM payments WHERE order_id = $1', [order_id])).rows[0])
  return mem.payments.find(p => p.order_id === order_id) || null
}

async function savePayment(record) {
  if (usePg) {
    const { rows } = await pool.query(`
      INSERT INTO payments (student_id, order_id, payment_id, tier, price, grades, status, source, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
    `, [record.student_id, record.order_id, record.payment_id, record.tier, record.price, record.grades, record.status, record.source, record.created_at])
    return mapPayment(rows[0])
  }
  record.id = mem.payments.length + 1
  mem.payments.push(record)
  saveFile()
  return record
}

async function getAllPayments() {
  if (usePg) return (await pool.query('SELECT * FROM payments ORDER BY id DESC')).rows.map(mapPayment)
  return [...mem.payments].reverse()
}

// ── ENROLLMENTS ──────────────────────────────────────────
async function saveEnrollment(record) {
  if (usePg) {
    const { rows } = await pool.query(`
      INSERT INTO enrollments (student_id, order_id, tier, price, grades, meet_link, schedule, paid_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [record.student_id, record.order_id, record.tier, record.price, record.grades, record.meetLink, record.schedule, record.paidAt])
    return mapEnrollment(rows[0])
  }
  record.id = mem.enrollments.length + 1
  mem.enrollments.push(record)
  saveFile()
  return record
}

async function getEnrollmentsForUser(student_id) {
  if (usePg) return (await pool.query('SELECT * FROM enrollments WHERE student_id = $1 ORDER BY id DESC', [student_id])).rows.map(mapEnrollment)
  return mem.enrollments.filter(e => e.student_id === student_id)
}

async function getAllEnrollments() {
  if (usePg) return (await pool.query('SELECT * FROM enrollments ORDER BY id DESC')).rows.map(mapEnrollment)
  return [...mem.enrollments].reverse()
}

// Keep every student on the current shared link when the admin changes it.
async function setAllEnrollmentsMeetLink(meetLink) {
  if (usePg) { await pool.query('UPDATE enrollments SET meet_link = $1', [meetLink]); return }
  mem.enrollments.forEach(e => { e.meetLink = meetLink })
  saveFile()
}

// ── ENQUIRIES ────────────────────────────────────────────
async function saveEnquiry(record) {
  if (usePg) {
    const { rows } = await pool.query(`
      INSERT INTO enquiries (name, email, phone, subject, grade, tutor, message, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
    `, [record.name, record.email, record.phone, record.subject, record.grade, record.tutor, record.message, record.created_at])
    return rows[0]
  }
  record.id = mem.enquiries.length + 1
  mem.enquiries.push(record)
  saveFile()
  return record
}

async function getAllEnquiries() {
  if (usePg) return (await pool.query('SELECT * FROM enquiries ORDER BY id DESC')).rows
  return [...mem.enquiries].reverse()
}

// ── GOOGLE MEET ROOMS ────────────────────────────────────
async function getMeetRoom(tier) {
  if (usePg) return mapMeetRoom((await pool.query('SELECT * FROM meet_rooms WHERE tier = $1', [tier])).rows[0])
  return mem.meetRooms[tier] ? { tier, ...mem.meetRooms[tier] } : null
}

async function saveMeetRoom(tier, { meetLink, calendarEventId }) {
  if (usePg) {
    await pool.query(`
      INSERT INTO meet_rooms (tier, meet_link, calendar_event_id) VALUES ($1,$2,$3)
      ON CONFLICT (tier) DO UPDATE SET meet_link = $2, calendar_event_id = $3
    `, [tier, meetLink, calendarEventId])
    return
  }
  mem.meetRooms[tier] = { meetLink, calendarEventId }
  saveFile()
}

// ── CONFIG (shared Meet link, etc.) ──────────────────────
async function getConfig(key) {
  if (usePg) return (await pool.query('SELECT value FROM config WHERE key = $1', [key])).rows[0]?.value ?? null
  return mem.config[key] ?? null
}

async function setConfig(key, value) {
  if (usePg) {
    await pool.query('INSERT INTO config (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = $2', [key, value])
    return
  }
  mem.config[key] = value
  saveFile()
}

module.exports = {
  usePg, connect,
  findUserByEmail, findUserById, createUser, ensureAdmin,
  findPaymentByOrderId, savePayment, getAllPayments,
  saveEnrollment, getEnrollmentsForUser, getAllEnrollments, setAllEnrollmentsMeetLink,
  saveEnquiry, getAllEnquiries,
  getMeetRoom, saveMeetRoom,
  getConfig, setConfig,
}
