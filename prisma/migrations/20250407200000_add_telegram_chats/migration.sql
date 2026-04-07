-- Create table for Telegram chat sessions
CREATE TABLE IF NOT EXISTS "TelegramChat" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "chatId" BIGINT NOT NULL UNIQUE,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create table for messages
CREATE TABLE IF NOT EXISTS "TelegramMessage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "chatId" BIGINT NOT NULL,
    "messageId" BIGINT NOT NULL,
    "text" TEXT NOT NULL,
    "fromUser" BOOLEAN NOT NULL DEFAULT true,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TelegramMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "TelegramChat"("chatId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "TelegramMessage_chatId_idx" ON "TelegramMessage"("chatId");
CREATE INDEX IF NOT EXISTS "TelegramMessage_createdAt_idx" ON "TelegramMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "TelegramChat_status_idx" ON "TelegramChat"("status");
