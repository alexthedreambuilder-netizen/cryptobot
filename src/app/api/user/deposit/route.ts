import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)
  
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const { amount, currency, network, txHash } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!['BTC', 'ETH', 'USDT'].includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
    }

    if (!txHash || !txHash.trim()) {
      return NextResponse.json({ error: 'Transaction hash is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        points: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine the deposit address based on currency and network
    let depositAddress = ''
    if (currency === 'BTC') {
      depositAddress = 'bc1q983wv7283xt69erzra6mk89sq6suc64p6jkhvj'
    } else if (currency === 'ETH') {
      depositAddress = '0xd456022fecf34E5cA2593dFb327c39B2096790b5'
    } else if (currency === 'USDT') {
      depositAddress = network === 'TRC20' 
        ? 'TQPUeUvnpJPPBXATbpogLLiEGotQbPN4x6'
        : '0xd456022fecf34E5cA2593dFb327c39B2096790b5'
    }

    // Create pending deposit request
    await prisma.history.create({
      data: {
        userId: user.id,
        type: 'DEPOSIT_PENDING',
        description: `Deposit request: $${amount} in ${currency}${network ? ` (${network})` : ''} - Pending verification`,
        pointsChange: amount,
        newPoints: user.points,  // Points not added yet, pending approval
        metadata: {
          currency,
          network: network || null,
          txHash: txHash.trim(),
          depositAddress,
          status: 'PENDING',
          submittedAt: new Date().toISOString(),
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Deposit request submitted for admin approval'
    })
  } catch (error) {
    console.error('Deposit error:', error)
    return NextResponse.json({ error: 'Failed to submit deposit request' }, { status: 500 })
  }
}
