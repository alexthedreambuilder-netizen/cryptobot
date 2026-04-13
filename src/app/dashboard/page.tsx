'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LanguageSelector from '../components/LanguageSelector'
import UserChat from '../components/UserChat'
import { useTranslation } from '../i18n/useTranslation'

interface DashboardData {
  profile: {
    username: string
    uniqueId: string
    level: number
  }
  points: {
    total: number
    nextLevelProgress: {
      level: number
      pointsNeeded: number
      referralsNeeded: number
      daysNeeded: number
      currentDays: number
      requiredDays: number
      blockReason: string | null
      canLevelUp: boolean
    } | null
  }
  percent: {
    base: number
    referralBonus: number
    patienceBonus: number
    total: number
  }
  daily: {
    available: boolean
    hoursUntilNext: number
    resetAt: string
    completedToday: boolean
    accountAgeHours: number
    unlocksIn: number
  }
  referral: {
    myId: string
    activeReferrals: number
    totalReferrals: number
    referrals: Array<{
      id: string
      username: string
      uniqueId: string
      points: number
      level: number
    }>
  }
  levelProgress: {
    daysAtCurrentLevel: number
    lastLevelUpDate: string
  }
  requirements: {
    points: number
    referrals: number
    daysAtLevel: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [levelingUp, setLevelingUp] = useState(false)
  const [levelUpMessage, setLevelUpMessage] = useState('')
  const router = useRouter()
  const { t, language } = useTranslation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchDashboard(token)
  }, [router])

  const fetchDashboard = async (token: string) => {
    try {
      const res = await fetch('/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Error loading dashboard data')
      }

      const dashboardData = await res.json()
      setData(dashboardData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralId = () => {
    if (data?.referral.myId) {
      navigator.clipboard.writeText(data.referral.myId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLevelUp = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLevelingUp(true)
    try {
      const res = await fetch('/api/user/level-up', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      const result = await res.json()

      if (res.ok) {
        setLevelUpMessage(result.message)
        // Refresh dashboard data
        fetchDashboard(token)
        setTimeout(() => setLevelUpMessage(''), 5000)
      } else {
        setError(result.reason || result.error || 'Cannot level up')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLevelingUp(false)
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

  if (!data) return null

  const levelColors = ['gray', 'green', 'cyan', 'blue', 'yellow']
  const levelColor = levelColors[data.profile.level]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
          Crypto Bambozl&apos;d
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 hidden md:inline">{data.profile.username}</span>
          <LanguageSelector />
          <Link 
            href="/profile"
            className="px-4 py-2 rounded-full border border-cyan-400/50 text-cyan-400 text-sm hover:bg-cyan-400/10 transition"
          >
            👤 Profile
          </Link>
          <button 
            onClick={logout}
            className="px-4 py-2 rounded-full border border-red-400/50 text-red-400 text-sm hover:bg-red-400/10 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Level Card */}
          <div className={`p-6 rounded-2xl bg-${levelColor}-500/10 border border-${levelColor}-500/30`}>
            <div className="text-sm text-gray-400 mb-1">Your Level</div>
            <div className={`text-5xl font-bold text-${levelColor}-400 mb-2`}>
              LvL {data.profile.level}
            </div>
            <div className="text-sm text-gray-300">
              {data.percent.base}% base + bonuses
            </div>
          </div>

          {/* Points Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Total Balance</div>
            <div className="text-4xl font-bold text-white mb-2">
              ${data.points.total.toLocaleString()}
            </div>
            {data.points.nextLevelProgress && data.points.nextLevelProgress.pointsNeeded > 0 && (
              <div className="text-sm text-gray-300">
                Need ${data.points.nextLevelProgress.pointsNeeded.toLocaleString()} more
              </div>
            )}
            {/* Deposit/Withdraw Buttons */}
            <div className="flex gap-2 mt-4">
              <Link 
                href="/deposit"
                className="flex-1 py-2 px-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-sm text-center hover:bg-green-500/30 transition"
              >
                💰 Deposit
              </Link>
              <Link 
                href="/withdraw"
                className="flex-1 py-2 px-3 rounded-lg bg-orange-500/20 border border-orange-500/50 text-orange-400 text-sm text-center hover:bg-orange-500/30 transition"
              >
                💸 Withdraw
              </Link>
            </div>
          </div>

          {/* Referrals Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Active Referrals</div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {data.referral.activeReferrals}
            </div>
            {data.points.nextLevelProgress && data.points.nextLevelProgress.referralsNeeded > 0 && (
              <div className="text-sm text-gray-300">
                Need {data.points.nextLevelProgress.referralsNeeded} more
              </div>
            )}
          </div>

          {/* Days at Current Level Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Days at LvL {data.profile.level}</div>
            <div className="text-4xl font-bold text-purple-400 mb-2">
              {data.levelProgress.daysAtCurrentLevel} days
            </div>
            {data.points.nextLevelProgress && data.points.nextLevelProgress.daysNeeded > 0 ? (
              <div className="text-sm text-orange-400">
                Need {data.points.nextLevelProgress.daysNeeded} more days
              </div>
            ) : data.profile.level < 4 ? (
              <div className="text-sm text-green-400">✓ Days requirement met</div>
            ) : (
              <div className="text-sm text-gray-400">Max level reached</div>
            )}
          </div>
        </div>

        {/* Next Level Requirements */}
        {data.points.nextLevelProgress && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-cyan-400/10 border border-yellow-400/30">
            <h3 className="text-lg font-semibold mb-4 text-yellow-400">
              Requirements for LvL {data.points.nextLevelProgress.level}
            </h3>
            
            {/* Progress Bars */}
            <div className="space-y-4">
              {/* Points Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Balance</span>
                  <span className={data.points.nextLevelProgress.pointsNeeded <= 0 ? 'text-green-400' : 'text-gray-400'}>
                    ${data.points.total.toLocaleString()} / ${(data.points.total + Math.max(0, data.points.nextLevelProgress.pointsNeeded)).toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${data.points.nextLevelProgress.pointsNeeded <= 0 ? 'bg-green-400' : 'bg-yellow-400'}`}
                    style={{ width: `${Math.min(100, (data.points.total / (data.points.total + Math.max(1, data.points.nextLevelProgress.pointsNeeded))) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Referrals Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Active Referrals</span>
                  <span className={data.points.nextLevelProgress.referralsNeeded <= 0 ? 'text-green-400' : 'text-gray-400'}>
                    {data.referral.activeReferrals} / {data.referral.activeReferrals + Math.max(0, data.points.nextLevelProgress.referralsNeeded)}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${data.points.nextLevelProgress.referralsNeeded <= 0 ? 'bg-green-400' : 'bg-cyan-400'}`}
                    style={{ width: `${data.points.nextLevelProgress.referralsNeeded <= 0 ? 100 : Math.min(100, (data.referral.activeReferrals / (data.referral.activeReferrals + data.points.nextLevelProgress.referralsNeeded)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Days at Level Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Days at Current Level</span>
                  <span className={data.points.nextLevelProgress.daysNeeded <= 0 ? 'text-green-400' : 'text-gray-400'}>
                    {data.levelProgress.daysAtCurrentLevel} / {data.points.nextLevelProgress.requiredDays} days
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${data.points.nextLevelProgress.daysNeeded <= 0 ? 'bg-green-400' : 'bg-purple-400'}`}
                    style={{ width: `${Math.min(100, (data.levelProgress.daysAtCurrentLevel / data.points.nextLevelProgress.requiredDays) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Block Warning */}
            {data.points.nextLevelProgress.blockReason && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <div className="text-sm text-red-400">
                  ⚠️ {data.points.nextLevelProgress.blockReason}
                </div>
              </div>
            )}

            {/* What's Needed Summary */}
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-sm text-gray-300">
                <span className="text-white font-semibold">Still need: </span>
                {data.points.nextLevelProgress.pointsNeeded > 0 && (
                  <span className="text-yellow-400">${data.points.nextLevelProgress.pointsNeeded} balance </span>
                )}
                {data.points.nextLevelProgress.referralsNeeded > 0 && (
                  <span className="text-cyan-400">{data.points.nextLevelProgress.referralsNeeded} referral{data.points.nextLevelProgress.referralsNeeded > 1 ? 's' : ''} </span>
                )}
                {data.points.nextLevelProgress.daysNeeded > 0 && (
                  <span className="text-purple-400">{data.points.nextLevelProgress.daysNeeded} day{data.points.nextLevelProgress.daysNeeded > 1 ? 's' : ''} </span>
                )}
                {data.points.nextLevelProgress.pointsNeeded <= 0 && data.points.nextLevelProgress.referralsNeeded <= 0 && data.points.nextLevelProgress.daysNeeded <= 0 && (
                  <span className="text-green-400">✓ All requirements met!</span>
                )}
              </div>
            </div>

            {/* Level Up Button */}
            {data.points.nextLevelProgress.canLevelUp && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400 mb-2">
                    🎉 All Requirements Met!
                  </div>
                  <div className="text-sm text-gray-300 mb-3">
                    You can now upgrade to Level {data.points.nextLevelProgress.level}
                  </div>
                  <button
                    onClick={handleLevelUp}
                    disabled={levelingUp}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 disabled:opacity-50 text-black font-bold text-lg transition transform hover:scale-105"
                  >
                    {levelingUp ? 'Upgrading...' : `🚀 Level Up to LvL ${data.points.nextLevelProgress.level}!`}
                  </button>
                </div>
              </div>
            )}

            {/* Success Message after level up */}
            {levelUpMessage && (
              <div className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/30 animate-pulse">
                <div className="text-center text-green-400 font-semibold">
                  {levelUpMessage}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Warning about withdrawal */}
        {data.profile.level >= 1 && data.profile.level < 4 && (
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <div className="text-sm text-orange-400">
              ⚠️ <strong>Important:</strong> If you withdraw funds, your progress at LvL {data.profile.level} will reset! 
              You&apos;ll need to wait the full {data.points.nextLevelProgress?.requiredDays || 0} days again for the next level.
            </div>
          </div>
        )}

        {/* Percent Breakdown */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">Percent Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.percent.base}%</div>
              <div className="text-xs text-gray-400">Base (LvL {data.profile.level})</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">+{data.percent.referralBonus.toFixed(2)}%</div>
              <div className="text-xs text-gray-400">Referral ({data.referral.activeReferrals}/10)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">+{data.percent.patienceBonus.toFixed(2)}%</div>
              <div className="text-xs text-gray-400">Patience (max 2%)</div>
            </div>
            <div className="text-center border-l border-white/10">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
                {data.percent.total.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </div>
        </div>

        {/* Daily Reward Card */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Daily Challenge</div>
              {data.daily.accountAgeHours < 24 ? (
                <div className="text-2xl font-bold text-orange-400">
                  Unlocks in {data.daily.unlocksIn}h
                </div>
              ) : (
                <div className={`text-2xl font-bold ${data.daily.available ? 'text-green-400' : 'text-gray-500'}`}>
                  {data.daily.available ? 'Available' : 'Completed'}
                </div>
              )}
            </div>
            {data.daily.accountAgeHours < 24 ? (
              <div className="text-sm text-orange-400">
                New accounts wait 24h
              </div>
            ) : data.daily.available ? (
              <Link 
                href="/challenge"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-cyan-400 text-black font-bold hover:opacity-90 transition"
              >
                Start Challenge
              </Link>
            ) : (
              <div className="text-sm text-gray-400 text-right">
                <div>Next at {data.daily.resetAt}</div>
                <div>({data.daily.hoursUntilNext}h)</div>
              </div>
            )}
          </div>
        </div>

        {/* Referral Section */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-yellow-400">Referral System</h3>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">Your Unique ID</div>
              <div className="flex items-center gap-2">
                <code className="px-4 py-2 rounded-lg bg-black/50 text-cyan-400 font-mono">
                  {data.referral.myId}
                </code>
                <button
                  onClick={copyReferralId}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
                >
                  {copied ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{data.referral.activeReferrals}</div>
              <div className="text-xs text-gray-400">Active Referrals</div>
            </div>
          </div>

          {data.referral.referrals.length > 0 && (
            <div>
              <div className="text-sm text-gray-400 mb-2">Your Friends</div>
              <div className="space-y-2">
                {data.referral.referrals.map((ref) => (
                  <div key={ref.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="font-medium">{ref.username}</span>
                    <div className="text-sm text-gray-400">
                      LvL {ref.level} • ${ref.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Support Chat */}
        <UserChat />

        {/* History Link */}
        <div className="flex justify-center">
          <Link 
            href="/dashboard/history"
            className="px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5 transition"
          >
            View Full History
          </Link>
        </div>
      </main>
    </div>
  )
}
