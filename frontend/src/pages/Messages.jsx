import { useSearchParams } from 'react-router-dom'
import ChatWindow from '../components/ChatWindow'

export default function Messages() {
  const [params] = useSearchParams()
  const withId = params.get('with')
  const withName = params.get('name') || 'User'

  if (!withId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        <p>Select a conversation from a tutor profile or booking.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 h-[calc(100vh-120px)]">
      <ChatWindow otherUserId={parseInt(withId)} otherUserName={withName} />
    </div>
  )
}
