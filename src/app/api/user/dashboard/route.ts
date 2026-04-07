import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { 
  calculateLevel, 
  getBasePercent, 
  calculateReferralBonus, 
  calculatePatienceBonus,
  calculateTotalPercent,
  getLevelUpBlockReason,
  getDaysRequiredForLevel,
  LEVELS
} from '@/lib/level'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.userId },
      include: {
        referrals: {
          select: {
            id: true,
            username: true,
            uniqueId: true,
            points: true,
            level: true,
          },
        },
        _count: {
          select: { referrals: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculează câte zile are la levelul curent (de la ultimul level up)
    const daysAtCurrentLevel = Math.floor(
      (Date.now() - user.lastLevelUpDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Calculează bonus răbdare (de la ultima modificare de puncte)
    const daysSinceChange = Math.floor(
      (Date.now() - user.lastPointsChange.getTime()) / (1000 * 60 * 60 * 24)
    )
    const patienceBonus = calculatePatienceBonus(daysSinceChange)

    // Verifică level actual vs expected
    const expectedLevel = calculateLevel(user.points, user.activeReferrals, daysAtCurrentLevel)
    let level = user.level
    
    if (expectedLevel !== user.level) {
      // Update level în DB și resetează contorul de zile
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          level: expectedLevel,
          lastLevelUpDate: new Date(), // Resetez data level up
          daysAtCurrentLevel: 0, // Resetez contorul
        },
      })
      level = expectedLevel
      
      // Log level change
      await prisma.history.create({
        data: {
          userId: user.id,
          type: expectedLevel > user.level ? 'LEVEL_UP' : 'LEVEL_DOWN',
          description: `Level ${user.level} → ${expectedLevel}`,
          metadata: { oldLevel: user.level, newLevel: expectedLevel },
        },
      })
    }

    // Calculează procente
    const basePercent = getBasePercent(level)
    const referralBonus = calculateReferralBonus(level, user.activeReferrals)
    const totalPercent = calculateTotalPercent(level, user.activeReferrals, patienceBonus)

    // Verifică daily challenge
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todaysChallenge = await prisma.dailyChallenge.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    })

    const canDoChallenge = !todaysChallenge || !todaysChallenge.completed
    const lastChallengeDate = user.lastChallengeDate
    const hoursSinceLastChallenge = lastChallengeDate 
      ? Math.floor((Date.now() - lastChallengeDate.getTime()) / (1000 * 60 * 60))
      : null

    // Progress către next level
    const nextLevel = Math.min(level + 1, 4)
    const daysRequiredForNext = getDaysRequiredForLevel(nextLevel as 0 | 1 | 2 | 3 | 4)
    const nextLevelData = nextLevel > level ? {
      level: nextLevel,
      pointsNeeded: getPointsForLevel(nextLevel) - user.points,
      referralsNeeded: getReferralsForLevel(nextLevel) - user.activeReferrals,
      daysNeeded: daysRequiredForNext - daysAtCurrentLevel,
      currentDays: daysAtCurrentLevel,
      requiredDays: daysRequiredForNext,
      blockReason: getLevelUpBlockReason(level, user.points, user.activeReferrals, daysAtCurrentLevel),
    } : null

    // Requirements for current level (pentru afișare)
    const levelRequirements = {
      points: getPointsForLevel(level),
      referrals: getReferralsForLevel(level),
      daysAtLevel: getDaysRequiredForLevel(level),
    }

    return NextResponse.json({
      profile: {
        username: user.username,
        uniqueId: user.uniqueId,
        level,
      },
      points: {
        total: user.points,
        nextLevelProgress: nextLevelData,
      },
      percent: {
        base: basePercent,
        referralBonus,
        patienceBonus,
        total: totalPercent,
      },
      daily: {
        available: canDoChallenge,
        hoursUntilNext: hoursSinceLastChallenge !== null ? Math.max(0, 24 - hoursSinceLastChallenge) : 0,
        completedToday: todaysChallenge?.completed || false,
      },
      referral: {
        myId: user.uniqueId,
        activeReferrals: user.activeReferrals,
        totalReferrals: user._count.referrals,
        referrals: user.referrals,
      },
      levelProgress: {
        daysAtCurrentLevel,
        lastLevelUpDate: user.lastLevelUpDate,
      },
      requirements: levelRequirements,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

function getPointsForLevel(level: number): number {
  const points = [0, 1, 250, 500, 1200]
  return points[level] || 1200
}

function getReferralsForLevel(level: number): number {
  const refs = [0, 0, 2, 4, 6]
  return refs[level] || 6
}
