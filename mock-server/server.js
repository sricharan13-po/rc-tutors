require('dotenv').config({ path: require('path').join(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const Razorpay = require('razorpay')
const db = require('./db')
const googleMeet = require('./googleMeet')

const app = express()
app.set('trust proxy', 1) // needed on Render/most PaaS for rate-limit + secure cookies to see the real client IP

const PORT = process.env.PORT || 8000
const SECRET = process.env.JWT_SECRET || 'rc-tutors-secret'
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const isProd = process.env.NODE_ENV === 'production'

// Fixed admin account. The real password MUST come from the ADMIN_PASSWORD env var
// (set it in your host + local .env). The placeholder below is intentionally not a
// usable secret, so this file is safe to keep in a public repo.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@rctutors.com').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CHANGE_ME_set_ADMIN_PASSWORD_env'
const ADMIN_NAME = process.env.ADMIN_NAME || 'RC Tutors Admin'

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: CORS_ORIGIN }))

// Serve the built React frontend (for single-service deployment)
const CLIENT_DIST = path.join(__dirname, '..', 'frontend', 'dist')
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST))
}

// ── RAZORPAY KEYS ───────────────────────────────────────
// 👉 Set these as environment variables (Razorpay Dashboard → API Keys).
//    Test mode: keys start with "rzp_test_...". Live mode: "rzp_live_...".
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXX'
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YOUR_TEST_KEY_SECRET'
// Set in Razorpay Dashboard → Settings → Webhooks when you add the webhook URL.
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''

const razorpayConfigured =
  RAZORPAY_KEY_ID !== 'rzp_test_XXXXXXXXXXXXXX' && RAZORPAY_KEY_SECRET !== 'YOUR_TEST_KEY_SECRET'

const razorpay = razorpayConfigured
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null

// ── VIDEO CLASS LINK ─────────────────────────────────────
// Simplest path: one shared Google Meet link for all classes. Create it once at
// meet.google.com ("New meeting" → "Create a meeting for later") and set it here.
// This takes priority over everything else when set.
const GOOGLE_MEET_LINK = process.env.GOOGLE_MEET_LINK || ''

// Fallback video room (used only if no GOOGLE_MEET_LINK and Google isn't connected).
// The room name is derived from a secret salt so it can't be guessed from the class name.
const ROOM_SALT = process.env.ROOM_SALT || 'rc-tutors-9f83kd72ba-secret'
function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
function classRoomUrl(tier) {
  const a = hashCode(ROOM_SALT + '|' + tier)
  const b = hashCode(tier + '|' + ROOM_SALT + '|x')
  return `https://meet.jit.si/RCTutors-${a}${b}`
}

// ── RAZORPAY WEBHOOK ─────────────────────────────────────
// Registered BEFORE express.json() because signature verification needs the raw body.
// This is the authoritative payment record: it fires from Razorpay's servers directly,
// so a payment is captured here even if the customer's browser closes right after paying.
app.post('/payments/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  if (!RAZORPAY_WEBHOOK_SECRET) return res.status(503).json({ detail: 'Webhook not configured.' })

  const signature = req.headers['x-razorpay-signature'] || ''
  const expected = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(req.body).digest('hex')
  if (signature !== expected) return res.status(400).json({ detail: 'Invalid webhook signature.' })

  let event
  try {
    event = JSON.parse(req.body.toString('utf8'))
  } catch {
    return res.status(400).json({ detail: 'Malformed payload.' })
  }

  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity
    if (payment) {
      await recordPaidOrder({
        student_id: parseInt(payment.notes?.student_id) || null,
        order_id: payment.order_id,
        payment_id: payment.id,
        tier: payment.notes?.tier || '',
        price: payment.amount / 100,
        grades: payment.notes?.grades || '',
        source: 'webhook',
      })
    }
  }

  res.json({ received: true })
})

app.use(express.json())

// ── RATE LIMITING ────────────────────────────────────────
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })
const paymentLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false })
const enquiryLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false })

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

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return res.status(401).json({ detail: 'Not authenticated' })
  try {
    const payload = jwt.verify(token, SECRET)
    const user = await db.findUserById(parseInt(payload.sub))
    if (!user) return res.status(401).json({ detail: 'User not found' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ detail: 'Invalid token' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ detail: 'Admin access only.' })
  next()
}

