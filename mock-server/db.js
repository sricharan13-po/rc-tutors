const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI || ''
const useMongo = !!MONGO_URI

// ── MONGOOSE SCHEMAS (used only when MONGO_URI is set) ─────
const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true, index: true },
  name: String, email: { type: String, unique: true, index: true },
  password_hash: String, role: String, created_at: String,
})
const paymentSchema = new mongoose.Schema({
  id: Number, student_id: Number,
  order_id: { type: String, unique: true, index: true },
  payment_id: String, tier: String, price: Number, grades: String,
  status: String, source: String, created_at: String,
})
const enrollmentSchema = new mongoose.Schema({
  id: Number, student_id: Number, order_id: String,
  tier: String, price: Number, grades: String,
  meetLink: String, schedule: String, paidAt: String,
})
const enquirySchema = new mongoose.Schema({
  id: Number, name: String, email: String, phone: String,
  subject: String, grade: String, tutor: String, message: String, created_at: String,
})
const counterSchema = new mongoose.Schema({ name: { type: String, unique: true }, value: Number })

let Models = null
if (useMongo) {
  Models = {
    User: mongoose.model('User', userSchema),
    Payment: mongoose.model('Payment', paymentSchema),
    Enrollment: mongoose.model('Enrollment', enrollmentSchema),
    Enquiry: mongoose.model('Enquiry', enquirySchema),
    Counter: mongoose.model('Counter', counterSchema),
  }
}

async function connect() {
  if (!useMongo) {
    console.log('MONGO_URI not set — using in-memory storage (data resets on restart).')
    return
  }
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB — data will persist across restarts.')
}

async function nextSeq(name) {
  const doc = await Models.Counter.findOneAndUpdate(
    { name }, { $inc: { value: 1 } }, { upsert: true, new: true }
  )
  return doc.value
}

// ── IN-MEMORY FALLBACK (dev mode, no MONGO_URI) ─────────────
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

function saveFile() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(mem, null, 2))
  } catch (e) {
    console.warn('Could not persist db.json:', e.message)
  }
}

// ── UNIFIED DATA ACCESS ──────────────────────────────────────
// Every function below works the same whether Mongo is connected or not.

async function findUserByEmail(email) {
  if (useMongo) return Models.User.findOne({ email }).lean()
  return mem.users.find(u => u.email === email) || null
}

async function findUserById(id) {
  if (useMongo) return Models.User.findOne({ id }).lean()
  return mem.users.find(u => u.id === id) || null
}

async function createUser({ name, email, password_hash, role }) {
  const created_at = new Date().toISOString()
  if (useMongo) {
    const id = await nextSeq('users')
    const user = { id, name, email, password_hash, role, created_at }
    await Models.User.create(user)
    return user
  }
  const user = { id: mem.nextId++, name, email, password_hash, role, created_at }
  mem.users.push(user)
  saveFile()
  return user
}

async function findPaymentByOrderId(order_id) {
  if (useMongo) return Models.Payment.findOne({ order_id }).lean()
  return mem.payments.find(p => p.order_id === order_id) || null
}

async function savePayment(record) {
  if (useMongo) {
    record.id = await nextSeq('payments')
    await Models.Payment.create(record)
    return record
  }
  record.id = mem.payments.length + 1
  mem.payments.push(record)
  saveFile()
  return record
}

async function saveEnrollment(record) {
  if (useMongo) {
    record.id = await nextSeq('enrollments')
    await Models.Enrollment.create(record)
    return record
  }
  record.id = mem.enrollments.length + 1
  mem.enrollments.push(record)
  saveFile()
  return record
}

async function getEnrollmentsForUser(student_id) {
  if (useMongo) return Models.Enrollment.find({ student_id }).lean()
  return mem.enrollments.filter(e => e.student_id === student_id)
}

async function saveEnquiry(record) {
  if (useMongo) {
    record.id = await nextSeq('enquiries')
    await Models.Enquiry.create(record)
    return record
  }
  record.id = mem.enquiries.length + 1
  mem.enquiries.push(record)
  saveFile()
  return record
}

async function getAllEnquiries() {
  if (useMongo) return Models.Enquiry.find().lean()
  return mem.enquiries
}

module.exports = {
  useMongo, connect,
  findUserByEmail, findUserById, createUser,
  findPaymentByOrderId, savePayment,
  saveEnrollment, getEnrollmentsForUser,
  saveEnquiry, getAllEnquiries,
}
