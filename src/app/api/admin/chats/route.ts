import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Get all active chats (users with messages)
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all users with chat messages, ordered by last message
    const users = await prisma.user.findMany({
      where: {
        lastChatMessageAt: { not: null },
      },
      orderBy: {
        lastChatMessageAt: 'desc',
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        chatUnreadCount: true,
        lastChatMessageAt: true,
        _count: {
          select: {
            chatMessages: {
              where: {
                fromUser: true,
                read: false,
              },
            },
          },
        },
      },
    })

    // Get last message for each user
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await prisma.chatMessage.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: {
            text: true,
            fromUser: true,
            createdAt: true,
          },
        })

        return {
          ...user,
          lastMessage,
          unreadCount: user._count.chatMessages,
        }
      })
    )

    return NextResponse.json({ users: usersWithLastMessage })
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
