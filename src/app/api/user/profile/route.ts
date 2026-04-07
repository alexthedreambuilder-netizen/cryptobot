import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - fetch user profile
export async function GET(req: Request) {
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
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        btcWallet: true,
        ethWallet: true,
        usdtErc20Wallet: true,
        usdtTrc20Wallet: true,
        uniqueId: true,
        points: true,
        level: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT - update user profile
export async function PUT(req: Request) {
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
    const { firstName, lastName, btcWallet, ethWallet, usdtErc20Wallet, usdtTrc20Wallet } = await req.json()

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        btcWallet: btcWallet || null,
        ethWallet: ethWallet || null,
        usdtErc20Wallet: usdtErc20Wallet || null,
        usdtTrc20Wallet: usdtTrc20Wallet || null,
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        btcWallet: true,
        ethWallet: true,
        usdtErc20Wallet: true,
        usdtTrc20Wallet: true,
        uniqueId: true,
        points: true,
        level: true,
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
