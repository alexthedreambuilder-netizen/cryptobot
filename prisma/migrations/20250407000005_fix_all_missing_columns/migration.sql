-- Final fix: Add all missing columns from schema.prisma

-- Profile fields (added in migration 3 but may have been skipped)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "btcWallet" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ethWallet" TEXT;

-- Ensure test user exists with the correct referral ID
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
