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
        metadata: {
          path: ['status'],
          equals: 'PENDING',
        },
      },
      include: { user: true },
    })

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
          ...depositRequest.metadata,
          status: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectedBy: payload.username,
        },
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
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting deposit:', error)
    return NextResponse.json({ error: 'Failed to reject deposit' }, { status: 500 })
  }
}
