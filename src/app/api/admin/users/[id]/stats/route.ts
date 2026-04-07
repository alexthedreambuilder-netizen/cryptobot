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
    const { daysAtCurrentLevel, activeReferrals } = await req.json()

    const updateData: any = {}
    const metadataFields: any = {}

    if (daysAtCurrentLevel !== undefined && daysAtCurrentLevel >= 0) {
      updateData.daysAtCurrentLevel = parseInt(daysAtCurrentLevel)
      metadataFields.daysAtCurrentLevel = daysAtCurrentLevel
    }

    if (activeReferrals !== undefined && activeReferrals >= 0) {
      updateData.activeReferrals = parseInt(activeReferrals)
      metadataFields.activeReferrals = activeReferrals
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update user's stats
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Build description based on what was updated
    const changes = Object.keys(metadataFields).map(f => {
      if (f === 'daysAtCurrentLevel') return `days at level: ${metadataFields[f]}`
      if (f === 'activeReferrals') return `active referrals: ${metadataFields[f]}`
      return f
    }).join(', ')

    // Log the change in history
    await prisma.history.create({
      data: {
        userId: id,
        type: 'ADMIN_UPDATE',
        description: `Admin updated ${changes}`,
        metadata: {
          ...metadataFields,
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
