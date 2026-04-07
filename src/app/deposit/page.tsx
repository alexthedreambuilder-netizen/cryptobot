'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  uniqueId: string
  username: string
}

export default function DepositPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('BTC')
  const [copied, setCopied] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const BTC_ADDRESS = 'bc1q983wv7283xt69erzra6mk89sq6suc64p6jkhvj'
  const ETH_ADDRESS = '0xd456022fecf34E5cA2593dFb327c39B2096790b5'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchProfile(token)
  }, [router])

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProfile(data.user)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
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

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💰 Deposit Funds</h1>
          <p className="text-gray-400">Add funds to your account</p>
        </div>

        {message && (
          <div className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400">
            {message}
          </div>
        )}

        {/* Deposit Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Deposit Details</h2>
          
          <div className="space-y-4">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter deposit amount in USD"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Currency Selection */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Select Cryptocurrency</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCurrency('BTC')}
                  className={`p-4 rounded-lg border text-left transition ${
                    currency === 'BTC' 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-gray-600 hover:border-orange-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">₿</span>
                    <div>
                      <div className="font-semibold text-white">Bitcoin</div>
                      <div className="text-xs text-gray-400">BTC</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setCurrency('ETH')}
                  className={`p-4 rounded-lg border text-left transition ${
                    currency === 'ETH' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-600 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">Ξ</span>
                    <div>
                      <div className="font-semibold text-white">Ethereum</div>
                      <div className="text-xs text-gray-400">ETH</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Address Card */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Send {currency} to this address:
          </h3>
          
          <div className="bg-gray-900/80 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm font-mono text-cyan-400 break-all">
                {currency === 'BTC' ? BTC_ADDRESS : ETH_ADDRESS}
              </code>
              <button
                onClick={() => copyToClipboard(currency === 'BTC' ? BTC_ADDRESS : ETH_ADDRESS, 'address')}
                className="px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition whitespace-nowrap"
              >
                {copied === 'address' ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-300 space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-yellow-400">⚠️</span>
              <span>Send only <strong>{currency}</strong> to this address. Sending other assets may result in permanent loss.</span>
            </p>
          </div>
        </div>

        {/* Reference ID Card */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            ⚠️ IMPORTANT: Include Reference ID
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            You MUST include your Unique ID in the transaction memo/reference field so we can credit your account.
          </p>
          
          <div className="bg-gray-900/80 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Your Reference ID:</div>
            <div className="flex items-center justify-between gap-4">
              <code className="text-xl font-mono font-bold text-yellow-400">
                {profile?.uniqueId}
              </code>
              <button
                onClick={() => copyToClipboard(profile?.uniqueId || '', 'id')}
                className="px-3 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm hover:bg-yellow-500/30 transition whitespace-nowrap"
              >
                {copied === 'id' ? '✓ Copied!' : '📋 Copy ID'}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Instructions:</h3>
          <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
            <li>Enter the amount you want to deposit in USD</li>
            <li>Select your preferred cryptocurrency (BTC or ETH)</li>
            <li>Copy the wallet address shown above</li>
            <li><strong className="text-yellow-400">IMPORTANT:</strong> Copy your Unique ID and paste it in the memo/reference field</li>
            <li>Send the exact amount from your wallet</li>
            <li>Wait for network confirmations (usually 3-6 blocks)</li>
            <li>Your balance will be updated automatically</li>
          </ol>
          
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">
              <strong>Note:</strong> Deposits are processed manually by admin after verification. This may take up to 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
