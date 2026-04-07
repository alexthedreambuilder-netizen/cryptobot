import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
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
    const { daysAtCurrentLevel } = await req.json()

    if (daysAtCurrentLevel === undefined || daysAtCurrentLevel < 0) {
      return NextResponse.json({ error: 'Invalid days value' }, { status: 400 })
    }

    // Update user's days at current level
    const user = await prisma.user.update({
      where: { id },
      data: {
        daysAtCurrentLevel: parseInt(daysAtCurrentLevel),
      },
    })

    // Log the change in history
    await prisma.history.create({
      data: {
        userId: id,
        type: 'ADMIN_UPDATE',
        description: `Admin updated days at current level to ${daysAtCurrentLevel}`,
        metadata: {
          field: 'daysAtCurrentLevel',
          newValue: daysAtCurrentLevel,
          updatedBy: payload.username,
          updatedAt: new Date().toISOString(),
        }
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error updating user stats:', error)
    return NextResponse.json({ error: 'Failed to update user stats' }, { status: 500 })
  }
}
