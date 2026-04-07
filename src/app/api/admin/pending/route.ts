import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
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
    // Get all pending history entries (withdrawals and deposits)
    const allRequests = await prisma.history.findMany({
      where: {
        OR: [
          { type: 'WITHDRAWAL_REQUEST' },
          { type: 'DEPOSIT_PENDING' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            uniqueId: true,
          },
        },
      },
    })

    // Filter for pending status manually (metadata.status === 'PENDING' or no status)
    const pendingRequests = allRequests.filter((req) => {
      const meta = req.metadata as any
      return !meta?.status || meta.status === 'PENDING'
    })

    const formattedRequests = pendingRequests.map((req) => ({
      id: req.id,
      userId: req.userId,
      username: req.user.username,
      uniqueId: req.user.uniqueId,
      type: req.type === 'WITHDRAWAL_REQUEST' ? 'WITHDRAWAL' : 'DEPOSIT',
      amount: Math.abs(req.pointsChange || 0),
      currency: (req.metadata as any)?.currency || 'BTC',
      network: (req.metadata as any)?.network || null,
      walletAddress: (req.metadata as any)?.walletAddress || null,
      txHash: (req.metadata as any)?.txHash || null,
      status: 'PENDING',
      createdAt: req.createdAt,
    }))

    return NextResponse.json({ requests: formattedRequests })
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    return NextResponse.json({ error: 'Failed to fetch pending requests' }, { status: 500 })
  }
}
