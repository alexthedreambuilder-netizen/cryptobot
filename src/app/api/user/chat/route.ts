import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Get user's chat messages
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    // Get user with contact info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has contact info
    const hasContact = !!(user.email || user.phone)

    // Get messages
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })

    // Mark unread messages as read (only from admin)
    await prisma.chatMessage.updateMany({
      where: { userId, fromUser: false, read: false },
      data: { read: true },
    })

    // Reset unread count
    await prisma.user.update({
      where: { id: userId },
      data: { chatUnreadCount: 0 },
    })

    return NextResponse.json({ messages, hasContact, contact: { email: user.email, phone: user.phone } })
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const { text } = await req.json()

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Message text required' }, { status: 400 })
    }

    // Check if user has contact info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    })

    if (!user?.email && !user?.phone) {
      return NextResponse.json({ error: 'Contact info required' }, { status: 403 })
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        userId,
        text: text.trim(),
        fromUser: true,
        read: false,
      },
    })

    // Update user's last message time
    await prisma.user.update({
      where: { id: userId },
      data: { lastChatMessageAt: new Date() },
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update contact info
export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const { email, phone } = await req.json()

    // Validate at least one contact method
    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 })
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: email || null,
        phone: phone || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
