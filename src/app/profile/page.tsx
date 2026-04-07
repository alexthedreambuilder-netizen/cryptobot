'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  btcWallet: string | null
  ethWallet: string | null
  uniqueId: string
  points: number
  level: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    btcWallet: '',
    ethWallet: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await res.json()
      setProfile(data.user)
      setFormData({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        btcWallet: data.user.btcWallet || '',
        ethWallet: data.user.ethWallet || '',
      })
    } catch (error) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to update profile')

      const data = await res.json()
      setProfile(data.user)
      setMessage('Profile updated successfully!')
    } catch (error) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
        <Link href="/dashboard">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer">
            Crypto Bambozl&apos;d
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          {profile && (
            <span className="text-gray-400 hidden md:inline">{profile.username}</span>
          )}
          <button 
            onClick={logout}
            className="px-4 py-2 rounded-full border border-red-400/50 text-red-400 text-sm hover:bg-red-400/10 transition"
          >
            Logout
          </button>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your personal information and wallet addresses</p>
          
          {/* Unique ID Card */}
          {profile && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 inline-block">
              <div className="text-sm text-gray-400 mb-1">Your Unique Referral ID</div>
              <div className="flex items-center gap-3">
                <code className="text-xl font-mono font-bold text-cyan-400">{profile.uniqueId}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(profile.uniqueId)
                    setMessage('ID copied to clipboard!')
                    setTimeout(() => setMessage(''), 2000)
                  }}
                  className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition"
                >
                  📋 Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Share this ID with friends to invite them</p>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span>👤</span> Personal Information
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter your last name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-amber-400 text-xl">💰</span>
                <h3 className="text-lg font-semibold text-white">Wallet Addresses</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Add your crypto wallet addresses for withdrawals
              </p>
            </div>

            {/* BTC Wallet */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">₿</span>
                Bitcoin (BTC) Wallet
              </label>
              <input
                type="text"
                value={formData.btcWallet}
                onChange={(e) => setFormData({ ...formData, btcWallet: e.target.value })}
                placeholder="Enter your BTC wallet address"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 font-mono text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* ETH Wallet */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">Ξ</span>
                Ethereum (ETH) Wallet
              </label>
              <input
                type="text"
                value={formData.ethWallet}
                onChange={(e) => setFormData({ ...formData, ethWallet: e.target.value })}
                placeholder="Enter your ETH wallet address"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 font-mono text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs mt-0.5">i</div>
            <div className="text-sm text-gray-400">
              <p className="mb-1"><strong className="text-gray-300">Security Note:</strong> Your wallet addresses are stored securely and are only used for processing withdrawals.</p>
              <p>Always double-check your wallet addresses before saving.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
