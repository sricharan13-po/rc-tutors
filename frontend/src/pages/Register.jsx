import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Mail, Lock, User, AlertCircle, GraduationCap } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', grade: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Full name must be at least 2 characters.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.'
    if (form.role === 'student' && !form.grade) e.grade = 'Please select your grade.'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setServerError('')
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm({ ...form, [key]: e.target.value })
      if (errors[key]) setErrors({ ...errors, [key]: '' })
    },
  })

  const inputClass = (key) =>
    `w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
     ${errors[key] ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/30'}`

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 text-primary font-bold text-xl mb-2 justify-center">
          <BookOpen size={24} /> RC Tutors
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">Create an account</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Join RC Tutors today</p>

        {/* Server error banner */}
        {serverError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={16} className="shrink-0" />
            {serverError}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4" noValidate>

          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Your full name" {...field('name')} className={inputClass('name')} />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" placeholder="you@example.com" {...field('email')} className={inputClass('email')} />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" placeholder="Min. 6 characters" {...field('password')} className={inputClass('password')} />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" placeholder="Re-enter your password" {...field('confirmPassword')} className={inputClass('confirmPassword')} />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.confirmPassword}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'student', label: '🎒 Student / Parent' },
                { value: 'tutor',   label: '👩‍🏫 Tutor' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all
                    ${form.role === r.value
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grade — only for students */}
          {form.role === 'student' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Grade</label>
              <div className="relative">
                <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={form.grade}
                  onChange={(e) => {
                    setForm({ ...form, grade: e.target.value })
                    if (errors.grade) setErrors({ ...errors, grade: '' })
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition appearance-none
                    ${errors.grade ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/30'}`}
                >
                  <option value="">Select grade</option>
                  {[1,2,3,4,5,6].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
              {errors.grade && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.grade}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
