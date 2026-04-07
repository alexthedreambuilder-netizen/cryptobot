-- Add chat-related columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "chatUnreadCount" INTEGER DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastChatMessageAt" TIMESTAMP(3);

-- Create ChatMessage table
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "fromUser" BOOLEAN NOT NULL DEFAULT true,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "ChatMessage_userId_idx" ON "ChatMessage"("userId");
CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_read_idx" ON "ChatMessage"("read");
CREATE INDEX IF NOT EXISTS "User_chatUnreadCount_idx" ON "User"("chatUnreadCount");
CREATE INDEX IF NOT EXISTS "User_lastChatMessageAt_idx" ON "User"("lastChatMessageAt");
