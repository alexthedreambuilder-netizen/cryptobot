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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
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
      setMessages(data.messages || [])
      setHasContact(data.hasContact)
      setContact(data.contact || { email: null, phone: null })
      
      if (!data.hasContact) {
        setShowContactForm(true)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
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
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="text-gray-400 text-sm">Loading chat...</div>
      </div>
    )
  }

  // Contact Form Modal
  if (showContactForm) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
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
    )
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-cyan-400">Support Chat</h3>
          <div className="text-xs text-gray-400">
            {contact.email && <span>📧 {contact.email}</span>}
            {contact.email && contact.phone && <span className="mx-2">•</span>}
            {contact.phone && <span>📱 {contact.phone}</span>}
          </div>
        </div>
        <button
          onClick={() => setShowContactForm(true)}
          className="text-xs text-cyan-400 hover:text-cyan-300"
        >
          Edit Contact
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
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
