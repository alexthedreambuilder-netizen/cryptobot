import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'
import { generateDailyChallenge, GameData } from '@/lib/games'
import { calculateTotalPercent } from '@/lib/level'

// GET - Get or create today's challenge
export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if challenge already exists for today
    let challenge = await prisma.dailyChallenge.findUnique({
      where: {
        userId_date: {
          userId: auth.user.userId,
          date: today,
        },
      },
    })

    if (!challenge) {
      // Generate new challenge
      const [game1, game2, game3] = generateDailyChallenge()
      
      challenge = await prisma.dailyChallenge.create({
        data: {
          userId: auth.user.userId,
          date: today,
          game1Type: game1.type,
          game1Data: game1 as any,
          game2Type: game2.type,
          game2Data: game2 as any,
          game3Type: game3.type,
          game3Data: game3 as any,
        },
      })
    }

    // If already completed, return error
    if (challenge.completed) {
      return NextResponse.json({ error: 'Challenge already completed today' }, { status: 400 })
    }

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        game1: {
          type: challenge.game1Type,
          data: challenge.game1Data,
          completed: challenge.game1Completed,
        },
        game2: {
          type: challenge.game2Type,
          data: challenge.game2Data,
          completed: challenge.game2Completed,
        },
        game3: {
          type: challenge.game3Type,
          data: challenge.game3Data,
          completed: challenge.game3Completed,
        },
      },
    })
  } catch (error) {
    console.error('Challenge get error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Submit result for a game
export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { gameNumber, completed } = await req.json()

    if (![1, 2, 3].includes(gameNumber) || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const challenge = await prisma.dailyChallenge.findUnique({
      where: {
        userId_date: {
          userId: auth.user.userId,
          date: today,
        },
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    if (challenge.completed) {
      return NextResponse.json({ error: 'Challenge already completed' }, { status: 400 })
    }

    // Update specific game
    const updateData: any = {}
    if (gameNumber === 1) updateData.game1Completed = completed
    if (gameNumber === 2) updateData.game2Completed = completed
    if (gameNumber === 3) updateData.game3Completed = completed

    const updatedChallenge = await prisma.dailyChallenge.update({
      where: { id: challenge.id },
      data: updateData,
    })

    // Check if all games are completed
    const allCompleted = updatedChallenge.game1Completed && 
                        updatedChallenge.game2Completed && 
                        updatedChallenge.game3Completed

    if (allCompleted && !updatedChallenge.completed) {
      // Calculate and award reward
      const user = await prisma.user.findUnique({
        where: { id: auth.user.userId },
      })

      if (user) {
        const daysSinceChange = Math.floor(
          (Date.now() - user.lastPointsChange.getTime()) / (1000 * 60 * 60 * 24)
        )
        const patienceBonus = Math.min(daysSinceChange * 0.1, 2)
        const totalPercent = calculateTotalPercent(user.level, user.activeReferrals, patienceBonus)
        
        const rewardPoints = Math.floor(user.points * (totalPercent / 100))
        const finalReward = Math.max(1, rewardPoints) // Minimum 1 point

        await prisma.user.update({
          where: { id: user.id },
          data: {
            points: { increment: finalReward },
            lastChallengeDate: new Date(),
          },
        })

        await prisma.dailyChallenge.update({
          where: { id: challenge.id },
          data: {
            completed: true,
            completedAt: new Date(),
            rewardCalculated: totalPercent,
            rewardPoints: finalReward,
          },
        })

        await prisma.history.create({
          data: {
            userId: user.id,
            type: 'CHALLENGE_COMPLETED',
            description: 'Daily challenge completed',
            pointsChange: finalReward,
            newPoints: user.points + finalReward,
          },
        })

        return NextResponse.json({
          success: true,
          completed: true,
          reward: finalReward,
          totalPercent,
        })
      }
    }

    return NextResponse.json({
      success: true,
      completed: false,
      progress: {
        game1: updatedChallenge.game1Completed,
        game2: updatedChallenge.game2Completed,
        game3: updatedChallenge.game3Completed,
      },
    })
  } catch (error) {
    console.error('Challenge submit error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
