import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function TutorCard({ tutor }) {
  const { id, name, avatar_url, profile } = tutor

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-primary font-bold text-xl overflow-hidden">
          {avatar_url
            ? <img src={avatar_url} alt={name} className="w-full h-full object-cover" />
            : name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
        </div>
      </div>

      <p className="text-gray-500 text-sm line-clamp-2">{profile.bio || 'Experienced tutor ready to help!'}</p>

      <div className="flex flex-wrap gap-1">
        {(profile.subjects || []).map((s) => (
          <span key={s} className="bg-purple-50 text-primary text-xs px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>

      <div className="flex items-center text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <BookOpen size={14} />
          Grades: {(profile.grades || []).join(', ')}
        </span>
      </div>

      <Link
        to={`/tutors/${id}`}
        className="mt-auto bg-primary text-white text-center py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
      >
        View Profile
      </Link>
    </div>
  )
}
