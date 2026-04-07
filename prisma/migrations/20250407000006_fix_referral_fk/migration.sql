-- Fix referral foreign key issue
-- Drop the existing FK constraint
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_referrerId_fkey";

-- Re-add it with proper settings
ALTER TABLE "User" ADD CONSTRAINT "User_referrerId_fkey" 
    FOREIGN KEY ("referrerId") REFERENCES "User"("uniqueId") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- Ensure uniqueId has unique index
CREATE UNIQUE INDEX IF NOT EXISTS "User_uniqueId_key" ON "User"("uniqueId");
