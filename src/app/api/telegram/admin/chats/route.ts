import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - List all Telegram chats for admin
export async function GET(req: NextRequest) {
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
    const chats = await prisma.telegramChat.findMany({
      where: { status: { not: 'BLOCKED' } },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        _count: {
          select: { messages: { where: { read: false, fromUser: true } } }
        }
      }
    })

    return NextResponse.json({ 
      chats: chats.map(chat => ({
        id: chat.id,
        chatId: chat.chatId,
        username: chat.username,
        firstName: chat.firstName,
        lastName: chat.lastName,
        status: chat.status,
        lastMessageAt: chat.lastMessageAt,
        unreadCount: chat._count.messages,
      }))
    })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
