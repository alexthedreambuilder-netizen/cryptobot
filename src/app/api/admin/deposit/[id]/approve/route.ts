import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)
  
  if (!payload || !payload.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params

    // Find the deposit request
    const depositRequest = await prisma.history.findFirst({
      where: {
        id,
        type: 'DEPOSIT_PENDING',
      },
      include: { 
        user: {
          select: {
            id: true,
            username: true,
            points: true,
            referrerId: true,
          }
        } 
      },
    })

    if (!depositRequest) {
      return NextResponse.json({ error: 'Deposit request not found' }, { status: 404 })
    }

    // Check if it's still pending
    const metadata = depositRequest.metadata as any
    if (metadata?.status && metadata.status !== 'PENDING') {
      return NextResponse.json({ error: 'Deposit request already processed' }, { status: 400 })
    }

    if (!depositRequest) {
      return NextResponse.json({ error: 'Deposit request not found' }, { status: 404 })
    }

    const amount = Math.abs(depositRequest.pointsChange || 0)

    // Update user points
    const updatedUser = await prisma.user.update({
      where: { id: depositRequest.userId },
      data: {
        points: { increment: amount },
        lastPointsChange: new Date(),
      },
    })

    // Activate referral if this is the user's first deposit and they have a referrer
    if (depositRequest.user.referrerId) {
      // Check if this is the first approved deposit
      const previousDeposits = await prisma.history.count({
        where: {
          userId: depositRequest.userId,
          type: { in: ['DEPOSIT', 'DEPOSIT_APPROVED'] },
          id: { not: id },
        },
      })

      if (previousDeposits === 0) {
        // First deposit - activate referral
        const referrer = await prisma.user.findUnique({
          where: { uniqueId: depositRequest.user.referrerId },
        })

        if (referrer) {
          // Increment active referrals
          await prisma.user.update({
            where: { id: referrer.id },
            data: { activeReferrals: { increment: 1 } },
          })

          // Log referral activation
          await prisma.history.create({
            data: {
              userId: referrer.id,
              type: 'REFERRAL_ACTIVATED',
              description: `Referral activated: ${depositRequest.user.username}`,
              metadata: { referredUserId: depositRequest.userId, bonus: 10 },
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
    }

    // Update the history entry
    await prisma.history.update({
      where: { id },
      data: {
        type: 'DEPOSIT',
        description: `Deposit approved: $${amount}`,
        metadata: {
          ...(typeof depositRequest.metadata === 'object' && depositRequest.metadata !== null ? depositRequest.metadata : {}),
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedBy: payload.username,
        } as any,
      },
    })

    // Create a new history entry for the approval
    await prisma.history.create({
      data: {
        userId: depositRequest.userId,
        type: 'DEPOSIT_APPROVED',
        description: `Admin approved deposit of $${amount}`,
        pointsChange: amount,
        newPoints: depositRequest.user.points + amount,
        metadata: {
          originalRequestId: id,
          approvedBy: payload.username,
          approvedAt: new Date().toISOString(),
        } as any,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving deposit:', error)
    return NextResponse.json({ error: 'Failed to approve deposit' }, { status: 500 })
  }
}
