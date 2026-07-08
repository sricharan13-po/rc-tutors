import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Lock, CheckCircle, ChevronLeft, Video, Calendar, Clock, AlertCircle } from 'lucide-react'

// Load the Razorpay checkout script once
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function Payment() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const tier = params.get('tier') || 'Lower Primary'
  const price = parseInt(params.get('price') || '1250')
  const grades = params.get('grades') || '1 – 2'

  const [paid, setPaid] = useState(false)
  const [meetLink, setMeetLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [configured, setConfigured] = useState(null) // null = checking

  useEffect(() => {
    api.get('/payments/config')
      .then((r) => setConfigured(r.data.configured))
      .catch(() => setConfigured(false))
  }, [])

  const handlePay = async () => {
    setError('')
    setLoading(true)
    try {
      const ok = await loadRazorpayScript()
      if (!ok) throw new Error('Could not load Razorpay. Check your internet connection.')

      // 1. Create an order on the backend
      const { data: order } = await api.post('/payments/create-order', { amount: price, tier, grades })

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'RC Tutors',
        description: `${tier} · Grades ${grades}`,
        order_id: order.orderId,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#6C63FF' },
        handler: async (response) => {
          // 3. Verify the payment signature on the backend — the server records the
          // payment and creates the enrollment; it's the single source of truth.
          try {
            const { data } = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              tier, price, grades,
            })
            setMeetLink(data.enrollment?.meetLink || '')
            setPaid(true)
          } catch {
            setError('Payment could not be verified. If money was deducted, please contact us.')
          } finally {
            setLoading(false)
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 text-sm mb-1">You're now enrolled in</p>
          <p className="text-primary font-semibold text-lg mb-1">{tier}</p>
          <p className="text-gray-400 text-sm mb-5">Grades {grades} · ₹{price.toLocaleString('en-IN')} / month</p>

          {/* How to join */}
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">How to join your class</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Calendar size={15} className="text-primary shrink-0" /> Monday – Friday
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Clock size={15} className="text-primary shrink-0" /> 5:10 PM – 6:10 PM
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video size={15} className="text-primary shrink-0" /> Online video class — no app or sign-in needed
            </div>
          </div>

          <a
            href={meetLink}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors mb-3"
          >
            <Video size={18} /> Join Video Class
          </a>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Go to Dashboard
          </button>
          <p className="text-xs text-gray-400 mt-3">The class link is also saved in your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">

        <button onClick={() => navigate('/pricing')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Pricing
        </button>

        <div className="grid gap-5">

          {/* Order summary */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order Summary</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{tier}</p>
                <p className="text-sm text-gray-500">Grades {grades} · Monthly subscription</p>
              </div>
              <p className="text-2xl font-extrabold text-primary">₹{price.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Checkout */}
          <div className="bg-white rounded-2xl shadow-sm p-6">

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            {configured === false && (
              <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>Payments aren't set up yet. Add your Razorpay test keys in <code className="bg-yellow-100 px-1 rounded">mock-server/server.js</code> to enable checkout.</span>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-1">You'll pay securely via Razorpay.</p>
            <p className="text-xs text-gray-400 mb-5">Cards, UPI, net banking &amp; wallets are supported. Your card details never touch our servers.</p>

            <button
              onClick={handlePay}
              disabled={loading || configured !== true}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Opening checkout…' : <>Pay ₹{price.toLocaleString('en-IN')}</>}
            </button>

            <p className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-3">
              <Lock size={12} /> Secured by Razorpay
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
