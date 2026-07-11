import { useState, useEffect } from 'react'
import api from '../api/client'
import GoogleMeetIcon from '../components/GoogleMeetIcon'
import { Users, MessageSquare, Video, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

function formatDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return iso }
}

export default function Admin() {
  const [data, setData] = useState({ enquiries: [], enrollments: [], payments: [] })
  const [loading, setLoading] = useState(true)
  const [meetLink, setMeetLink] = useState('')
  const [meetInput, setMeetInput] = useState('')
  const [savingLink, setSavingLink] = useState(false)
  const [linkMsg, setLinkMsg] = useState('')
  const [linkErr, setLinkErr] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/overview').then((r) => setData(r.data)),
      api.get('/admin/meet-link').then((r) => { setMeetLink(r.data.meetLink); setMeetInput(r.data.meetLink) }),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const saveMeetLink = async () => {
    setLinkMsg(''); setLinkErr(''); setSavingLink(true)
    try {
      const { data: res } = await api.put('/admin/meet-link', { meetLink: meetInput.trim() })
      setMeetLink(res.meetLink)
      setLinkMsg('Saved — all students now use this link.')
    } catch (err) {
      setLinkErr(err.response?.data?.detail || 'Could not save the link.')
    } finally {
      setSavingLink(false)
    }
  }

  const totalRevenue = data.payments.reduce((sum, p) => sum + (p.price || 0), 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage enquiries, students, and your class link.</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Paid Students</p>
          <p className="text-2xl font-extrabold text-gray-800">{data.enrollments.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Enquiries</p>
          <p className="text-2xl font-extrabold text-gray-800">{data.enquiries.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Collected</p>
          <p className="text-2xl font-extrabold text-primary">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Meet link editor */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-1">
          <GoogleMeetIcon size={18} /> Class Google Meet Link
        </h2>
        <p className="text-sm text-gray-400 mb-4">This is the room every student joins. Change it anytime — everyone updates automatically.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={meetInput}
            onChange={(e) => setMeetInput(e.target.value)}
            placeholder="https://meet.google.com/abc-defg-hij"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={saveMeetLink}
            disabled={savingLink || meetInput.trim() === meetLink}
            className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingLink ? 'Saving…' : 'Save Link'}
          </button>
        </div>
        {linkMsg && <p className="text-green-600 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} />{linkMsg}</p>}
        {linkErr && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{linkErr}</p>}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Loading…</p>
      ) : (
        <>
          {/* Paid students */}
          <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <Users size={18} /> Paid Students
          </h2>
          {data.enrollments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400 mb-8">No paid enrolments yet.</div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Paid</th>
                    <th className="px-4 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.enrollments.map((en) => (
                    <tr key={en.id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{en.tier}</td>
                      <td className="px-4 py-3 text-gray-600">{en.grades}</td>
                      <td className="px-4 py-3 text-gray-600">₹{en.price?.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(en.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Enquiries */}
          <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <MessageSquare size={18} /> Enquiries
          </h2>
          {data.enquiries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">No enquiries yet.</div>
          ) : (
            <div className="space-y-3">
              {data.enquiries.map((eq) => (
                <div key={eq.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <p className="font-semibold text-gray-800">{eq.name}</p>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(eq.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                    <span>✉️ {eq.email}</span>
                    {eq.phone && <span>📞 {eq.phone}</span>}
                    {eq.subject && <span>📘 {eq.subject}</span>}
                    {eq.grade && <span>🎓 Grade {eq.grade}</span>}
                  </div>
                  <p className="text-sm text-gray-700">{eq.message}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
