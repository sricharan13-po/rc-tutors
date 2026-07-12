import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, MessageSquare, LayoutDashboard, Shield } from 'lucide-react'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <Logo size={30} />
          RC Tutors
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/tutors" className="text-gray-600 hover:text-primary transition-colors">
            Find Tutors
          </Link>
          <Link to="/pricing" className="text-gray-600 hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
            <MessageSquare size={16} /> Contact
          </Link>

          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
                  <Shield size={16} /> Admin
                </Link>
              ) : (
                <Link to="/dashboard" className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User size={16} />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors text-sm"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">Login</Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
