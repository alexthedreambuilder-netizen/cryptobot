'use client'

import { useEffect, useState, useRef } from 'react'

interface Chat {
  id: string
  chatId: number
  username: string | null
  firstName: string | null
  lastName: string | null
  status: string
  lastMessageAt: string
  unreadCount: number
}

interface Message {
  id: string
  text: string
  fromUser: boolean
  read: boolean
  createdAt: string
}

export default function TelegramChat() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch chats list
  const fetchChats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('/api/telegram/admin/chats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setChats(data.chats)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch messages for selected chat
  const fetchMessages = async (chatId: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`/api/telegram/admin/messages?chatId=${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || sending) return

    const token = localStorage.getItem('token')
    if (!token) return

    setSending(true)
    try {
      const res = await fetch('/api/telegram/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat.chatId,
          text: newMessage.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        scrollToBottom()
        fetchChats() // Refresh chat list
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Initial load
  useEffect(() => {
    fetchChats()
    const interval = setInterval(fetchChats, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  // Load messages when chat selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.chatId)
      const interval = setInterval(() => fetchMessages(selectedChat.chatId), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedChat])

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDisplayName = (chat: Chat) => {
    if (chat.firstName) {
      return `${chat.firstName} ${chat.lastName || ''}`.trim()
    }
    if (chat.username) {
      return `@${chat.username}`
    }
    return `User #${chat.chatId}`
  }

  if (loading) {
    return (
      <div className="p-4 text-gray-400">
        <div className="animate-pulse">Loading chats...</div>
      </div>
    )
  }

  return (
    <div className="flex h-96 bg-gray-900/50 rounded-xl border border-white/10 overflow-hidden">
      {/* Chat List */}
      <div className="w-64 border-r border-white/10 overflow-y-auto">
        <div className="p-3 border-b border-white/10 font-semibold text-cyan-400">
          💬 Telegram Chats
        </div>
        {chats.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm">No chats yet</div>
        ) : (
          chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full p-3 text-left border-b border-white/5 hover:bg-white/5 transition ${
                selectedChat?.id === chat.id ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white truncate">
                  {getDisplayName(chat)}
                </span>
                {chat.unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatTime(chat.lastMessageAt)}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-3 border-b border-white/10">
              <div className="font-semibold text-white">
                {getDisplayName(selectedChat)}
              </div>
              <div className="text-xs text-gray-500">
                ID: {selectedChat.chatId} • {selectedChat.username && `@${selectedChat.username}`}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-8">
                  No messages yet
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.fromUser ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-xl ${
                        msg.fromUser
                          ? 'bg-gray-700 text-white'
                          : 'bg-cyan-500 text-black'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                      <div className={`text-xs mt-1 ${msg.fromUser ? 'text-gray-400' : 'text-cyan-900'}`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition disabled:opacity-50"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
