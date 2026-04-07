import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/middleware'
import { calculateLevel } from '@/lib/level'

// POST - Adaugă/scade puncte
export async function POST(req: NextRequest) {
  const auth = requireAdmin(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { userId, points, reason } = await req.json()

    if (!userId || typeof points !== 'number') {
      return NextResponse.json({ error: 'User ID and points required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculează noile puncte
    const newPoints = Math.max(0, user.points + points)
    const isWithdrawal = points < 0

    // Dacă e retragere, resetăm contorul de zile la levelul curent
    // și data de level up (ca și cum abia acum a ajuns la levelul ăsta)
    let lastLevelUpDate = user.lastLevelUpDate
    
    if (isWithdrawal) {
      // Resetez data de level up la acum = 0 zile la levelul curent
      lastLevelUpDate = new Date()
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: newPoints,
        lastPointsChange: new Date(),
        patienceBonus: 0, // Reset bonus răbdare
        lastLevelUpDate, // Dacă a fost retragere, se resetează
      },
    })

    // Verifică dacă referral devine activ
    if (points > 0 && user.referrerId && user.points === 0) {
      // Primul punct primit - activare referral
      const referrer = await prisma.user.findUnique({
        where: { uniqueId: user.referrerId },
      })
      
      if (referrer) {
        await prisma.user.update({
          where: { id: referrer.id },
          data: { activeReferrals: { increment: 1 } },
        })

        // Log activare referral
        await prisma.history.create({
          data: {
            userId: referrer.id,
            type: 'REFERRAL_ACTIVATED',
            description: `Referral activated: ${user.username}`,
            metadata: { referredUserId: user.id, bonus: 10 },
          },
        })

        // Bonus instant pentru referrer
        await prisma.user.update({
          where: { id: referrer.id },
          data: { points: { increment: 10 } },
        })

        await prisma.history.create({
          data: {
            userId: referrer.id,
            type: 'POINTS_ADDED',
            description: 'Referral instant bonus',
            pointsChange: 10,
            newPoints: referrer.points + 10,
          },
        })
      }
    }

    // Log schimbare puncte
    await prisma.history.create({
      data: {
        userId,
        type: points >= 0 ? 'POINTS_ADDED' : 'POINTS_REMOVED',
        description: reason || (points >= 0 ? 'Deposit' : 'Withdrawal'),
        pointsChange: points,
        newPoints,
        metadata: { adminId: auth.user.userId },
      },
    })

    // Log dacă a fost resetat contorul de zile
    if (isWithdrawal) {
      await prisma.history.create({
        data: {
          userId,
          type: 'WITHDRAWAL_STREAK_BROKEN',
          description: `Level progress reset due to withdrawal`,
        },
      })
    }

    // Log reset bonus răbdare
    await prisma.history.create({
      data: {
        userId,
        type: 'PATIENCE_BONUS_RESET',
        description: 'Patience bonus reset',
      },
    })

    // Recalculează level (cu zilele de la ultimul level up)
    const daysAtCurrentLevel = Math.floor(
      (Date.now() - lastLevelUpDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const expectedLevel = calculateLevel(newPoints, updatedUser.activeReferrals, daysAtCurrentLevel)
    
    if (expectedLevel !== updatedUser.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          level: expectedLevel,
          lastLevelUpDate: new Date(), // Resetez data la level up
        },
      })

      await prisma.history.create({
        data: {
          userId,
          type: expectedLevel > updatedUser.level ? 'LEVEL_UP' : 'LEVEL_DOWN',
          description: `Level ${updatedUser.level} → ${expectedLevel}`,
          metadata: { oldLevel: updatedUser.level, newLevel: expectedLevel },
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        points: newPoints,
        level: expectedLevel,
      },
    })
  } catch (error) {
    console.error('Admin points error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
