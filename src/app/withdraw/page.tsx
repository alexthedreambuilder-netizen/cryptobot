'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  uniqueId: string
  username: string
  btcWallet: string | null
  ethWallet: string | null
  usdtErc20Wallet: string | null
  usdtTrc20Wallet: string | null
  points: number
}

export default function WithdrawPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('BTC')
  const [network, setNetwork] = useState<'ERC20' | 'TRC20'>('ERC20')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
      // Set default currency based on available wallet
      if (data.user.btcWallet) {
        setCurrency('BTC')
      } else if (data.user.ethWallet) {
        setCurrency('ETH')
      } else if (data.user.usdtErc20Wallet || data.user.usdtTrc20Wallet) {
        setCurrency('USDT')
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    const withdrawAmount = parseFloat(amount)
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!profile) {
      setError('Profile not loaded')
      return
    }

    // Check if user has wallet set
    if (currency === 'BTC' && !profile.btcWallet) {
      setError('Please add your BTC wallet address in Profile Settings first')
      return
    }
    if (currency === 'ETH' && !profile.ethWallet) {
      setError('Please add your ETH wallet address in Profile Settings first')
      return
    }
    if (currency === 'USDT') {
      if (network === 'ERC20' && !profile.usdtErc20Wallet) {
        setError('Please add your USDT ERC-20 wallet address in Profile Settings first')
        return
      }
      if (network === 'TRC20' && !profile.usdtTrc20Wallet) {
        setError('Please add your USDT TRC-20 wallet address in Profile Settings first')
        return
      }
    }

    // Check balance
    if (withdrawAmount > profile.points) {
      setError('Insufficient balance')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          currency,
          network: currency === 'USDT' ? network : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Withdrawal request failed')
      }

      setSuccess(true)
      setAmount('')
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const getWalletAddress = () => {
    if (!profile) return ''
    if (currency === 'BTC') return profile.btcWallet
    if (currency === 'ETH') return profile.ethWallet
    if (currency === 'USDT') {
      return network === 'ERC20' ? profile.usdtErc20Wallet : profile.usdtTrc20Wallet
    }
    return ''
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
          <h1 className="text-3xl font-bold text-white mb-2">💸 Withdraw Funds</h1>
          <p className="text-gray-400">Request a withdrawal to your wallet</p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400">
            <div className="font-semibold mb-1">✓ Withdrawal Request Submitted!</div>
            <p className="text-sm">Your request is pending admin approval. You will receive the funds within 24 hours.</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
          <div className="text-sm text-gray-400 mb-1">Available Balance</div>
          <div className="text-4xl font-bold text-white">${profile?.points.toLocaleString() || 0}</div>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 backdrop-blur mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Withdrawal Details</h2>
          
          <div className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter withdrawal amount"
                className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Currency Selection */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Select Cryptocurrency</label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setCurrency('BTC')}
                  disabled={!profile?.btcWallet}
                  className={`p-4 rounded-lg border text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  {!profile?.btcWallet && (
                    <div className="text-xs text-red-400 mt-2">⚠️ Not set</div>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setCurrency('ETH')}
                  disabled={!profile?.ethWallet}
                  className={`p-4 rounded-lg border text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  {!profile?.ethWallet && (
                    <div className="text-xs text-red-400 mt-2">⚠️ Not set</div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrency('USDT')}
                  disabled={!profile?.usdtErc20Wallet && !profile?.usdtTrc20Wallet}
                  className={`p-4 rounded-lg border text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    currency === 'USDT' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-gray-600 hover:border-green-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">₮</span>
                    <div>
                      <div className="font-semibold text-white">Tether</div>
                      <div className="text-xs text-gray-400">USDT</div>
                    </div>
                  </div>
                  {!profile?.usdtErc20Wallet && !profile?.usdtTrc20Wallet && (
                    <div className="text-xs text-red-400 mt-2">⚠️ Not set</div>
                  )}
                </button>
              </div>
            </div>

            {/* Network Selection for USDT */}
            {currency === 'USDT' && (profile?.usdtErc20Wallet || profile?.usdtTrc20Wallet) && (
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Select Network</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNetwork('ERC20')}
                    disabled={!profile?.usdtErc20Wallet}
                    className={`p-3 rounded-lg border text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      network === 'ERC20' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-600 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="font-semibold text-white text-sm">ERC-20</div>
                    <div className="text-xs text-gray-400">Ethereum</div>
                    {!profile?.usdtErc20Wallet && (
                      <div className="text-xs text-red-400 mt-1">Not configured</div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setNetwork('TRC20')}
                    disabled={!profile?.usdtTrc20Wallet}
                    className={`p-3 rounded-lg border text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      network === 'TRC20' 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-600 hover:border-red-500/50'
                    }`}
                  >
                    <div className="font-semibold text-white text-sm">TRC-20</div>
                    <div className="text-xs text-gray-400">Tron</div>
                    {!profile?.usdtTrc20Wallet && (
                      <div className="text-xs text-red-400 mt-1">Not configured</div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Destination Wallet */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm">Destination Wallet</label>
              <div className="bg-gray-900/80 rounded-lg p-4">
                <code className="text-sm font-mono text-cyan-400 break-all">
                  {getWalletAddress() || 'No wallet configured'}
                </code>
              </div>
              {!getWalletAddress() && (
                <p className="text-sm text-red-400">
                  Please <Link href="/profile" className="underline">set up your wallet</Link> first
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0 || !getWalletAddress()}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Withdrawal
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Withdrawal Information:</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Withdrawals are processed within 24 hours after admin approval</li>
            <li>• You will receive funds in the same cryptocurrency you select</li>
            <li>• Minimum withdrawal: $10</li>
            <li>• Network fees may apply depending on blockchain conditions</li>
            <li>• Make sure your wallet address is correct - transactions cannot be reversed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
