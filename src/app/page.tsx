'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
          Crypto Bambozl&apos;d
        </h1>
        <div className="flex gap-4">
          <Link 
            href="/how-it-works" 
            className="px-4 py-2 rounded-full border border-white/20 text-gray-300 hover:bg-white/10 transition hidden md:block"
          >
            How it works
          </Link>
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

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-yellow-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent">
            Crypto Bambozl&apos;d
          </span>
        </h2>
        <p className="text-2xl md:text-3xl font-bold text-cyan-400 mb-6">
          Invest with us!
        </p>
        <p className="text-xl text-gray-400 max-w-2xl mb-4">
          A strategic idle investment platform. Grow your balance through patience, 
          invite your friends and climb levels for bigger returns.
        </p>
        <p className="text-xl font-bold text-yellow-400 max-w-2xl mb-8">
          Let us work for you! You bring the cash, we trade it for you.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex gap-4 mb-12">
          <Link 
            href="/register" 
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-cyan-400 text-black font-bold text-lg hover:opacity-90 transition"
          >
            Start Investing
          </Link>
          <Link 
            href="/how-it-works" 
            className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition"
          >
            How it works
          </Link>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold mb-2 text-cyan-400">Patience Bonus</h3>
            <p className="text-gray-400">The longer you don&apos;t modify your balance, the bigger your bonus grows. Max +2%!</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Referral System</h3>
            <p className="text-gray-400">Invite friends and earn permanent bonuses. Max 10 active referrals.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold mb-2 text-green-400">Daily Challenge</h3>
            <p className="text-gray-400">Complete daily mini-games to unlock your daily returns.</p>
          </div>
        </div>

        {/* Level Preview */}
        <div className="mt-16 w-full max-w-3xl">
          <h3 className="text-2xl font-bold mb-6">Investment Levels</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { level: 0, points: '0', percent: '0%', color: 'gray' },
              { level: 1, points: '1-249', percent: '3.4%', color: 'green' },
              { level: 2, points: '250-499', percent: '5.1%', color: 'cyan' },
              { level: 3, points: '500-1199', percent: '5.8%', color: 'blue' },
              { level: 4, points: '1200+', percent: '6.3%', color: 'yellow' },
            ].map((l) => (
              <div 
                key={l.level} 
                className={`p-4 rounded-xl bg-${l.color}-500/10 border border-${l.color}-500/30 text-center`}
              >
                <div className={`text-2xl font-bold text-${l.color}-400 mb-1`}>LvL {l.level}</div>
                <div className="text-xs text-gray-400">{l.points} $</div>
                <div className="text-sm font-semibold text-white mt-1">{l.percent}/day</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-gray-500 text-sm">
        Crypto Bambozl&apos;d • Invest with us! • Built with Next.js + PostgreSQL
      </footer>
    </div>
  )
}
