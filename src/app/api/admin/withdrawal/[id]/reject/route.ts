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

    // Find the withdrawal request
    const withdrawalRequest = await prisma.history.findFirst({
      where: {
        id,
        type: 'WITHDRAWAL_REQUEST',
        metadata: {
          path: ['status'],
          equals: 'PENDING',
        },
      },
      include: { user: true },
    })

    if (!withdrawalRequest) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 })
    }

    const amount = Math.abs(withdrawalRequest.pointsChange || 0)
    const currency = withdrawalRequest.metadata?.currency || 'BTC'

    // Refund the points to user
    await prisma.user.update({
      where: { id: withdrawalRequest.userId },
      data: {
        points: { increment: amount },
        lastPointsChange: new Date(),
      },
    })

    // Update the history entry
    await prisma.history.update({
      where: { id },
      data: {
        type: 'WITHDRAWAL_REJECTED',
        description: `Withdrawal rejected: $${amount} in ${currency} - Points refunded`,
        metadata: {
          ...withdrawalRequest.metadata,
          status: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectedBy: payload.username,
          pointsRefunded: amount,
        },
      },
    })

    // Create a new history entry for the rejection
    await prisma.history.create({
      data: {
        userId: withdrawalRequest.userId,
        type: 'WITHDRAWAL_REJECTED',
        description: `Admin rejected withdrawal of $${amount} - Points refunded`,
        pointsChange: amount,
        newPoints: withdrawalRequest.user.points + amount,
        metadata: {
          originalRequestId: id,
          currency,
          rejectedBy: payload.username,
          rejectedAt: new Date().toISOString(),
          pointsRefunded: true,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting withdrawal:', error)
    return NextResponse.json({ error: 'Failed to reject withdrawal' }, { status: 500 })
  }
}
