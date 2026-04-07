'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  uniqueId: string
  level: number
  points: number
  activeReferrals: number
  totalReferrals: number
  daysWithoutWithdrawal: number
  totalPercent: number
  isAdmin: boolean
  createdAt: string
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pointsAmount, setPointsAmount] = useState('')
  const [pointsReason, setPointsReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
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

    fetchUsers(token)
  }, [router])

  useEffect(() => {
    if (search.trim()) {
      setFilteredUsers(users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.uniqueId.toLowerCase().includes(search.toLowerCase())
      ))
    } else {
      setFilteredUsers(users)
    }
  }, [search, users])

  const fetchUsers = async (token: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Error loading users')
      }

      const data = await res.json()
      setUsers(data.users)
      setFilteredUsers(data.users)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePointsAction = async (isAdd: boolean) => {
    if (!selectedUser || !pointsAmount) return

    const token = localStorage.getItem('token')
    if (!token) return

    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/points', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          points: isAdd ? parseInt(pointsAmount) : -parseInt(pointsAmount),
          reason: pointsReason || (isAdd ? 'Deposit' : 'Withdrawal'),
        }),
      })

      if (!res.ok) {
        throw new Error('Error modifying balance')
      }

      await fetchUsers(token)
      setSelectedUser(null)
      setPointsAmount('')
      setPointsReason('')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
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
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
            Crypto Bambozl&apos;d
          </Link>
          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link>
          <button onClick={logout} className="px-4 py-2 rounded-full border border-red-400/50 text-red-400 text-sm hover:bg-red-400/10 transition">Logout</button>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <input type="text" placeholder="Search by username or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-gray-400">Total Users</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold">{users.filter(u => u.points > 0).length}</div>
            <div className="text-xs text-gray-400">With Balance</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold">{users.filter(u => u.activeReferrals > 0).length}</div>
            <div className="text-xs text-gray-400">With Referrals</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold">${users.reduce((sum, u) => sum + u.points, 0).toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Balance</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Username</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Balance</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Refs</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">No Withdraw</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">%</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.username}
                      {user.isAdmin && <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">ADMIN</span>}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{user.uniqueId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded bg-${['gray','green','cyan','blue','yellow'][user.level]}-500/20 text-${['gray','green','cyan','blue','yellow'][user.level]}-400 text-sm font-bold`}>LvL {user.level}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">${user.points.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm"><span className={user.activeReferrals > 0 ? 'text-green-400' : 'text-gray-500'}>{user.activeReferrals}/{user.totalReferrals}</span></td>
                  <td className="px-4 py-3 text-sm"><span className={user.daysWithoutWithdrawal >= 4 ? 'text-green-400' : 'text-yellow-400'}>{user.daysWithoutWithdrawal}d</span></td>
                  <td className="px-4 py-3 font-mono text-cyan-400">{user.totalPercent.toFixed(2)}%</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedUser(user)} className="px-3 py-1 rounded bg-cyan-400/20 text-cyan-400 text-sm hover:bg-cyan-400/30 transition">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && <div className="text-center py-12 text-gray-500">No users found</div>}
      </main>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-6 rounded-2xl bg-gray-900 border border-white/10">
            <h3 className="text-xl font-bold mb-4">Modify Balance: {selectedUser.username}</h3>
            <div className="mb-4 p-3 rounded-lg bg-white/5">
              <div className="text-sm text-gray-400">Current Balance</div>
              <div className="text-2xl font-bold">${selectedUser.points.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">No withdrawal streak: {selectedUser.daysWithoutWithdrawal} days</div>
              <div className="text-xs text-orange-400 mt-1">⚠️ Withdrawal will reset streak to 0!</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                <input type="number" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition" placeholder="e.g. 100" min="1" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Reason (optional)</label>
                <input type="text" value={pointsReason} onChange={(e) => setPointsReason(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition" placeholder="e.g. Special bonus" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => handlePointsAction(true)} disabled={actionLoading || !pointsAmount} className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 font-semibold hover:bg-green-500/30 transition disabled:opacity-50">{actionLoading ? '...' : '+ Add'}</button>
                <button onClick={() => handlePointsAction(false)} disabled={actionLoading || !pointsAmount} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition disabled:opacity-50">{actionLoading ? '...' : '- Remove'}</button>
              </div>
              <button onClick={() => { setSelectedUser(null); setPointsAmount(''); setPointsReason(''); }} className="w-full py-3 rounded-xl border border-white/20 text-gray-400 hover:bg-white/5 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
