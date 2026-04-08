'use client'

import { useEffect, useState, useRef } from 'react'

interface Message {
  id: string
  text: string
  fromUser: boolean
  read: boolean
  createdAt: string
}

interface Contact {
  email: string | null
  phone: string | null
}

export default function UserChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasContact, setHasContact] = useState(false)
  const [contact, setContact] = useState<Contact>({ email: null, phone: null })
  const [showContactForm, setShowContactForm] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 10 seconds (silent, no scroll)
    const interval = setInterval(() => fetchMessages(true), 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Only auto-scroll if user is already at bottom or just sent a message
    if (isExpanded && messagesEndRef.current) {
      const container = containerRef.current
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
  }, [messages, isExpanded])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      // Mark as read when opening
      setUnreadCount(0)
    }
  }

  const fetchMessages = async (silent = false) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('/api/user/chat', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return
      }

      const data = await res.json()
      
      // Count new unread admin messages
      const adminMessages = (data.messages || []).filter((m: Message) => !m.fromUser && !m.read)
      if (!isExpanded && adminMessages.length > unreadCount) {
        setUnreadCount(adminMessages.length)
      }
      
      setMessages(data.messages || [])
      setHasContact(data.hasContact)
      setContact(data.contact || { email: null, phone: null })
      
      if (!data.hasContact) {
        setShowContactForm(true)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const saveContact = async () => {
    if (!emailInput && !phoneInput) {
      alert('Please provide at least email or phone')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('/api/user/chat', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: emailInput || null,
          phone: phoneInput || null,
        }),
      })

      if (res.ok) {
        setHasContact(true)
        setContact({ email: emailInput || null, phone: phoneInput || null })
        setShowContactForm(false)
      }
    } catch (error) {
      console.error('Error saving contact:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const token = localStorage.getItem('token')
    if (!token) return

    setSending(true)
    try {
      const res = await fetch('/api/user/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newMessage.trim() }),
      })

      if (res.ok) {
        setNewMessage('')
        fetchMessages()
      } else if (res.status === 403) {
        setShowContactForm(true)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4">
          <div className="text-gray-400 text-sm">Loading chat...</div>
        </div>
      </div>
    )
  }

  // Contact Form Modal (shown when expanded and no contact)
  if (isExpanded && showContactForm) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="font-semibold text-cyan-400">💬 Support Chat</h3>
          <button
            onClick={toggleExpand}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2 text-cyan-400">Contact Information Required</h3>
          <p className="text-sm text-gray-300 mb-4">
            To start a conversation with support, please provide your email or phone number so we can reach you.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              onClick={saveContact}
              className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
            >
              Start Chat
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Collapsed state
  if (!isExpanded) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <button
          onClick={toggleExpand}
          className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">💬</span>
            <div className="text-left">
              <h3 className="font-semibold text-cyan-400">Support Chat</h3>
              {hasContact && (
                <div className="text-xs text-gray-400">
                  Click to open chat
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount} new
              </span>
            )}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Header */}
      <button
        onClick={toggleExpand}
        className="w-full p-4 border-b border-white/10 flex justify-between items-center hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">💬</span>
          <div className="text-left">
            <h3 className="font-semibold text-cyan-400">Support Chat</h3>
            <div className="text-xs text-gray-400">
              {contact.email && <span>📧 {contact.email}</span>}
              {contact.email && contact.phone && <span className="mx-1">•</span>}
              {contact.phone && <span>📱 {contact.phone}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowContactForm(true)
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 mr-2"
          >
            Edit
          </button>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>
      </button>

      {/* Messages */}
      <div ref={containerRef} className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No messages yet. Start a conversation with our support team!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.fromUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.fromUser
                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-white'
                    : 'bg-white/10 border border-white/20 text-white'
                }`}
              >
                <div className="text-sm">{msg.text}</div>
                <div className={`text-xs mt-1 ${msg.fromUser ? 'text-cyan-400' : 'text-gray-400'}`}>
                  {formatTime(msg.createdAt)}
                  {msg.fromUser && (
                    <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-black font-semibold transition"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