// Shared by /payments/verify (browser) and /payments/webhook (Razorpay server).
// Idempotent on order_id so a payment is never recorded — or enrolled — twice.
async function recordPaidOrder({ student_id, order_id, payment_id, tier, price, grades, source }) {
  const existing = await db.findPaymentByOrderId(order_id)
  if (existing) return { payment: existing, alreadyRecorded: true }

  const payment = await db.savePayment({
    student_id, order_id, payment_id, tier, price: Number(price) || 0, grades,
    status: 'paid', source, created_at: new Date().toISOString(),
  })

  let enrollment = null
  if (student_id) {
    // Priority: admin-set link → GOOGLE_MEET_LINK env → Calendar API → Jitsi fallback
    let meetLink = (await db.getConfig('meet_link')) || GOOGLE_MEET_LINK
    if (!meetLink) {
      try {
        meetLink = await googleMeet.getOrCreateMeetLink(tier)
      } catch (err) {
        console.error('Google Meet link creation failed, falling back to Jitsi:', err.message)
      }
    }
    if (!meetLink) meetLink = classRoomUrl(tier) // final safe fallback

    enrollment = await db.saveEnrollment({
      student_id, order_id, tier, price: Number(price) || 0, grades,
      meetLink,
      schedule: 'Monday – Friday · 5:10 PM – 6:10 PM',
      paidAt: new Date().toISOString(),
    })
  }

  if (!isProd) console.log('Payment recorded:', payment)
  return { payment, enrollment, alreadyRecorded: false }
}

// ── AUTH ──────────────────────────────────────────────
app.post('/auth/register', authLimiter, async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || name.trim().length < 2)
    return res.status(422).json({ detail: 'Full name must be at least 2 characters.' })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(422).json({ detail: 'Please enter a valid email address.' })
  if (!password || password.length < 6)
    return res.status(422).json({ detail: 'Password must be at least 6 characters.' })

  if (await db.findUserByEmail(email))
    return res.status(400).json({ detail: 'An account with this email already exists.' })

  // Never let the public self-assign admin — only student/tutor via signup.
  const safeRole = role === 'tutor' ? 'tutor' : 'student'
  const hash = await bcrypt.hash(password, 10)
  const user = await db.createUser({ name: name.trim(), email, password_hash: hash, role: safeRole })

  const token = makeToken(user)
  res.status(201).json({ access_token: token, token_type: 'bearer', user: userOut(user) })
})

app.post('/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(422).json({ detail: 'Email and password are required.' })

  const user = await db.findUserByEmail(email)
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

// ── GOOGLE MEET SETUP (tutor-only, one-time) ────────────
// Protected by a static setup token (not a student/tutor login) since it's a
// plain browser link, not an API call with an Authorization header.
const ADMIN_SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN || ''

app.get('/admin/google/connect', (req, res) => {
  if (!ADMIN_SETUP_TOKEN || req.query.token !== ADMIN_SETUP_TOKEN)
    return res.status(403).send('Forbidden.')
  if (!googleMeet.googleConfigured)
    return res.status(503).send('Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI first.')
  res.redirect(googleMeet.getAuthUrl())
})

app.get('/admin/google/callback', async (req, res) => {
  try {
    await googleMeet.handleOAuthCallback(req.query.code)
    res.send('<h2>Google account connected ✅</h2><p>Real Google Meet links will now be created automatically for every class. You can close this tab.</p>')
  } catch (err) {
    res.status(500).send(`<h2>Connection failed</h2><p>${err.message}</p>`)
  }
})

app.get('/admin/google/status', async (req, res) => {
  res.json({ configured: googleMeet.googleConfigured, connected: await googleMeet.isGoogleConnected() })
})

// ── RAZORPAY PAYMENTS ───────────────────────────────────

// Tell the frontend whether Razorpay is set up + the public key id
app.get('/payments/config', (req, res) => {
  res.json({ configured: razorpayConfigured, keyId: razorpayConfigured ? RAZORPAY_KEY_ID : null })
})

// Create a Razorpay order for a plan
app.post('/payments/create-order', paymentLimiter, authMiddleware, async (req, res) => {
  if (!razorpay)
    return res.status(503).json({ detail: 'Payments are not configured yet. Add your Razorpay keys in the server.' })

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

// Verify the payment signature after checkout completes (browser-side confirmation path)
app.post('/payments/verify', paymentLimiter, authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier, price, grades } = req.body

  const expected = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature)
    return res.status(400).json({ detail: 'Payment verification failed.' })

  const { payment, enrollment } = await recordPaidOrder({
    student_id: req.user.id,
    order_id: razorpay_order_id, payment_id: razorpay_payment_id,
    tier, price, grades, source: 'client',
  })

  res.json({ ok: true, payment, enrollment })
})

