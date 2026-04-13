import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { getLevelUpBlockReason, type Level } from '@/lib/level'

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentLevel = user.level as Level

    // Nu poate face level up dacă e deja la max
    if (currentLevel >= 4) {
      return NextResponse.json({ error: 'Already at maximum level' }, { status: 400 })
    }

    // Calculează zilele la levelul curent
    const daysAtCurrentLevel = Math.floor(
      (Date.now() - user.lastLevelUpDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Verifică dacă poate face level up
    const blockReason = getLevelUpBlockReason(
      currentLevel,
      user.points,
      user.activeReferrals,
      daysAtCurrentLevel
    )

    if (blockReason) {
      return NextResponse.json({ 
        error: 'Cannot level up',
        reason: blockReason 
      }, { status: 400 })
    }

    const newLevel = (currentLevel + 1) as Level

    // Face level up
    await prisma.user.update({
      where: { id: user.id },
      data: {
        level: newLevel,
        lastLevelUpDate: new Date(), // Resetez data pentru următorul level
      },
    })

    // Log în history
    await prisma.history.create({
      data: {
        userId: user.id,
        type: 'LEVEL_UP',
        description: `Level ${currentLevel} → ${newLevel}`,
        metadata: { 
          oldLevel: currentLevel, 
          newLevel,
          points: user.points,
          referrals: user.activeReferrals,
          daysAtLevel: daysAtCurrentLevel
        },
      },
    })

    return NextResponse.json({
      success: true,
      oldLevel: currentLevel,
      newLevel,
      message: `Congratulations! You are now Level ${newLevel}!`,
    })
  } catch (error) {
    console.error('Level up error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
