import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 400 })
    }

    // Verify password
    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 400 })
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
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
