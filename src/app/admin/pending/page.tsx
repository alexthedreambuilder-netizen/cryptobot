'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PendingRequest {
  id: string
  userId: string
  username: string
  uniqueId: string
  type: 'DEPOSIT' | 'WITHDRAWAL'
  amount: number
  currency: string
  network?: string
  walletAddress?: string
  txHash?: string
  status: 'PENDING'
  createdAt: string
}

export default function AdminPending() {
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      router.push('/login')
      return
    }

    const user = JSON.parse(userStr)
    if (!user.isAdmin) {
      router.push('/dashboard')
      return
    }

    fetchPendingRequests(token)
  }, [router])

  const fetchPendingRequests = async (token: string) => {
    try {
      const res = await fetch('/api/admin/pending', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to load requests')

      const data = await res.json()
      setRequests(data.requests)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, action: 'approve' | 'reject', type: 'deposit' | 'withdrawal') => {
    const token = localStorage.getItem('token')
    if (!token) return

    setProcessing(requestId)
    try {
      const res = await fetch(`/api/admin/${type}/${requestId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error(`Failed to ${action} ${type}`)

      // Refresh list
      await fetchPendingRequests(token)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setProcessing(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
            Crypto Bambozl&apos;d
          </Link>
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="px-4 py-2 rounded-full bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition">👥 Users</Link>
          <Link href="/admin/pending" className="px-4 py-2 rounded-full bg-cyan-400/20 text-cyan-400 text-sm font-semibold">⏳ Pending</Link>
          <Link href="/admin/chats" className="px-4 py-2 rounded-full bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition">💬 Chats</Link>
          <button onClick={logout} className="px-4 py-2 rounded-full border border-red-400/50 text-red-400 text-sm hover:bg-red-400/10 transition">Logout</button>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">⏳ Pending Requests</h1>
          <p className="text-gray-400">Approve or reject deposit and withdrawal requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold">{requests.length}</div>
            <div className="text-xs text-gray-400">Total Pending</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-green-400">{requests.filter(r => r.type === 'DEPOSIT').length}</div>
            <div className="text-xs text-gray-400">Deposits</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-orange-400">{requests.filter(r => r.type === 'WITHDRAWAL').length}</div>
            <div className="text-xs text-gray-400">Withdrawals</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">
              ${requests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Total Amount</div>
          </div>
        </div>

        {/* Requests Table */}
        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl">No pending requests</p>
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        req.type === 'DEPOSIT' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {req.type === 'DEPOSIT' ? '📥 DEPOSIT' : '📤 WITHDRAWAL'}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-300">{new Date(req.createdAt).toLocaleString()}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <div className="text-xs text-gray-500">User</div>
                        <div className="font-semibold">{req.username}</div>
                        <div className="text-xs text-gray-500 font-mono">{req.uniqueId}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Amount</div>
                        <div className="text-2xl font-bold text-white">${req.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Currency</div>
                        <div className="font-semibold">{req.currency}</div>
                        {req.network && (
                          <div className="text-xs text-gray-400">{req.network}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">{req.type === 'DEPOSIT' ? 'To Address' : 'To Wallet'}</div>
                        <code className="text-xs font-mono text-cyan-400 break-all">
                          {req.walletAddress || 'N/A'}
                        </code>
                      </div>
                    </div>

                    {req.txHash && (
                      <div className="mt-3 p-3 rounded-lg bg-gray-900/50">
                        <div className="text-xs text-gray-500 mb-1">Transaction Hash</div>
                        <code className="text-sm font-mono text-yellow-400 break-all">{req.txHash}</code>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(req.id, 'reject', req.type.toLowerCase() as 'deposit' | 'withdrawal')}
                      disabled={processing === req.id}
                      className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition disabled:opacity-50"
                    >
                      {processing === req.id ? '...' : '❌ Reject'}
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'approve', req.type.toLowerCase() as 'deposit' | 'withdrawal')}
                      disabled={processing === req.id}
                      className="px-6 py-3 rounded-xl bg-green-500/20 text-green-400 font-semibold hover:bg-green-500/30 transition disabled:opacity-50"
                    >
                      {processing === req.id ? '...' : '✅ Approve'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
