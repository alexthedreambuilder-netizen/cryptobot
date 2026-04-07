import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { calculateLevel } from '@/lib/level'

export async function POST(req: NextRequest) {
  try {
    const { username, password, referrerId } = await req.json()

    // Validation
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username: 3-20 characters' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password: minimum 6 characters' }, { status: 400 })
    }

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    // Verify referrer if provided
    let validReferrerId: string | undefined = undefined
    if (referrerId && referrerId.trim()) {
      const referrer = await prisma.user.findUnique({ where: { uniqueId: referrerId.trim() } })
      if (!referrer) {
        return NextResponse.json({ error: 'Invalid Referrer ID' }, { status: 400 })
      }
      validReferrerId = referrer.uniqueId
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        referrerId: validReferrerId,
        level: 0,
        points: 0,
      },
    })

    // Log in history
    await prisma.history.create({
      data: {
        userId: user.id,
        type: 'REGISTER',
        description: 'Account created',
      },
    })

    // Log referrer setup
    if (validReferrerId) {
      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'SET_REFERRER',
          description: `Referrer set: ${validReferrerId}`,
        },
      })
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        uniqueId: user.uniqueId,
        level: user.level,
        points: user.points,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
