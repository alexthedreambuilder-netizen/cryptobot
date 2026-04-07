'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HistoryItem {
  id: string
  type: string
  description: string
  pointsChange: number | null
  newPoints: number | null
  createdAt: string
}

const typeLabels: Record<string, { label: string; color: string }> = {
  REGISTER: { label: 'Registration', color: 'blue' },
  SET_REFERRER: { label: 'Referrer', color: 'purple' },
  POINTS_ADDED: { label: 'Deposit', color: 'green' },
  POINTS_REMOVED: { label: 'Withdrawal', color: 'red' },
  REFERRAL_ACTIVATED: { label: 'Referral Activated', color: 'yellow' },
  DAILY_REWARD: { label: 'Daily Return', color: 'cyan' },
  LEVEL_UP: { label: 'Level UP', color: 'green' },
  LEVEL_DOWN: { label: 'Level DOWN', color: 'red' },
  PATIENCE_BONUS_RESET: { label: 'Bonus Reset', color: 'gray' },
  CHALLENGE_COMPLETED: { label: 'Challenge', color: 'cyan' },
  MILESTONE_REACHED: { label: 'Milestone', color: 'yellow' },
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchHistory(token)
  }, [router])

  const fetchHistory = async (token: string) => {
    try {
      const res = await fetch('/api/user/history', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Error loading history')
      }

      const data = await res.json()
      setHistory(data.history)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
      <header className="p-4 md:p-6 flex items-center gap-4 border-b border-white/10">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Transaction History</h1>
      </header>

      <main className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No records found
            </div>
          ) : (
            history.map((item) => {
              const typeInfo = typeLabels[item.type] || { label: item.type, color: 'gray' }
              return (
                <div 
                  key={item.id} 
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${typeInfo.color}-500/20 text-${typeInfo.color}-400`}>
                    {typeInfo.label}
                  </span>
                  <div className="flex-1">
                    <div className="text-white">{item.description}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {item.pointsChange !== null && (
                    <div className={`text-lg font-bold ${item.pointsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.pointsChange > 0 ? '+' : ''}${item.pointsChange}
                    </div>
                  )}
                  {item.newPoints !== null && (
                    <div className="text-sm text-gray-400">
                      Balance: ${item.newPoints}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
