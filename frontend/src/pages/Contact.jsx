import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Mail, User, Phone, BookOpen, GraduationCap, MessageSquare, AlertCircle, CheckCircle, Send } from 'lucide-react'

const SUBJECTS = ['Math', 'Science', 'English', 'Writing', 'Finance', 'French']
const GRADES = [1, 2, 3, 4, 5, 6]

// RC Tutors WhatsApp number (India +91)
const WHATSAPP_NUMBER = '917207152080'

export default function Contact() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const tutor = params.get('tutor') || 'Sricharan Vasireddy'

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    subject: params.get('subject') || '',
    grade: '', message: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your name.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.message.trim() || form.message.trim().length < 5) e.message = 'Please enter a message.'
    return e
  }

  const buildWhatsAppUrl = () => {
    const lines = [
      '*New enquiry from RC Tutors*',
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : null,
      form.subject ? `Subject: ${form.subject}` : null,
      form.grade ? `Grade: ${form.grade}` : null,
      `Message: ${form.message}`,
    ].filter(Boolean)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setServerError('')
    setLoading(true)
    try {
      // Save a record on the server (best-effort)
      await api.post('/enquiries', { ...form, tutor }).catch(() => {})
      // Open WhatsApp with the enquiry pre-filled
      window.open(buildWhatsAppUrl(), '_blank')
      setSent(true)
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (key) =>
    `w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
     ${errors[key] ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/30'}`

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enquiry Sent!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Thanks {form.name.split(' ')[0]}! WhatsApp should have opened with your message ready to send to {tutor}. If it didn't, tap the button below.
          </p>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors mb-3"
          >
            <MessageSquare size={18} /> Send on WhatsApp
          </a>
          <button
            onClick={() => navigate('/tutors')}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Tutors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50 py-10">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">

        <div className="flex items-center gap-2 text-primary font-bold text-xl mb-2 justify-center">
          <MessageSquare size={22} /> Contact Us
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">Send an Enquiry</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Have a question for {tutor}? We'll get back to you soon.</p>

        {serverError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={16} className="shrink-0" /> {serverError}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4" noValidate>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Your name" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass('name')} />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass('email')} />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="tel" placeholder="Your phone number" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass('phone')} />
            </div>
          </div>

          {/* Subject + Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={form.subject} onChange={(e) => set('subject', e.target.value)} className={`${inputClass('subject')} appearance-none`}>
                  <option value="">Select</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Grade</label>
              <div className="relative">
                <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={form.grade} onChange={(e) => set('grade', e.target.value)} className={`${inputClass('grade')} appearance-none`}>
                  <option value="">Select</option>
                  {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
            <textarea
              rows={4}
              placeholder="How can we help?"
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition resize-none
                ${errors.message ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/30'}`}
            />
            {errors.message && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Sending…' : <><Send size={16} /> Send Enquiry</>}
          </button>
        </form>
      </div>
    </div>
  )
}
