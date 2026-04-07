import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { calculateLevel, calculateTotalPercent, calculatePatienceBonus } from '@/lib/level'

// GET - Listează toți userii
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { uniqueId: { contains: search, mode: 'insensitive' } },
        ],
      } : undefined,
      include: {
        _count: {
          select: { referrals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculează stats pentru fiecare user
    const usersWithStats = users.map(user => {
      const daysSinceChange = Math.floor(
        (Date.now() - user.lastPointsChange.getTime()) / (1000 * 60 * 60 * 24)
      )
      const daysAtCurrentLevel = Math.floor(
        (Date.now() - user.lastLevelUpDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const patienceBonus = calculatePatienceBonus(daysSinceChange)
      const totalPercent = calculateTotalPercent(user.level, user.activeReferrals, patienceBonus)

      return {
        id: user.id,
        username: user.username,
        uniqueId: user.uniqueId,
        firstName: user.firstName,
        lastName: user.lastName,
        level: user.level,
        points: user.points,
        activeReferrals: user.activeReferrals,
        totalReferrals: user._count.referrals,
        btcWallet: user.btcWallet,
        ethWallet: user.ethWallet,
        daysAtCurrentLevel,
        totalPercent,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        lastPointsChange: user.lastPointsChange,
      }
    })

    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
