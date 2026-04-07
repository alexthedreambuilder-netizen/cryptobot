'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login error')
      }

      // Save token
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect
      if (data.user.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Crypto Bambozl&apos;d
          </h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition text-white"
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition text-white"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-cyan-400 text-black font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>

          <p className="text-center text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-cyan-400 hover:underline">
              Register
            </Link>
          </p>
        </form>

        <Link 
          href="/" 
          className="block text-center mt-8 text-gray-500 hover:text-gray-300 transition"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
