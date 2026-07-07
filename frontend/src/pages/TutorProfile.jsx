import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { BookOpen, MessageSquare, Clock, Calendar, X, CheckCircle } from 'lucide-react'

const AVAILABILITY = {
  Mon: ['17:10', '19:20'],
  Tue: ['17:10', '19:20'],
  Wed: ['17:10', '19:20'],
  Thu: ['17:10', '19:20'],
  Fri: ['17:10', '19:20'],
}

const DEFAULT_TUTORS = {
  'default-1': {
    id: 'default-1', name: 'Sricharan Vasireddy', email: 'sricharan@rctutors.com', avatar_url: null,
    profile: { subjects: ['Math', 'Science', 'Writing', 'Finance', 'French'], grades: [1,2,3,4,5,6], bio: 'Passionate educator with expertise in Math, Science, Writing, Finance and French for grades 1–6. Making learning fun with real-world examples and interactive problem-solving.', hourly_rate: 0, availability: AVAILABILITY },
  },
}

const BATCHES = [
  { label: 'Batch 1', time: '5:10 PM – 6:10 PM' },
  { label: 'Batch 2', time: '7:20 PM – 8:20 PM' },
]

export default function TutorProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  const { data: tutor, isLoading } = useQuery({
    queryKey: ['tutor', id],
    queryFn: async () => {
      if (DEFAULT_TUTORS[id]) return DEFAULT_TUTORS[id]
      const { data } = await api.get(`/tutors/${id}`)
      return data
    },
  })

  if (isLoading) return <div className="text-center py-20 text-gray-400">Loading...</div>
  if (!tutor) return <div className="text-center py-20 text-red-400">Tutor not found</div>

  const { profile } = tutor

  const handleBookClick = () => {
    if (!user) { navigate('/register'); return }
    setSelectedBatch(null)
    setConfirmed(false)
    setShowModal(true)
  }

  const handleConfirm = () => {
    if (!selectedBatch) return
    const existing = JSON.parse(localStorage.getItem('rc_bookings') || '[]')
    const booking = {
      id: Date.now(),
      tutorId: tutor.id,
      tutorName: tutor.name,
      subjects: profile.subjects,
      batch: selectedBatch.label,
      time: selectedBatch.time,
      schedule: 'Monday – Friday',
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    }
    localStorage.setItem('rc_bookings', JSON.stringify([...existing, booking]))
    setConfirmed(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex gap-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-primary font-bold text-3xl shrink-0">
          {tutor.avatar_url
            ? <img src={tutor.avatar_url} alt={tutor.name} className="w-full h-full rounded-full object-cover" />
            : tutor.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{tutor.name}</h1>
          <div className="flex flex-wrap gap-2 text-sm mt-1">
            <span className="flex items-center gap-1 text-gray-600"><BookOpen size={14} /> Grades {profile.grades.join(', ')}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.subjects.map((s) => (
              <span key={s} className="bg-purple-50 text-primary text-xs px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate(`/contact?tutor=${encodeURIComponent(tutor.name)}`)}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm h-fit transition-colors"
        >
          <MessageSquare size={16} /> Contact
        </button>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">About</h2>
          <p className="text-gray-600 text-sm">{profile.bio}</p>
        </div>
      )}

      {/* Class Schedule */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-primary" /> Class Schedule
        </h2>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <Calendar size={14} className="text-primary" />
          <span>Monday – Friday</span>
        </div>

        <div className="space-y-3">
          {BATCHES.map((batch) => (
            <div key={batch.label} className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-gray-700">{batch.label}</span>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Clock size={14} />
                {batch.time}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleBookClick}
          className="mt-6 w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors text-sm"
        >
          Book a Class
        </button>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {confirmed ? (
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">Booking Confirmed!</h3>
                <p className="text-gray-500 text-sm mb-1">
                  You've booked <span className="font-semibold text-primary">{selectedBatch.label}</span> with <span className="font-semibold">{tutor.name}</span>.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  <Clock size={13} className="inline mr-1 text-primary" />{selectedBatch.time} · Monday – Friday
                </p>
                <button
                  onClick={() => { setShowModal(false); navigate('/dashboard') }}
                  className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors text-sm"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Book a Class</h3>
                <p className="text-gray-500 text-sm mb-5">with <span className="font-medium text-gray-700">{tutor.name}</span> · Monday – Friday</p>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Select a batch</p>
                <div className="space-y-3 mb-6">
                  {BATCHES.map((batch) => (
                    <button
                      key={batch.label}
                      onClick={() => setSelectedBatch(batch)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors text-sm
                        ${selectedBatch?.label === batch.label
                          ? 'border-primary bg-purple-50 text-primary'
                          : 'border-gray-200 hover:border-primary text-gray-700'}`}
                    >
                      <span className="font-medium">{batch.label}</span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock size={13} /> {batch.time}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!selectedBatch}
                  className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Booking
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
