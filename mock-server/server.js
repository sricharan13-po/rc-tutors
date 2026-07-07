const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const Razorpay = require('razorpay')

const app = express()
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

const SECRET = 'rc-tutors-secret'
const DB_FILE = path.join(__dirname, 'db.json')

// ── RAZORPAY KEYS ───────────────────────────────────────
// 👉 PASTE YOUR RAZORPAY TEST KEYS HERE (from Razorpay Dashboard → Test Mode → API Keys).
//    Key ID starts with "rzp_test_...". You can also set them as env vars.
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXX'
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YOUR_TEST_KEY_SECRET'

const razorpayConfigured =
  RAZORPAY_KEY_ID !== 'rzp_test_XXXXXXXXXXXXXX' && RAZORPAY_KEY_SECRET !== 'YOUR_TEST_KEY_SECRET'

const razorpay = razorpayConfigured
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null

// Load persisted data or start fresh
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    }
  } catch {}
  return { users: [], nextId: 1 }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users, nextId }, null, 2))
}

const db = loadDB()
const users = db.users
let nextId = db.nextId

const DEFAULT_TUTORS = [
  {
    id: 101,
    name: 'Sricharan Vasireddy',
    email: 'sricharan@rctutors.com',
    avatar_url: null,
    profile: {
      id: 1, user_id: 101,
      subjects: ['Math', 'Science', 'Writing', 'Finance', 'French'],
      grades: [1, 2, 3, 4, 5, 6],
      bio: 'Passionate educator with expertise in Math, Science, Writing, Finance and French for grades 1–6. Making learning fun with real-world examples and interactive problem-solving.',
      hourly_rate: 40,
      rating: 0, review_count: 0,
      availability: {
        Mon: ['17:10','19:20'],
        Tue: ['17:10','19:20'],
        Wed: ['17:10','19:20'],
        Thu: ['17:10','19:20'],
        Fri: ['17:10','19:20'],
      }
    }
  }
]

function makeToken(user) {
  return jwt.sign({ sub: String(user.id) }, SECRET, { expiresIn: '24h' })
}

function userOut(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: null, created_at: user.created_at }
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return res.status(401).json({ detail: 'Not authenticated' })
  try {
    const payload = jwt.verify(token, SECRET)
    const user = users.find(u => u.id === parseInt(payload.sub))
    if (!user) return res.status(401).json({ detail: 'User not found' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ detail: 'Invalid token' })
  }
}

// ── AUTH ──────────────────────────────────────────────
app.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || name.trim().length < 2)
    return res.status(422).json({ detail: 'Full name must be at least 2 characters.' })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(422).json({ detail: 'Please enter a valid email address.' })
  if (!password || password.length < 6)
    return res.status(422).json({ detail: 'Password must be at least 6 characters.' })

  if (users.find(u => u.email === email))
    return res.status(400).json({ detail: 'An account with this email already exists.' })

  const hash = await bcrypt.hash(password, 10)
  const user = { id: nextId++, name: name.trim(), email, password_hash: hash, role: role || 'student', created_at: new Date().toISOString() }
  users.push(user)
  saveDB()

  const token = makeToken(user)
  res.status(201).json({ access_token: token, token_type: 'bearer', user: userOut(user) })
})

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(422).json({ detail: 'Email and password are required.' })

  const user = users.find(u => u.email === email)
  if (!user)
    return res.status(401).json({ detail: 'No account found with this email.' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid)
    return res.status(401).json({ detail: 'Incorrect password. Please try again.' })

  const token = makeToken(user)
  res.json({ access_token: token, token_type: 'bearer', user: userOut(user) })
})

app.get('/auth/me', authMiddleware, (req, res) => {
  res.json(userOut(req.user))
})

// ── TUTORS ─────────────────────────────────────────────
app.get('/tutors', (req, res) => {
  const { subject, grade } = req.query
  let result = DEFAULT_TUTORS
  if (subject) result = result.filter(t => t.profile.subjects.includes(subject))
  if (grade)   result = result.filter(t => t.profile.grades.includes(parseInt(grade)))
  res.json(result)
})

app.get('/tutors/:id', (req, res) => {
  const tutor = DEFAULT_TUTORS.find(t => t.id === parseInt(req.params.id))
  if (!tutor) return res.status(404).json({ detail: 'Tutor not found' })
  res.json(tutor)
})

// ── BOOKINGS ────────────────────────────────────────────
const bookings = []
let bookingId = 1

