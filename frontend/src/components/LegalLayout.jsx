import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-1">{title}</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: {lastUpdated}</p>
      <div className="space-y-6 text-gray-700 text-[15px] leading-relaxed">{children}</div>
    </div>
  )
}

export function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
