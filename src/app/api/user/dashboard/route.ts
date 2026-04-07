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
  LEVELS,
  type Level
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
    }) as any

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
    let level = user.level as Level
    
    // Auto level up doar dacă userul NU a fost modificat recent de admin (în ultimele 5 minute)
    // pentru a permite testarea cu zile setate manual
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const recentlyUpdated = user.updatedAt > fiveMinutesAgo
    
    if (expectedLevel !== user.level && !recentlyUpdated) {
      // Update level în DB și resetează contorul de zile
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          level: expectedLevel,
          lastLevelUpDate: new Date(), // Resetez data level up
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

    // Verifică daily challenge - reset la 9:00 AM ora României (EET/EEST = UTC+2/UTC+3)
    const now = new Date()
    
    // Calculează ora curentă în România (UTC+2 sau UTC+3 în funcție de DST)
    const romaniaOffset = 2 * 60 * 60 * 1000 // UTC+2 (default)
    const romaniaTime = new Date(now.getTime() + romaniaOffset)
    
    // Calculează când e următorul reset (9:00 AM ora României)
    const resetHour = 9 // 9 AM
    let hoursUntilReset = resetHour - romaniaTime.getUTCHours()
    if (hoursUntilReset <= 0) {
      hoursUntilReset += 24 // Dacă e după 9 AM, așteaptă până mâine la 9 AM
    }
    
    // Verifică dacă challenge-ul de azi e disponibil (după 9 AM)
    const isAfter9AM = romaniaTime.getUTCHours() >= resetHour
    
    // Account age check - 24h de la creare
    const accountAgeHours = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60))
    const isAccountOldEnough = accountAgeHours >= 24
    
    // Verifică când a făcut ultimul challenge
    const lastChallengeDate = user.lastChallengeDate
    let canDoChallenge = false
    let hoursUntilNext = 0
    
    if (!isAccountOldEnough) {
      // Cont nou, așteaptă 24h
      hoursUntilNext = 24 - accountAgeHours
    } else if (!lastChallengeDate) {
      // Niciodată nu a făcut challenge, poate face acum
      canDoChallenge = isAfter9AM
      hoursUntilNext = hoursUntilReset
    } else {
      // Verifică dacă a făcut challenge azi (după 9 AM)
      const lastChallengeRomania = new Date(lastChallengeDate.getTime() + romaniaOffset)
      const today9AM = new Date(romaniaTime)
      today9AM.setUTCHours(resetHour, 0, 0, 0)
      
      if (lastChallengeRomania >= today9AM) {
        // A făcut deja challenge azi, așteaptă până mâine 9 AM
        canDoChallenge = false
        hoursUntilNext = hoursUntilReset
      } else {
        // Nu a făcut challenge azi
        canDoChallenge = isAfter9AM
        hoursUntilNext = isAfter9AM ? 0 : hoursUntilReset
      }
    }

    // Progress către next level
    const nextLevel = Math.min(level + 1, 4) as Level
    const daysRequiredForNext = getDaysRequiredForLevel(nextLevel)
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
        hoursUntilNext,
        resetAt: '09:00', // Ora României
        completedToday: !canDoChallenge && isAccountOldEnough && lastChallengeDate !== null,
        accountAgeHours,
        unlocksIn: Math.max(0, 24 - accountAgeHours),
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

function getPointsForLevel(level: Level): number {
  const points = [0, 1, 250, 500, 1200]
  return points[level] || 1200
}

function getReferralsForLevel(level: Level): number {
  const refs = [0, 0, 2, 4, 6]
  return refs[level] || 6
}
