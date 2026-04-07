import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

// Send message to Telegram user
async function sendTelegramMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) return null
  
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })
    return await res.json()
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return null
  }
}

// GET - Get messages for a specific chat
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

  const { searchParams } = new URL(req.url)
  const chatId = searchParams.get('chatId')

  if (!chatId) {
    return NextResponse.json({ error: 'Chat ID required' }, { status: 400 })
  }

  try {
    const messages = await prisma.telegramMessage.findMany({
      where: { chatId: BigInt(chatId) },
      orderBy: { createdAt: 'asc' },
    })

    // Mark unread messages as read
    await prisma.telegramMessage.updateMany({
      where: { 
        chatId: BigInt(chatId),
        fromUser: true,
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json({ 
      messages: messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        fromUser: msg.fromUser,
        read: msg.read,
        createdAt: msg.createdAt,
      }))
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Send message from admin to user
export async function POST(req: NextRequest) {
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
    const { chatId, text } = await req.json()

    if (!chatId || !text) {
      return NextResponse.json({ error: 'Chat ID and text required' }, { status: 400 })
    }

    // Send to Telegram
    const telegramResult = await sendTelegramMessage(Number(chatId), text)
    
    if (!telegramResult || !telegramResult.ok) {
      return NextResponse.json({ error: 'Failed to send to Telegram' }, { status: 500 })
    }

    // Save to database
    const message = await prisma.telegramMessage.create({
      data: {
        chatId: BigInt(String(chatId)),
        messageId: telegramResult.result.message_id,
        text,
        fromUser: false,
        read: true,
      },
    })

    // Update chat last message time
    await prisma.telegramChat.update({
      where: { chatId: BigInt(String(chatId)) },
      data: { lastMessageAt: new Date() },
    })

    return NextResponse.json({ 
      success: true,
      message: {
        id: message.id,
        text: message.text,
        fromUser: false,
        createdAt: message.createdAt,
      }
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
