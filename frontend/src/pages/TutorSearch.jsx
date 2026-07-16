import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/client'
import TutorCard from '../components/TutorCard'
import { SlidersHorizontal } from 'lucide-react'

const SUBJECTS = ['Math', 'Science', 'English', 'Writing', 'Finance', 'French']
const GRADES = [1, 2, 3, 4, 5, 6]

const AVAILABILITY = {
  Mon: ['17:10', '19:20'],
  Tue: ['17:10', '19:20'],
  Wed: ['17:10', '19:20'],
  Thu: ['17:10', '19:20'],
  Fri: ['17:10', '19:20'],
}

const DEFAULT_TUTORS = [
  {
    id: 'default-1',
    name: 'Sricharan Vasireddy',
    avatar_url: null,
    profile: {
      subjects: ['Math', 'Science', 'Writing', 'Finance', 'French'],
      grades: [1, 2, 3, 4, 5, 6],
      bio: 'Passionate educator with expertise in Math, Science, Writing, Finance and French for grades 1–6. Making learning fun with real-world examples and interactive problem-solving.',
      hourly_rate: 40,
      availability: AVAILABILITY,
    },
  },
  {
    id: 'default-2',
    name: 'Parvaresh',
    avatar_url: null,
    profile: {
      subjects: ['English', 'Writing', 'Finance'],
      grades: [1, 2, 3, 4, 5, 6],
      bio: 'Dedicated tutor for English, Writing and Finance, grades 1–6. Builds strong reading and communication skills, confident writing, and money-smarts explained simply — with plenty of encouragement.',
      hourly_rate: 40,
      availability: AVAILABILITY,
    },
  },
]

export default function TutorSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [subject, setSubject] = useState(searchParams.get('subject') || '')
  const [grade, setGrade] = useState(searchParams.get('grade') || '')

  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ['tutors', subject, grade],
    queryFn: async () => {
      try {
        const params = {}
        if (subject) params.subject = subject
        if (grade) params.grade = grade
        const { data } = await api.get('/tutors', { params })
        return data
      } catch {
        return []
      }
    },
  })

  const applyFilter = () => {
    const p = {}
    if (subject) p.subject = subject
    if (grade) p.grade = grade
    setSearchParams(p)
  }

  const getDefaultTutors = () => {
    return DEFAULT_TUTORS
  }

  const displayTutors = tutors.length > 0 ? tutors : getDefaultTutors()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6">
      {/* Sidebar */}
      <aside className="w-56 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-20">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <SlidersHorizontal size={16} /> Filters
          </h2>

          <label className="block text-xs text-gray-500 mb-1">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>

          <label className="block text-xs text-gray-500 mb-1">Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border rounded-lg px-2 py-1.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All</option>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>

          <button
            onClick={applyFilter}
            className="w-full bg-primary text-white py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </aside>

      {/* Results */}
      <main className="flex-1">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Find a Tutor</h1>
        <p className="text-gray-500 text-sm mb-6">{displayTutors.length} tutor{displayTutors.length !== 1 ? 's' : ''} available</p>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading tutors...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTutors.map((t) => <TutorCard key={t.id} tutor={t} />)}
          </div>
        )}
      </main>
    </div>
  )
}
