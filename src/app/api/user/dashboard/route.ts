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

    // Nu mai facem auto level up/down - userul apasă butonul manual
    // Verificăm doar dacă POATE face level up (toate condițiile îndeplinite)
    const canLevelUp = getLevelUpBlockReason(
      user.level as Level, 
      user.points, 
      user.activeReferrals, 
      daysAtCurrentLevel
    ) === null && user.level < 4
    
    const level = user.level as Level

    // Calculează procente
    const basePercent = getBasePercent(level)
    const referralBonus = calculateReferralBonus(level, user.activeReferrals)
    const totalPercent = calculateTotalPercent(level, user.activeReferrals, patienceBonus)

    // Verifică daily challenge - reset la 9:00 AM ora României
    // Folosim o logică simplă: comparăm datele locale
    const now = new Date()
    
    // Creăm data curentă în timezone-ul Europe/Bucharest
    const romaniaTimeString = now.toLocaleString('en-US', { 
      timeZone: 'Europe/Bucharest',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    })
    const [datePart, timePart] = romaniaTimeString.split(', ')
    const [month, day, year] = datePart.split('/')
    const [hour, minute] = timePart.split(':')
    const romaniaHour = parseInt(hour)
    const romaniaDate = `${year}-${month}-${day}`
    
    // Calculează când e următorul reset (9:00 AM ora României)
    const resetHour = 9
    let hoursUntilReset = resetHour - romaniaHour
    if (hoursUntilReset <= 0) {
      hoursUntilReset += 24
    }
    
    // Verifică dacă challenge-ul de azi e disponibil (după 9 AM)
    const isAfter9AM = romaniaHour >= resetHour
    
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
      // Niciodată nu a făcut challenge, poate face acum dacă e după 9 AM
      canDoChallenge = isAfter9AM
      hoursUntilNext = hoursUntilReset
    } else {
      // Verifică data ultimei provocări în timezone România
      const lastChallengeRomaniaString = lastChallengeDate.toLocaleString('en-US', { 
        timeZone: 'Europe/Bucharest',
        year: 'numeric', month: '2-digit', day: '2-digit',
      })
      const [lcMonth, lcDay, lcYear] = lastChallengeRomaniaString.split('/')
      const lastChallengeRomaniaDate = `${lcYear}-${lcMonth}-${lcDay}`
      
      // Verifică dacă a făcut challenge azi
      if (lastChallengeRomaniaDate === romaniaDate) {
        // A făcut deja challenge azi
        canDoChallenge = false
        hoursUntilNext = hoursUntilReset
      } else {
        // Nu a făcut challenge azi - poate face dacă e după 9 AM
        canDoChallenge = isAfter9AM
        hoursUntilNext = isAfter9AM ? 0 : hoursUntilReset
      }
    }

    // Progress către next level
    const nextLevel = Math.min(level + 1, 4) as Level
    const daysRequiredForNext = getDaysRequiredForLevel(nextLevel)
    const blockReason = getLevelUpBlockReason(level, user.points, user.activeReferrals, daysAtCurrentLevel)
    const nextLevelData = nextLevel > level ? {
      level: nextLevel,
      pointsNeeded: Math.max(0, getPointsForLevel(nextLevel) - user.points),
      referralsNeeded: Math.max(0, getReferralsForLevel(nextLevel) - user.activeReferrals),
      daysNeeded: Math.max(0, daysRequiredForNext - daysAtCurrentLevel),
      currentDays: daysAtCurrentLevel,
      requiredDays: daysRequiredForNext,
      blockReason,
      canLevelUp, // Poate apăsa butonul de level up
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
