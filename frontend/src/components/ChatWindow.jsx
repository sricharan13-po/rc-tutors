import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { Send } from 'lucide-react'
import { format } from 'date-fns'

export default function ChatWindow({ otherUserId, otherUserName }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  const wsRef = useRef(null)

  useEffect(() => {
    api.get(`/messages/${otherUserId}`).then((r) => setMessages(r.data))

    const ws = new WebSocket(`ws://localhost:8000/messages/ws/${user.id}`)
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      setMessages((prev) => [...prev, msg])
    }
    wsRef.current = ws
    return () => ws.close()
  }, [otherUserId, user.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const { data } = await api.post('/messages', { receiver_id: otherUserId, content: text })
    setMessages((prev) => [...prev, data])
    setText('')
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700">{otherUserName}</div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const mine = m.sender_id === user.id
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${mine ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p>{m.content}</p>
                <p className={`text-xs mt-1 ${mine ? 'text-purple-200' : 'text-gray-400'}`}>
                  {format(new Date(m.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 p-3 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button type="submit" className="bg-primary text-white rounded-full p-2 hover:bg-purple-700 transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
