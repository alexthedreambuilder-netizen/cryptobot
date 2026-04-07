'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  unreadCount: number
  lastMessage: {
    text: string
    fromUser: boolean
    createdAt: string
  } | null
}

interface Message {
  id: string
  text: string
  fromUser: boolean
  read: boolean
  createdAt: string
}

interface UserWithMessages {
  user: {
    id: string
    username: string
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    points: number
    level: number
  }
  messages: Message[]
}

export default function AdminChats() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithMessages | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
    fetchChats()
    // Poll for new chats every 10 seconds
    const interval = setInterval(fetchChats, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedUser) {
      scrollToBottom()
    }
  }, [selectedUser])

  const checkAdmin = () => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    if (!user.isAdmin) {
      router.push('/dashboard')
    }
  }

  const fetchChats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('/api/admin/chats', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
        }
        return
      }

      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const openChat = async (userId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`/api/admin/chat/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setSelectedUser(data)
        // Refresh user list to update unread counts
        fetchChats()
      }
    } catch (error) {
      console.error('Error opening chat:', error)
    }
  }

  const sendReply = async () => {
    if (!replyText.trim() || !selectedUser) return

    const token = localStorage.getItem('token')
    if (!token) return

    setSending(true)
    try {
      const res = await fetch(`/api/admin/chat/${selectedUser.user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: replyText.trim() }),
      })

      if (res.ok) {
        setReplyText('')
        openChat(selectedUser.user.id)
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setSending(false)
    }
  }

  const sendEmail = () => {
    if (!selectedUser?.user.email) {
      alert('User has no email address')
      return
    }
    
    const subject = encodeURIComponent(emailSubject || 'Re: Your Support Request')
    const body = encodeURIComponent(emailBody)
    window.open(`mailto:${selectedUser.user.email}?subject=${subject}&body=${body}`)
    setShowEmailForm(false)
    setEmailSubject('')
    setEmailBody('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="px-4 py-2 rounded-full border border-white/20 text-gray-300 hover:bg-white/5 transition"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold text-cyan-400">Support Chats</h1>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* User List */}
          <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-lg">Conversations</h2>
              <div className="text-sm text-gray-400">
                {users.length} active chat{users.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {users.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No active chats
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => openChat(user.id)}
                      className={`w-full p-4 text-left hover:bg-white/5 transition ${
                        selectedUser?.user.id === user.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-white">
                            {user.firstName || user.username}
                            {user.lastName && ` ${user.lastName}`}
                          </div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                          {user.email && (
                            <div className="text-xs text-cyan-400 mt-1">📧 {user.email}</div>
                          )}
                          {user.phone && (
                            <div className="text-xs text-green-400">📱 {user.phone}</div>
                          )}
                        </div>
                        {user.unreadCount > 0 && (
                          <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                            {user.unreadCount}
                          </span>
                        )}
                      </div>
                      {user.lastMessage && (
                        <div className="mt-2 text-sm text-gray-400 truncate">
                          {user.lastMessage.fromUser ? '👤' : '🤖'} {user.lastMessage.text}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {!selectedUser ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to view messages
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">
                      {selectedUser.user.firstName || selectedUser.user.username}
                      {selectedUser.user.lastName && ` ${selectedUser.user.lastName}`}
                    </div>
                    <div className="text-sm text-gray-400">
                      LvL {selectedUser.user.level} • ${selectedUser.user.points.toLocaleString()}
                    </div>
                    <div className="flex gap-2 mt-1">
                      {selectedUser.user.email && (
                        <span className="text-xs text-cyan-400">📧 {selectedUser.user.email}</span>
                      )}
                      {selectedUser.user.phone && (
                        <span className="text-xs text-green-400">📱 {selectedUser.user.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedUser.user.email && (
                      <button
                        onClick={() => setShowEmailForm(true)}
                        className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/30 transition"
                      >
                        ✉️ Email
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedUser.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.fromUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          msg.fromUser
                            ? 'bg-white/10 border border-white/20 text-white'
                            : 'bg-cyan-500/20 border border-cyan-500/30 text-white'
                        }`}
                      >
                        <div className="text-sm">{msg.text}</div>
                        <div className={`text-xs mt-1 ${msg.fromUser ? 'text-gray-400' : 'text-cyan-400'}`}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-black font-semibold transition"
                    >
                      {sending ? '...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Email Modal */}
      {showEmailForm && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-lg w-full border border-white/20">
            <h3 className="text-lg font-semibold mb-4">Send Email</h3>
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">To</label>
              <div className="px-3 py-2 rounded-lg bg-white/5 text-white">
                {selectedUser.user.email}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Re: Your Support Request"
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-400 block mb-1">Message</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={5}
                placeholder="Type your email message..."
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowEmailForm(false)}
                className="px-4 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={sendEmail}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
              >
                Open Email Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
