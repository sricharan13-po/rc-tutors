import { useNavigate } from 'react-router-dom'
import { CheckCircle, Star, Users } from 'lucide-react'

const PLANS = [
  {
    tier: 'Lower Primary',
    grades: 'Grades 1 – 2',
    price: 1250,
    icon: '🌱',
    color: 'from-green-400 to-emerald-500',
    border: 'border-emerald-200',
    badge: '',
    subjects: ['Math', 'Science', 'Writing'],
    includes: [
      'Small batch of 5 students',
      'Fun, activity-based learning',
      'Weekly progress report',
      'Session recap notes',
      'Parent update after each session',
    ],
  },
  {
    tier: 'Middle Primary',
    grades: 'Grades 3 – 4',
    price: 1500,
    icon: '📚',
    color: 'from-primary to-indigo-600',
    border: 'border-primary',
    badge: 'Most Popular',
    subjects: ['Math', 'Science', 'Writing'],
    includes: [
      'Small batch of 5 students',
      'Concept building & problem solving',
      'Weekly progress report',
      'Homework help & exam prep',
      'Parent update after each session',
      'Practice worksheets',
    ],
  },
  {
    tier: 'Upper Primary',
    grades: 'Grades 5 – 6',
    price: 1750,
    icon: '🚀',
    color: 'from-purple-500 to-pink-500',
    border: 'border-purple-200',
    badge: '',
    subjects: ['Math', 'Science', 'Writing', 'Finance'],
    includes: [
      'Small batch of 5 students',
      'Advanced concepts & critical thinking',
      'Weekly progress report',
      'Exam strategy & test prep',
      'Parent update after each session',
      'Practice worksheets',
      'Monthly performance review',
    ],
  },
]

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">Simple, Grade-Based Pricing</h1>
        <p className="text-purple-200 text-lg max-w-xl mx-auto">
          Transparent rates tailored to each stage of your child's learning journey. No hidden fees.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`bg-white rounded-2xl shadow-sm border-2 ${plan.border} overflow-hidden flex flex-col relative`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={11} fill="white" /> {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                <div className="text-4xl mb-2">{plan.icon}</div>
                <h2 className="text-xl font-bold">{plan.tier}</h2>
                <p className="text-white/80 text-sm">{plan.grades}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-extrabold">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-white/70 mb-1">/ month</span>
                </div>
              </div>

              {/* Subjects */}
              <div className="px-6 pt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Subjects</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {plan.subjects.map((s) => (
                    <span key={s} className="bg-purple-50 text-primary text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              {/* What's included */}
              <div className="px-6 pb-6 flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What's included</p>
                <ul className="space-y-2">
                  {plan.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => navigate(`/payment?tier=${encodeURIComponent(plan.tier)}&price=${plan.price}&grades=${encodeURIComponent(plan.grades.replace('Grades ', ''))}`)}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors
                    ${plan.badge
                      ? 'bg-primary text-white hover:bg-purple-700'
                      : 'border-2 border-primary text-primary hover:bg-purple-50'}`}
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Specialised Classes Row */}
      <section className="max-w-5xl mx-auto px-4 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">✨</span>
          <h2 className="text-xl font-bold text-gray-800">Specialised Classes</h2>
          <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-3 py-1 rounded-full">New</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Finance */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-yellow-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-5 text-white">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-lg font-bold">Finance</h3>
              <p className="text-white/80 text-sm">Grade 6 only</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-extrabold">₹500</span>
                <span className="text-white/70 mb-1">/ month</span>
              </div>
            </div>
            <div className="px-5 py-5 flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What's included</p>
              <ul className="space-y-2">
                {[
                  'Small batch of 5 students',
                  'Money basics & financial literacy',
                  'Real-world money scenarios',
                  'Weekly progress report',
                  'Parent update after each session',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => navigate('/payment?tier=Finance&price=500&grades=6')}
                className="w-full py-2.5 rounded-xl font-medium text-sm border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50 transition-colors"
              >
                Enroll Now
              </button>
            </div>
          </div>

          {/* French */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-5 text-white">
              <div className="text-3xl mb-2">🇫🇷</div>
              <h3 className="text-lg font-bold">French</h3>
              <p className="text-white/80 text-sm">Grades 4 – 6</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-extrabold">₹1,000</span>
                <span className="text-white/70 mb-1">/ month onwards</span>
              </div>
            </div>
            <div className="px-5 py-5 flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Pricing by grade</p>
              <div className="space-y-2 mb-4">
                {[
                  { grade: 4, price: 1000 },
                  { grade: 5, price: 1200 },
                  { grade: 6, price: 1400 },
                ].map((g) => (
                  <button
                    key={g.grade}
                    onClick={() => navigate(`/payment?tier=${encodeURIComponent('French - Grade ' + g.grade)}&price=${g.price}&grades=${g.grade}`)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm"
                  >
                    <span className="font-medium text-gray-700">Grade {g.grade}</span>
                    <span className="font-semibold text-blue-600">₹{g.price.toLocaleString('en-IN')} / month</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">Small batch of 5 students · Weekly progress report · Parent update after each session</p>
            </div>
          </div>

        </div>
      </section>

      {/* Sibling Discount */}
      <section className="max-w-2xl mx-auto px-4 pb-10">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-primary rounded-2xl p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">Sibling Discount — 10% off</p>
            <p className="text-gray-500 text-sm mt-0.5">
              Enrolling more than one child? Get <span className="font-semibold text-primary">10% off</span> the monthly fee for every sibling. Discount applies automatically at registration.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How is the session price determined?', a: 'Pricing is based on your child\'s grade group — Lower (1–2), Middle (3–4), or Upper (5–6). Higher grades involve more advanced content, which is reflected in the rate.' },
            { q: 'How long is one session?', a: 'Each session is 1 hour. You can book multiple sessions per week depending on your child\'s needs.' },
            { q: 'Can I choose the subject?', a: 'Yes! Each tutor covers Math, English, Science, and Writing. You can select the subject when booking a session.' },
            { q: 'Is there a free trial?', a: 'Yes — we offer a free 30-minute introductory session so your child can meet the tutor before committing.' },
            { q: 'Is there a sibling discount?', a: 'Yes! If you enrol more than one child, you get 10% off the monthly fee for every sibling. The discount is applied automatically when you register the second child.' },
          ].map((faq) => (
            <div key={faq.q} className="bg-white rounded-2xl shadow-sm p-5">
              <p className="font-semibold text-gray-800 mb-1">{faq.q}</p>
              <p className="text-gray-500 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-primary to-indigo-600 py-12 px-4 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
        <p className="text-purple-200 mb-6">Find the right tutor for your child today.</p>
        <button
          onClick={() => navigate('/tutors')}
          className="bg-white text-primary font-semibold px-8 py-3 rounded-xl hover:bg-purple-50 transition-colors"
        >
          Find a Tutor
        </button>
      </section>
    </div>
  )
}
