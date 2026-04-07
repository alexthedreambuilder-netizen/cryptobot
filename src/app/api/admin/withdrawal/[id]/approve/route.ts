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
      },
      include: { user: true },
    })

    if (!withdrawalRequest) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 })
    }

    const amount = Math.abs(withdrawalRequest.pointsChange || 0)
    const metadata = withdrawalRequest.metadata as any

    // Check if it's still pending
    if (metadata?.status && metadata.status !== 'PENDING') {
      return NextResponse.json({ error: 'Withdrawal request already processed' }, { status: 400 })
    }
    const currency = metadata?.currency || 'BTC'
    const network = metadata?.network || null
    const walletAddress = metadata?.walletAddress || ''

    // Update the history entry
    await prisma.history.update({
      where: { id },
      data: {
        type: 'WITHDRAWAL_APPROVED',
        description: `Withdrawal approved: $${amount} in ${currency}${network ? ` (${network})` : ''} to ${walletAddress}`,
        metadata: {
          ...(typeof withdrawalRequest.metadata === 'object' && withdrawalRequest.metadata !== null ? withdrawalRequest.metadata : {}),
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedBy: payload.username,
        } as any,
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
        } as any,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving withdrawal:', error)
    return NextResponse.json({ error: 'Failed to approve withdrawal' }, { status: 500 })
  }
}
