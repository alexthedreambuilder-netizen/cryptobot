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
      include: { user: true },
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

    // Update the history entry
    await prisma.history.update({
      where: { id },
      data: {
        type: 'DEPOSIT_REJECTED',
        description: `Deposit rejected: $${amount}`,
        metadata: {
          ...(typeof depositRequest.metadata === 'object' && depositRequest.metadata !== null ? depositRequest.metadata : {}),
          status: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectedBy: payload.username,
        } as any,
      },
    })

    // Create a new history entry for the rejection
    await prisma.history.create({
      data: {
        userId: depositRequest.userId,
        type: 'DEPOSIT_REJECTED',
        description: `Admin rejected deposit of $${amount}`,
        pointsChange: 0,
        newPoints: depositRequest.user.points,
        metadata: {
          originalRequestId: id,
          rejectedBy: payload.username,
          rejectedAt: new Date().toISOString(),
        } as any,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting deposit:', error)
    return NextResponse.json({ error: 'Failed to reject deposit' }, { status: 500 })
  }
}
