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
    const network = withdrawalRequest.metadata?.network || null
    const walletAddress = withdrawalRequest.metadata?.walletAddress || ''

    // Update the history entry
    await prisma.history.update({
      where: { id },
      data: {
        type: 'WITHDRAWAL_APPROVED',
        description: `Withdrawal approved: $${amount} in ${currency}${network ? ` (${network})` : ''} to ${walletAddress}`,
        metadata: {
          ...withdrawalRequest.metadata,
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedBy: payload.username,
        },
      },
    })

    // Create a new history entry for the approval
    await prisma.history.create({
      data: {
        userId: withdrawalRequest.userId,
        type: 'WITHDRAWAL_APPROVED',
        description: `Admin approved withdrawal of $${amount}`,
        pointsChange: -amount,
        newPoints: withdrawalRequest.user.points - amount,
        metadata: {
          originalRequestId: id,
          currency,
          network,
          walletAddress,
          approvedBy: payload.username,
          approvedAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving withdrawal:', error)
    return NextResponse.json({ error: 'Failed to approve withdrawal' }, { status: 500 })
  }
}
