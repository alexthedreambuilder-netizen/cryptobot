import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { calculateLevel, type Level } from '@/lib/level'

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
    const { amount, currency, network } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!['BTC', 'ETH', 'USDT'].includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        points: true,
        level: true,
        activeReferrals: true,
        daysAtCurrentLevel: true,
        lastLevelUpDate: true,
        btcWallet: true,
        ethWallet: true,
        usdtErc20Wallet: true,
        usdtTrc20Wallet: true,
        username: true,
        uniqueId: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (amount > user.points) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    let walletAddress: string | null = null
    if (currency === 'BTC') walletAddress = user.btcWallet
    else if (currency === 'ETH') walletAddress = user.ethWallet
    else if (currency === 'USDT') {
      walletAddress = network === 'ERC20' ? user.usdtErc20Wallet : user.usdtTrc20Wallet
    }
    if (!walletAddress) {
      return NextResponse.json({ error: `${currency} wallet not configured` }, { status: 400 })
    }

    // Create withdrawal request (as a history entry with pending status)
    await prisma.history.create({
      data: {
        userId: user.id,
        type: 'WITHDRAWAL_REQUEST',
        description: `Withdrawal request: $${amount} in ${currency}${currency === 'USDT' ? ` (${network})` : ''} to ${walletAddress}`,
        pointsChange: -amount,
        newPoints: user.points - amount,
        metadata: {
          currency,
          network: currency === 'USDT' ? network : null,
          walletAddress,
          status: 'PENDING',
          requestedAt: new Date().toISOString(),
        }
      }
    })

    // Calculate new points after withdrawal
    const newPoints = user.points - amount
    
    // Calculate expected level based on new balance (LEVEL DOWN if needed)
    const expectedLevel = calculateLevel(newPoints, user.activeReferrals, user.daysAtCurrentLevel)
    
    // Prepare update data
    const updateData: any = {
      points: newPoints,
      lastPointsChange: new Date(),
    }
    
    // If level decreases, update level and reset days
    if (expectedLevel < user.level) {
      updateData.level = expectedLevel
      updateData.daysAtCurrentLevel = 0
      updateData.lastLevelUpDate = new Date()
      
      // Log level down
      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'LEVEL_DOWN',
          description: `Level ${user.level} → ${expectedLevel} (withdrawal)`,
          pointsChange: 0,
          newPoints,
          metadata: { 
            oldLevel: user.level, 
            newLevel: expectedLevel,
            reason: 'withdrawal'
          },
        },
      })
    }
    
    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal request submitted for admin approval',
      levelDown: expectedLevel < user.level ? { from: user.level, to: expectedLevel } : null,
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Failed to process withdrawal' }, { status: 500 })
  }
}
