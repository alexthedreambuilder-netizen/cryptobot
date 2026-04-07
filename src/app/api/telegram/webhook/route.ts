import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// POST - Receive webhook from Telegram
export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    
    // Handle new message
    if (update.message) {
      const { message } = update
      const chatId = message.chat.id
      const text = message.text || ''
      const username = message.chat.username || null
      const firstName = message.chat.first_name || null
      const lastName = message.chat.last_name || null
      
      // Handle /start command
      if (text === '/start') {
        // Check if chat exists
        let chat = await prisma.telegramChat.findUnique({
          where: { chatId },
        })
        
        if (!chat) {
          // Create new chat
          chat = await prisma.telegramChat.create({
            data: {
              chatId,
              username,
              firstName,
              lastName,
              status: 'ACTIVE',
              lastMessageAt: new Date(),
            },
          })
        }
        
        // Send welcome message
        const welcomeText = `👋 <b>Welcome to Crypto Bambozl'd Support!</b>

🤖 I'm here to help you with any questions about:
• Your account and deposits
• Withdrawals
• Referral system
• Daily challenges

💬 <b>How it works:</b>
Just send me your question and our support team will reply as soon as possible!

⏰ <b>Response time:</b> Usually within a few hours during business hours.

🚀 Let's get started!`;
        
        await sendTelegramMessage(chatId, welcomeText)
        
        // Save welcome message as from admin
        await prisma.telegramMessage.create({
          data: {
            chatId,
            messageId: Date.now(),
            text: welcomeText,
            fromUser: false,
            read: true,
          },
        })
        
        return NextResponse.json({ ok: true })
      }
      
      // Regular message from user
      // Find or create chat
      let chat = await prisma.telegramChat.findUnique({
        where: { chatId },
      })
      
      if (!chat) {
        chat = await prisma.telegramChat.create({
          data: {
            chatId,
            username,
            firstName,
            lastName,
            status: 'ACTIVE',
            lastMessageAt: new Date(),
          },
        })
      } else {
        // Update last message time
        await prisma.telegramChat.update({
          where: { chatId },
          data: { 
            lastMessageAt: new Date(),
            status: 'ACTIVE',
          },
        })
      }
      
      // Save message
      await prisma.telegramMessage.create({
        data: {
          chatId,
          messageId: message.message_id,
          text,
          fromUser: true,
          read: false,
        },
      })
      
      // Auto-reply acknowledgment
      await sendTelegramMessage(chatId, `✅ Message received! Our support team will reply soon.\n\n🆔 Chat ID: #${chatId}`)
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true }) // Always return ok to Telegram
  }
}
