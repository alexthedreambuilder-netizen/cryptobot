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

        {/* Telegram Support */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 max-w-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">💬</div>
            <div>
              <h3 className="text-2xl font-bold text-white">Need Help?</h3>
              <p className="text-cyan-400">Chat with us on Telegram</p>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Our support team is available to answer your questions about deposits, 
            withdrawals, referrals, and more. Click the button below to start chatting!
          </p>
          <a 
            href="https://t.me/CryptoBambozldBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:opacity-90 transition"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Start Chat on Telegram
          </a>
          <p className="text-xs text-gray-500 mt-4">
            Bot: @CryptoBambozldBot • Response time: Usually within a few hours
          </p>
        </div>
      </main>


    </div>
  )
}