app.post('/bookings', authMiddleware, (req, res) => {
  const { tutor_id, start_time, end_time, subject } = req.body
  const tutor = DEFAULT_TUTORS.find(t => t.id === tutor_id)
  if (!tutor) return res.status(404).json({ detail: 'Tutor not found' })

  const hours = (new Date(end_time) - new Date(start_time)) / 3600000
  const booking = {
    id: bookingId++, student_id: req.user.id, tutor_id,
    start_time, end_time, subject,
    status: 'pending', payment_status: 'unpaid',
    amount: Math.round(tutor.profile.hourly_rate * hours * 100) / 100,
    stripe_payment_intent_id: null
  }
  bookings.push(booking)
  res.status(201).json(booking)
})

app.get('/bookings', authMiddleware, (req, res) => {
  const user = req.user
  const result = bookings.filter(b => b.student_id === user.id || b.tutor_id === user.id)
  res.json(result)
})

app.patch('/bookings/:id', authMiddleware, (req, res) => {
  const b = bookings.find(b => b.id === parseInt(req.params.id))
  if (!b) return res.status(404).json({ detail: 'Booking not found' })
  if (req.body.status) b.status = req.body.status
  res.json(b)
})

// ── MESSAGES ────────────────────────────────────────────
const messages = []
let msgId = 1

app.get('/messages/:other_id', authMiddleware, (req, res) => {
  const me = req.user.id
  const other = parseInt(req.params.other_id)
  res.json(messages.filter(m =>
    (m.sender_id === me && m.receiver_id === other) ||
    (m.sender_id === other && m.receiver_id === me)
  ))
})

app.post('/messages', authMiddleware, (req, res) => {
  const msg = {
    id: msgId++, sender_id: req.user.id,
    receiver_id: req.body.receiver_id,
    content: req.body.content, is_read: false,
    created_at: new Date().toISOString()
  }
  messages.push(msg)
  res.status(201).json(msg)
})

// ── RAZORPAY PAYMENTS ───────────────────────────────────
const payments = []
let paymentId = 1

// Tell the frontend whether Razorpay is set up + the public key id
app.get('/payments/config', (req, res) => {
  res.json({ configured: razorpayConfigured, keyId: razorpayConfigured ? RAZORPAY_KEY_ID : null })
})

// Create a Razorpay order for a plan
app.post('/payments/create-order', authMiddleware, async (req, res) => {
  if (!razorpay)
    return res.status(503).json({ detail: 'Payments are not configured yet. Add your Razorpay test keys in the server.' })

  const { amount, tier, grades } = req.body
  const rupees = parseInt(amount)
  if (!rupees || rupees < 1)
    return res.status(422).json({ detail: 'Invalid amount.' })

  try {
    const order = await razorpay.orders.create({
      amount: rupees * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `rc_${Date.now()}`,
      notes: { tier: tier || '', grades: String(grades || ''), student_id: String(req.user.id) },
    })
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: RAZORPAY_KEY_ID })
  } catch (err) {
    console.error('Razorpay order error:', err?.error || err)
    res.status(502).json({ detail: 'Could not create payment order. Check your Razorpay keys.' })
  }
})

// Verify the payment signature after checkout completes
app.post('/payments/verify', authMiddleware, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier, price, grades } = req.body

  const expected = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature)
    return res.status(400).json({ detail: 'Payment verification failed.' })

  const record = {
    id: paymentId++, student_id: req.user.id,
    order_id: razorpay_order_id, payment_id: razorpay_payment_id,
    tier: tier || '', price: price || 0, grades: grades || '',
    status: 'paid', created_at: new Date().toISOString(),
  }
  payments.push(record)
  console.log('Payment verified:', record)
  res.json({ ok: true, payment: record })
})

// ── ENQUIRIES (contact form) ────────────────────────────
const enquiries = []
let enquiryId = 1

app.post('/enquiries', (req, res) => {
  const { name, email, phone, subject, grade, message, tutor } = req.body

  if (!name || name.trim().length < 2)
    return res.status(422).json({ detail: 'Please enter your name.' })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(422).json({ detail: 'Please enter a valid email address.' })
  if (!message || message.trim().length < 5)
    return res.status(422).json({ detail: 'Please enter a message.' })

  const enquiry = {
    id: enquiryId++,
    name: name.trim(), email, phone: phone || '',
    subject: subject || '', grade: grade || '',
    tutor: tutor || '', message: message.trim(),
    created_at: new Date().toISOString(),
  }
  enquiries.push(enquiry)
  console.log('New enquiry received:', enquiry)
  res.status(201).json({ ok: true, id: enquiry.id })
})

app.get('/enquiries', (req, res) => res.json(enquiries))

app.listen(8000, () => console.log('RC Tutors mock server running on http://localhost:8000'))