// Enrollments belonging to the logged-in student (server is the source of truth)
app.get('/enrollments', authMiddleware, async (req, res) => {
  res.json(await db.getEnrollmentsForUser(req.user.id))
})

// ── ENQUIRIES (contact form) ────────────────────────────
app.post('/enquiries', enquiryLimiter, async (req, res) => {
  const { name, email, phone, subject, grade, message, tutor } = req.body

  if (!name || name.trim().length < 2)
    return res.status(422).json({ detail: 'Please enter your name.' })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(422).json({ detail: 'Please enter a valid email address.' })
  if (!message || message.trim().length < 5)
    return res.status(422).json({ detail: 'Please enter a message.' })

  const enquiry = await db.saveEnquiry({
    name: name.trim(), email, phone: phone || '',
    subject: subject || '', grade: grade || '',
    tutor: tutor || '', message: message.trim(),
    created_at: new Date().toISOString(),
  })
  if (!isProd) console.log('New enquiry received:', enquiry)
  res.status(201).json({ ok: true, id: enquiry.id })
})

// ── ADMIN ────────────────────────────────────────────────
// Everything a student pays for, everyone who enquired — one screen for the tutor.
app.get('/admin/overview', authMiddleware, adminOnly, async (req, res) => {
  const [enquiries, enrollments, payments] = await Promise.all([
    db.getAllEnquiries(), db.getAllEnrollments(), db.getAllPayments(),
  ])
  res.json({ enquiries, enrollments, payments })
})

// Current shared Google Meet link (what new/updated enrollments use)
app.get('/admin/meet-link', authMiddleware, adminOnly, async (req, res) => {
  const meetLink = (await db.getConfig('meet_link')) || GOOGLE_MEET_LINK || ''
  res.json({ meetLink })
})

// Change the shared Google Meet link; existing students move to the new room too.
app.put('/admin/meet-link', authMiddleware, adminOnly, async (req, res) => {
  const link = (req.body.meetLink || '').trim()
  if (link && !/^https:\/\/meet\.google\.com\/[a-z-]+$/i.test(link))
    return res.status(422).json({ detail: 'Enter a valid Google Meet link, e.g. https://meet.google.com/abc-defg-hij' })
  await db.setConfig('meet_link', link)
  await db.setAllEnrollmentsMeetLink(link)
  res.json({ ok: true, meetLink: link })
})

// ── ENQUIRIES (admin read) ───────────────────────────────
app.get('/enquiries', authMiddleware, adminOnly, async (req, res) => res.json(await db.getAllEnquiries()))

// ── SPA FALLBACK ────────────────────────────────────────
// Any non-API GET returns the React app so client-side routing works.
app.get('*', (req, res) => {
  const indexFile = path.join(CLIENT_DIST, 'index.html')
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile)
  res.status(404).json({ detail: 'Not found' })
})

async function seedAdmin() {
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  ADMIN_PASSWORD is not set — set it as an env var so admin login is secure.')
  }
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await db.ensureAdmin({ name: ADMIN_NAME, email: ADMIN_EMAIL, password_hash: hash })
  console.log(`Admin account ready: ${ADMIN_EMAIL}`)
}

db.connect()
  .then(seedAdmin)
  .then(() => app.listen(PORT, () => console.log(`RC Tutors server running on port ${PORT}`)))
  .catch((err) => {
    console.error('Startup failed:', err.message)
    process.exit(1)
  })
