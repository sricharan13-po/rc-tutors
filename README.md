# RC Tutors

A tutoring-services web app for grades 1–6. Parents can browse the tutor, view grade-based pricing, enrol and pay online, join classes over video, and send enquiries that arrive on the tutor's WhatsApp.

## Subjects & Tutor
- **Tutor:** Sricharan Vasireddy
- **Subjects:** Math, Science, Writing, Finance (Grade 6), French (Grades 4–6)
- **Schedule:** Monday–Friday · Batch 1 (5:10–6:10 PM), Batch 2 (7:20–8:20 PM)

## Tech Stack
- **Frontend:** React + Vite + TailwindCSS + React Query + React Router
- **Backend (mock):** Node.js + Express + JWT + bcryptjs
- **Payments:** Razorpay checkout (test mode)
- **Video classes:** Jitsi Meet (no account/app needed)
- **Contact:** WhatsApp click-to-chat

> A FastAPI Python backend also exists under `backend/` but is not used (incompatible with Python 3.14). The Node mock server in `mock-server/` is the active backend.

## Getting Started

### 1. Backend (mock server)
```bash
cd mock-server
npm install
node server.js       # runs on http://localhost:8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev          # runs on http://localhost:5173
```

## Payments (Razorpay)
Checkout stays disabled until you add your Razorpay **test** keys in `mock-server/server.js`:

```js
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXX'
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YOUR_TEST_KEY_SECRET'
```

Get them from the Razorpay Dashboard → Test Mode → API Keys. Test card: `4111 1111 1111 1111`.

## Notes
- `mock-server/db.json` (registered accounts) is git-ignored and never committed.
- Bookings and enrolments are stored in the browser's `localStorage` for this demo.
