'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  uniqueId: string
  firstName: string | null
  lastName: string | null
  level: number
  points: number
  activeReferrals: number
  totalReferrals: number
  btcWallet: string | null
  ethWallet: string | null
  isAdmin: boolean
  createdAt: string
  lastPointsChange: string
  daysAtCurrentLevel: number
}

interface HistoryEntry {
  id: string
  type: string
  description: string
  pointsChange: number | null
  newPoints: number | null
  createdAt: string
  metadata: any
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userHistory, setUserHistory] = useState<HistoryEntry[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list')
  const [editingDays, setEditingDays] = useState(false)
  const [newDaysValue, setNewDaysValue] = useState('')
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
      const term = search.toLowerCase()
      setFilteredUsers(users.filter(u => 
        u.username.toLowerCase().includes(term) ||
        u.uniqueId.toLowerCase().includes(term) ||
        (u.firstName && u.firstName.toLowerCase().includes(term)) ||
        (u.lastName && u.lastName.toLowerCase().includes(term))
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

  const fetchUserHistory = async (userId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to load history')
      
      const data = await res.json()
      setUserHistory(data.history)
    } catch (err) {
      setUserHistory([])
    }
  }

  const viewUserDetails = (user: User) => {
    setSelectedUser(user)
    fetchUserHistory(user.id)
    setViewMode('details')
    setEditingDays(false)
    setNewDaysValue(user.daysAtCurrentLevel.toString())
  }

  const updateDaysAtCurrentLevel = async () => {
    if (!selectedUser) return
    
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/stats`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          daysAtCurrentLevel: parseInt(newDaysValue) || 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')
      
      const updatedUser = { ...selectedUser, daysAtCurrentLevel: parseInt(newDaysValue) || 0 }
      setSelectedUser(updatedUser)
      setEditingDays(false)
      
      // Refresh user list
      fetchUsers(token)
    } catch (err) {
      alert('Failed to update days at current level')
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
        <div className="flex items-center gap-3">
          <Link href="/admin" className="px-4 py-2 rounded-full bg-cyan-400/20 text-cyan-400 text-sm font-semibold">👥 Users</Link>
          <Link href="/admin/pending" className="px-4 py-2 rounded-full bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition">⏳ Pending</Link>
          <button onClick={logout} className="px-4 py-2 rounded-full border border-red-400/50 text-red-400 text-sm hover:bg-red-400/10 transition">Logout</button>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {viewMode === 'list' ? (
          <>
            {/* Search */}
            <div className="mb-6">
              <input 
                type="text" 
                placeholder="Search by username, name, or unique ID..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full max-w-md px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition" 
              />
            </div>

            {/* Stats */}
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

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Unique ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Balance</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Referrals</th>
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
                        <div className="text-xs text-gray-500">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{user.uniqueId}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded bg-${['gray','green','cyan','blue','yellow'][user.level]}-500/20 text-${['gray','green','cyan','blue','yellow'][user.level]}-400 text-sm font-bold`}>LvL {user.level}</span>
                      </td>
                      <td className="px-4 py-3 font-mono">${user.points.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{user.activeReferrals}/{user.totalReferrals}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => viewUserDetails(user)} className="px-3 py-1 rounded bg-cyan-400/20 text-cyan-400 text-sm hover:bg-cyan-400/30 transition">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && <div className="text-center py-12 text-gray-500">No users found</div>}
          </>
        ) : selectedUser && (
          <>
            {/* User Details View */}
            <div className="mb-6 flex items-center gap-4">
              <button 
                onClick={() => setViewMode('list')} 
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                ← Back to List
              </button>
              <h2 className="text-2xl font-bold">User Details</h2>
            </div>

            {/* User Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400">Username</div>
                <div className="text-xl font-bold">{selectedUser.username}</div>
                <div className="text-xs text-gray-500">{selectedUser.firstName} {selectedUser.lastName}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400">Unique ID</div>
                <div className="text-xl font-mono font-bold text-cyan-400">{selectedUser.uniqueId}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400">Level</div>
                <div className="text-xl font-bold">LvL {selectedUser.level}</div>
                <div className="mt-2">
                  {!editingDays ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Days at level: {selectedUser.daysAtCurrentLevel}</span>
                      <button 
                        onClick={() => setEditingDays(true)}
                        className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={newDaysValue}
                        onChange={(e) => setNewDaysValue(e.target.value)}
                        className="w-20 px-2 py-1 rounded bg-gray-900/50 border border-gray-600 text-white text-sm"
                        min="0"
                      />
                      <button 
                        onClick={updateDaysAtCurrentLevel}
                        className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => {
                          setEditingDays(false)
                          setNewDaysValue(selectedUser.daysAtCurrentLevel.toString())
                        }}
                        className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400">Balance</div>
                <div className="text-xl font-bold text-green-400">${selectedUser.points.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400">Referrals</div>
                <div className="text-xl font-bold">{selectedUser.activeReferrals} active</div>
                <div className="text-xs text-gray-500">Total: {selectedUser.totalReferrals}</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm text-gray-400">Registered</div>
                <div className="text-xl font-bold">{new Date(selectedUser.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Wallet Addresses */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold mb-4">Wallet Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">BTC Wallet</div>
                  <code className="text-sm font-mono text-orange-400 break-all">
                    {selectedUser.btcWallet || 'Not set'}
                  </code>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">ETH Wallet</div>
                  <code className="text-sm font-mono text-purple-400 break-all">
                    {selectedUser.ethWallet || 'Not set'}
                  </code>
                </div>
              </div>
            </div>

            {/* Audit Log */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10">
                <h3 className="text-lg font-semibold">📋 Activity Audit Log</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {userHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No activity recorded</td>
                      </tr>
                    ) : (
                      userHistory.map((entry) => (
                        <tr key={entry.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-sm text-gray-400">{new Date(entry.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              entry.type.includes('WITHDRAWAL') ? 'bg-red-500/20 text-red-400' :
                              entry.type.includes('DEPOSIT') || entry.type.includes('ADDED') ? 'bg-green-500/20 text-green-400' :
                              entry.type.includes('REFERRAL') ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{entry.description}</td>
                          <td className="px-4 py-3 text-sm font-mono">
                            {entry.pointsChange !== null && (
                              <span className={entry.pointsChange > 0 ? 'text-green-400' : 'text-red-400'}>
                                {entry.pointsChange > 0 ? '+' : ''}{entry.pointsChange}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-400">{entry.newPoints}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
