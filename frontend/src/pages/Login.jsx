import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
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
      const u = await login(form.email, form.password)
      navigate(u.role === 'admin' ? '/admin' : '/dashboard')
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

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 text-primary font-bold text-xl mb-2 justify-center">
          <BookOpen size={24} /> RC Tutors
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">Welcome back</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Sign in to your account</p>

        {/* Server error banner */}
        {serverError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={16} className="shrink-0" />
            {serverError}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                {...field('email')}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
                  ${errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/30'}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                {...field('password')}
                className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition
                  ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-primary/30'}`}
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
