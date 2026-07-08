import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, Trash2, Video } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../api/client'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    setBookings(JSON.parse(localStorage.getItem('rc_bookings') || '[]'))
    // Enrollments live on the server (tied to the account), not the browser —
    // so a paid class shows up on any device the student logs into.
    api.get('/enrollments').then((r) => setEnrollments(r.data)).catch(() => {})
  }, [])

  const cancelBooking = (id) => {
    const updated = bookings.filter((b) => b.id !== id)
    localStorage.setItem('rc_bookings', JSON.stringify(updated))
    setBookings(updated)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">
        Welcome back, {user?.name}!
      </h1>
      <p className="text-gray-500 text-sm mb-8 capitalize">Role: {user?.role}</p>

      {/* Enrolled (paid) classes */}
      {enrollments.length > 0 && (
        <div className="mb-10">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <Video size={18} /> Your Enrolled Classes
          </h2>
          <div className="space-y-3">
            {enrollments.map((en) => (
              <div key={en.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4 border-l-4 border-green-400">
                <div>
                  <p className="font-semibold text-gray-800">{en.tier}</p>
                  <p className="text-sm text-gray-500 mb-0.5">Grades {en.grades} · ₹{en.price?.toLocaleString('en-IN')} / month</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={13} className="text-primary" /> {en.schedule}
                  </p>
                </div>
                <a
                  href={en.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors shrink-0"
                >
                  <Video size={16} /> Join Class
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
        <Calendar size={18} /> Your Booked Classes
      </h2>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
          <p className="mb-4">No classes booked yet.</p>
          <button
            onClick={() => navigate('/tutors')}
            className="bg-primary text-white px-6 py-2 rounded-xl text-sm hover:bg-purple-700 transition-colors"
          >
            Find a Tutor
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {b.tutorName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{b.tutorName}</p>
                  <div className="flex flex-wrap gap-1 mt-0.5 mb-1">
                    {b.subjects.map((s) => (
                      <span key={s} className="bg-purple-50 text-primary text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock size={13} className="text-primary" />
                    {b.batch} · {b.time} · {b.schedule}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                  <CheckCircle size={13} /> Confirmed
                </span>
                <button
                  onClick={() => cancelBooking(b.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  title="Cancel booking"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
