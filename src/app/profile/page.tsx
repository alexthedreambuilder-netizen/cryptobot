'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/navbar'
import { useToast } from '@/hooks/use-toast'
import { User, Wallet, Save, ArrowLeft } from 'lucide-react'

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
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
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
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

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
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar username={profile?.username} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white mb-6"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-slate-400">Manage your personal information and wallet addresses</p>
          </div>

          {/* Profile Form */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                      className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">Wallet Addresses</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Add your crypto wallet addresses for withdrawals
                  </p>
                </div>

                {/* BTC Wallet */}
                <div className="space-y-2">
                  <Label htmlFor="btcWallet" className="text-slate-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">₿</span>
                    Bitcoin (BTC) Wallet
                  </Label>
                  <Input
                    id="btcWallet"
                    value={formData.btcWallet}
                    onChange={(e) => setFormData({ ...formData, btcWallet: e.target.value })}
                    placeholder="Enter your BTC wallet address"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 font-mono"
                  />
                </div>

                {/* ETH Wallet */}
                <div className="space-y-2">
                  <Label htmlFor="ethWallet" className="text-slate-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">Ξ</span>
                    Ethereum (ETH) Wallet
                  </Label>
                  <Input
                    id="ethWallet"
                    value={formData.ethWallet}
                    onChange={(e) => setFormData({ ...formData, ethWallet: e.target.value })}
                    placeholder="Enter your ETH wallet address"
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 font-mono"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3"
                >
                  {saving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-slate-800/30 border-slate-700">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs mt-0.5">i</div>
                <div className="text-sm text-slate-400">
                  <p className="mb-1"><strong className="text-slate-300">Security Note:</strong> Your wallet addresses are stored securely and are only used for processing withdrawals.</p>
                  <p>Always double-check your wallet addresses before saving.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
