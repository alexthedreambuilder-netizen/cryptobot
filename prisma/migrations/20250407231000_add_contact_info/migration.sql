-- Add contact info columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Create indexes for contact info
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
