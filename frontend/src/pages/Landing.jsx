import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Clock, Shield } from 'lucide-react'

const SUBJECTS = ['Math', 'Science', 'English', 'Writing', 'Finance', 'French']
const GRADES = [1, 2, 3, 4, 5, 6]

export default function Landing() {
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const navigate = useNavigate()

  const search = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    if (grade) params.set('grade', grade)
    navigate(`/tutors?${params}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Learning is an Adventure!</h1>
          <p className="text-purple-200 text-lg mb-10">
            RC Tutors — Find the perfect tutor for your child in grades 1–6. Math, English, Science and more.
          </p>

          <form onSubmit={search} className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-xl">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 text-gray-700 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="flex-1 text-gray-700 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Grades</option>
              {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </select>

            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Search size={18} /> Find Tutors
            </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto py-16 px-4 grid sm:grid-cols-3 gap-8 text-center">
        {[
          { icon: <Star size={32} className="text-yellow-400" />, title: 'Top-Rated Tutors', desc: 'All tutors are vetted and reviewed by parents.' },
          { icon: <Clock size={32} className="text-primary" />, title: 'Flexible Scheduling', desc: 'Book sessions that fit your family\'s calendar.' },
          { icon: <Shield size={32} className="text-green-500" />, title: 'Safe & Secure', desc: 'Secure payments and verified tutor profiles.' },
        ].map((f) => (
          <div key={f.title} className="flex flex-col items-center gap-3">
            {f.icon}
            <h3 className="font-semibold text-gray-800 text-lg">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Subject cards */}
      <section className="bg-purple-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Subjects</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => navigate(`/tutors?subject=${s}`)}
                className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md hover:border-primary border border-transparent transition-all"
              >
                <span className="text-2xl">{subjectEmoji(s)}</span>
                <p className="text-sm font-medium text-gray-700 mt-1">{s}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function subjectEmoji(s) {
  return { Math: '➕', English: '📚', Science: '🔬', Writing: '✏️' }[s] || '📝'
}
