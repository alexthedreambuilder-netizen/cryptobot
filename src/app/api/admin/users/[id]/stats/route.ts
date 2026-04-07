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
    const { daysAtCurrentLevel, activeReferrals, points } = await req.json()

    const updateData: any = {}
    const metadataFields: any = {}

    if (daysAtCurrentLevel !== undefined && daysAtCurrentLevel >= 0) {
      const days = parseInt(daysAtCurrentLevel)
      updateData.daysAtCurrentLevel = days
      // Recalculează lastLevelUpDate bazat pe zilele dorite
      updateData.lastLevelUpDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      metadataFields.daysAtCurrentLevel = days
    }

    if (activeReferrals !== undefined && activeReferrals >= 0) {
      updateData.activeReferrals = parseInt(activeReferrals)
      metadataFields.activeReferrals = activeReferrals
    }

    if (points !== undefined && points >= 0) {
      updateData.points = parseInt(points)
      metadataFields.points = points
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update user's stats
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // DO NOT log admin updates to user history - they should be invisible to users
    // Only WITHDRAWAL and DEPOSIT_APPROVED should appear in user history

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Error updating user stats:', error)
    return NextResponse.json({ error: 'Failed to update user stats' }, { status: 500 })
  }
}
