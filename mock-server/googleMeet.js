const { google } = require('googleapis')
const db = require('./db')

// 👉 From Google Cloud Console → APIs & Services → Credentials (OAuth client ID, Web application).
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || ''

const googleConfigured = !!(CLIENT_ID && CLIENT_SECRET && REDIRECT_URI)

function oauthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
}

// One-time consent screen — sent to the tutor, not students.
function getAuthUrl() {
  return oauthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // forces Google to re-issue a refresh_token even if authorized before
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  })
}

async function handleOAuthCallback(code) {
  const client = oauthClient()
  const { tokens } = await client.getToken(code)
  if (!tokens.refresh_token) {
    throw new Error(
      'Google did not return a refresh token. Remove RC Tutors from ' +
      'https://myaccount.google.com/permissions and try connecting again.'
    )
  }
  await db.setConfig('google_refresh_token', tokens.refresh_token)
}

async function isGoogleConnected() {
  if (!googleConfigured) return false
  return !!(await db.getConfig('google_refresh_token'))
}

async function getAuthedClient() {
  const refreshToken = await db.getConfig('google_refresh_token')
  if (!refreshToken) return null
  const client = oauthClient()
  client.setCredentials({ refresh_token: refreshToken })
  return client
}

// Next Mon–Fri date (calendar event DTSTART just needs any valid first occurrence;
// the weekly recurrence rule handles the rest).
function nextWeekday() {
  const now = new Date()
  const day = now.getDay() // 0 = Sun … 6 = Sat
  const addDays = day === 5 ? 3 : day === 6 ? 2 : 1
  const next = new Date(now)
  next.setDate(now.getDate() + addDays)
  return next
}

// One durable Google Meet room per class tier, created once and reused by every
// student enrolled in that class (matches the published Mon–Fri 5:10–6:10 PM slot).
async function getOrCreateMeetLink(tier) {
  const existing = await db.getMeetRoom(tier)
  if (existing?.meetLink) return existing.meetLink

  const client = await getAuthedClient()
  if (!client) return null // Google not connected yet — caller falls back to Jitsi

  const calendar = google.calendar({ version: 'v3', auth: client })
  const start = nextWeekday()
  start.setHours(17, 10, 0, 0) // 5:10 PM IST
  const end = new Date(start.getTime() + 60 * 60 * 1000)

  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `RC Tutors — ${tier}`,
      description: 'Recurring online class booked through RC Tutors.',
      start: { dateTime: start.toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: end.toISOString(), timeZone: 'Asia/Kolkata' },
      recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'],
      conferenceData: {
        createRequest: {
          requestId: `rc-${tier}-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, ''),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  })

  const meetLink = event.data.hangoutLink
  if (!meetLink) throw new Error('Google did not return a Meet link for this event.')

  await db.saveMeetRoom(tier, { meetLink, calendarEventId: event.data.id })
  return meetLink
}

module.exports = { googleConfigured, getAuthUrl, handleOAuthCallback, isGoogleConnected, getOrCreateMeetLink }
