-- Add profile fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "btcWallet" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ethWallet" TEXT;

-- Add test user with known referral ID (fără coloanele opționale noi pentru compatibilitate)
INSERT INTO "User" (
    "id", 
    "username", 
    "password", 
    "uniqueId", 
    "points", 
    "level", 
    "activeReferrals", 
    "patienceBonus", 
    "lastPointsChange", 
    "lastLevelUpDate", 
    "daysAtCurrentLevel", 
    "streakDays", 
    "isAdmin", 
    "createdAt", 
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'testuser',
    '$2b$10$7OkAxHkcgjnXb2au6g6vGut5KrjrL3jtLSJy.jgB2JLtAkWvmMEr2',
    'TEST-REF-12345',
    100,
    1,
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0,
    0,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO NOTHING;
