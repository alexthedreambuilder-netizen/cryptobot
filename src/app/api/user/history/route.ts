import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/middleware'

export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const history = await prisma.history.findMany({
      where: { 
        userId: auth.user.userId,
        // Exclude admin update actions - only show WITHDRAWAL and DEPOSIT_APPROVED
        type: {
          not: 'ADMIN_UPDATE'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('History error:', error)
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 })
  }
}
