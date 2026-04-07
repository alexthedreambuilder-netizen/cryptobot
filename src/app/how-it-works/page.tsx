'use client'

import Link from 'next/link'

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <Link href="/" className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
          Crypto Bambozl&apos;d
        </Link>
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-full border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-cyan-400 text-black font-semibold hover:opacity-90 transition"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
              How It Works
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Your journey to passive income starts here
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-cyan-400 text-black flex items-center justify-center text-xl font-bold shrink-0">
                1
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-cyan-400">Create Your Account</h2>
                <p className="text-gray-400 mb-4">
                  Sign up for free and get your unique referral ID. If a friend invited you, 
                  enter their ID during registration to start earning together.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">Free to join</span>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">Instant setup</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-cyan-400 text-black flex items-center justify-center text-xl font-bold shrink-0">
                2
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-yellow-400">Deposit Funds</h2>
                <p className="text-gray-400 mb-4">
                  Add funds to your account. The more you invest, the higher your daily returns. 
                  Our admin team will process your deposit and credit your account.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">Min $1</span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">No max limit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-cyan-400 text-black flex items-center justify-center text-xl font-bold shrink-0">
                3
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-green-400">Complete Daily Challenge</h2>
                <p className="text-gray-400 mb-4">
                  Every 24 hours, complete 3 simple mini-games (Memory, Math, Pattern, etc.) 
                  to unlock your daily returns. Takes only 5-10 minutes!
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">5-10 min/day</span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">Fun & easy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-cyan-400 text-black flex items-center justify-center text-xl font-bold shrink-0">
                4
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-purple-400">Earn Daily Returns</h2>
                <p className="text-gray-400 mb-4">
                  After completing your daily challenge, you receive returns based on your level. 
                  Higher levels = bigger percentages. Returns are automatically added to your balance.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                  <div className="p-2 rounded bg-white/5 text-center">
                    <div className="text-lg font-bold text-green-400">3.4%</div>
                    <div className="text-xs text-gray-500">LvL 1</div>
                  </div>
                  <div className="p-2 rounded bg-white/5 text-center">
                    <div className="text-lg font-bold text-cyan-400">5.1%</div>
                    <div className="text-xs text-gray-500">LvL 2</div>
                  </div>
                  <div className="p-2 rounded bg-white/5 text-center">
                    <div className="text-lg font-bold text-blue-400">5.8%</div>
                    <div className="text-xs text-gray-500">LvL 3</div>
                  </div>
                  <div className="p-2 rounded bg-white/5 text-center">
                    <div className="text-lg font-bold text-yellow-400">6.3%</div>
                    <div className="text-xs text-gray-500">LvL 4</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-cyan-400 text-black flex items-center justify-center text-xl font-bold shrink-0">
                5
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-pink-400">Invite Friends & Earn More</h2>
                <p className="text-gray-400 mb-4">
                  Share your unique referral ID. When friends join and invest, you earn bonus 
                  percentages on your returns. Up to 10 active referrals!
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-sm">+0.05% to +0.10%</span>
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">Per referral</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-cyan-400 text-black flex items-center justify-center text-xl font-bold shrink-0">
                6
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-red-400">Patience Pays Off</h2>
                <p className="text-gray-400 mb-4">
                  The longer you keep your funds without withdrawing, the higher your 
                  &quot;Patience Bonus&quot; grows. Up to +2% extra on your daily returns!
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm">+0.1% per day</span>
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">Max +2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Requirements */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-yellow-400/10 to-cyan-400/10 border border-yellow-400/30">
          <h2 className="text-2xl font-bold mb-6 text-center">Level Requirements</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-gray-400">Level</th>
                  <th className="text-left py-3 text-gray-400">Min Balance</th>
                  <th className="text-left py-3 text-gray-400">Active Referrals</th>
                  <th className="text-left py-3 text-gray-400">Daily Return</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-bold text-gray-500">LvL 0</td>
                  <td className="py-3">$0</td>
                  <td className="py-3">0</td>
                  <td className="py-3 text-gray-500">0%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-bold text-green-400">LvL 1</td>
                  <td className="py-3">$1</td>
                  <td className="py-3">0</td>
                  <td className="py-3 text-green-400">3.4%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-bold text-cyan-400">LvL 2</td>
                  <td className="py-3">$250</td>
                  <td className="py-3">2</td>
                  <td className="py-3 text-cyan-400">5.1%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-bold text-blue-400">LvL 3</td>
                  <td className="py-3">$500</td>
                  <td className="py-3">4</td>
                  <td className="py-3 text-blue-400">5.8%</td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-yellow-400">LvL 4</td>
                  <td className="py-3">$1,200</td>
                  <td className="py-3">6</td>
                  <td className="py-3 text-yellow-400">6.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start?</h2>
          <p className="text-gray-400 mb-6">Create your free account today and begin your investment journey.</p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-cyan-400 text-black font-bold text-lg hover:opacity-90 transition"
          >
            Create Free Account
          </Link>
        </div>
      </main>
    </div>
  )
}
