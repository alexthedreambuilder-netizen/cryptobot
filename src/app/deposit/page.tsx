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
  const [network, setNetwork] = useState<'ERC20' | 'TRC20'>('ERC20')
  const [txHash, setTxHash] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const BTC_ADDRESS = 'bc1q983wv7283xt69erzra6mk89sq6suc64p6jkhvj'
  const ETH_ADDRESS = '0xd456022fecf34E5cA2593dFb327c39B2096790b5'
  const USDT_ERC20_ADDRESS = '0xd456022fecf34E5cA2593dFb327c39B2096790b5'
  const USDT_TRC20_ADDRESS = 'TQPUeUvnpJPPBXATbpogLLiEGotQbPN4x6'

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

  const getWalletAddress = () => {
    if (currency === 'BTC') return BTC_ADDRESS
    if (currency === 'ETH') return ETH_ADDRESS
    if (currency === 'USDT') return network === 'ERC20' ? USDT_ERC20_ADDRESS : USDT_TRC20_ADDRESS
    return ''
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!txHash.trim()) {
      setError('Please enter the transaction hash')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          network: currency === 'USDT' ? network : undefined,
          txHash: txHash.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit deposit request')
      }

      setSuccess(true)
      setAmount('')
      setTxHash('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
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
              <div className="grid grid-cols-3 gap-4">
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

                <button
                  type="button"
                  onClick={() => setCurrency('USDT')}
                  className={`p-4 rounded-lg border text-left transition ${
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
                </button>
              </div>
            </div>

            {/* Network Selection for USDT */}
            {currency === 'USDT' && (
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Select Network</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNetwork('ERC20')}
                    className={`p-4 rounded-lg border text-left transition ${
                      network === 'ERC20' 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-600 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="font-semibold text-white">ERC-20</div>
                    <div className="text-xs text-gray-400">Ethereum Network</div>
                    <div className="text-xs text-yellow-400 mt-1">Higher fees (~$5-20)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNetwork('TRC20')}
                    className={`p-4 rounded-lg border text-left transition ${
                      network === 'TRC20' 
                        ? 'border-red-500 bg-red-500/10' 
                        : 'border-gray-600 hover:border-red-500/50'
                    }`}
                  >
                    <div className="font-semibold text-white">TRC-20</div>
                    <div className="text-xs text-gray-400">Tron Network</div>
                    <div className="text-xs text-green-400 mt-1">Low fees (~$1)</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Address Card */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Send {currency}{currency === 'USDT' && ` (${network})`} to this address:
          </h3>
          
          <div className="bg-gray-900/80 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <code className="text-sm font-mono text-cyan-400 break-all">
                {getWalletAddress()}
              </code>
              <button
                onClick={() => copyToClipboard(getWalletAddress(), 'address')}
                className="px-3 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition whitespace-nowrap"
              >
                {copied === 'address' ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-300 space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-yellow-400">⚠️</span>
              <span>
                Send only <strong>{currency}</strong>
                {currency === 'USDT' && ` on ${network} network`}
                {' '}to this address. Sending other assets or using wrong network may result in permanent loss.
              </span>
            </p>
            {currency === 'USDT' && network === 'ERC20' && (
              <p className="text-xs text-purple-400">
                Using ERC-20 (Ethereum). Make sure you have enough ETH for gas fees.
              </p>
            )}
            {currency === 'USDT' && network === 'TRC20' && (
              <p className="text-xs text-red-400">
                Using TRC-20 (Tron). Make sure you have enough TRX for gas fees.
              </p>
            )}
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

        {/* Submit Deposit Request */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">✅ Submit Deposit Request</h3>
          
          {success ? (
            <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400">
              <div className="font-semibold mb-1">✓ Deposit Request Submitted!</div>
              <p className="text-sm">Your deposit request is pending admin approval. You will receive the points once verified.</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-3 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition"
              >
                Submit Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Transaction Hash (TXID)</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Enter the transaction hash from your wallet"
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-600 text-white placeholder:text-gray-500 font-mono text-sm focus:border-green-400 focus:outline-none"
                />
                <p className="text-xs text-gray-400">
                  You can find this in your wallet after sending the transaction
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !amount || !txHash}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : '📤 Submit Deposit Request'}
              </button>
            </form>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📋 Instructions:</h3>
          <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
            <li>Enter the amount you want to deposit in USD</li>
            <li>Select your preferred cryptocurrency</li>
            <li>Copy the wallet address shown above</li>
            <li><strong className="text-yellow-400">IMPORTANT:</strong> Include your Unique ID in the memo/reference field</li>
            <li>Send the exact amount from your wallet</li>
            <li>Copy the Transaction Hash (TXID) from your wallet</li>
            <li>Submit the deposit request above with the TXID</li>
            <li>Wait for admin approval (usually within 24 hours)</li>
          </ol>
          
          <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-400">
              <strong>⚠️ Important:</strong> Your deposit will only be credited after admin verification. Make sure to submit the correct transaction hash.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
