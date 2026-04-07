'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'

interface NavbarProps {
  username?: string
  showProfile?: boolean
}

export function Navbar({ username, showProfile = true }: NavbarProps) {
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  return (
    <header className="p-4 md:p-6 flex justify-between items-center border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <Link href="/dashboard">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer">
          Crypto Bambozl&apos;d
        </h1>
      </Link>
      
      <div className="flex items-center gap-4">
        {username && (
          <span className="text-gray-400 hidden md:inline">{username}</span>
        )}
        
        {showProfile && (
          <Link
            href="/profile"
            className="p-2 rounded-full border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 transition"
            title="Profile Settings"
          >
            <User className="w-5 h-5" />
          </Link>
        )}
        
        <button 
          onClick={logout}
          className="p-2 rounded-full border border-red-400/50 text-red-400 hover:bg-red-400/10 transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
