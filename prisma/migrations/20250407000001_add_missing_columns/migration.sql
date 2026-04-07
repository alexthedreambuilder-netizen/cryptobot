-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastPointsChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLevelUpDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "daysAtCurrentLevel" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastChallengeDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "streakDays" INTEGER NOT NULL DEFAULT 0;

-- Drop and recreate DailyChallenge table with correct columns
DROP TABLE IF EXISTS "DailyChallenge";

CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "game1Type" TEXT NOT NULL,
    "game1Data" JSONB,
    "game1Completed" BOOLEAN NOT NULL DEFAULT false,
    "game2Type" TEXT NOT NULL,
    "game2Data" JSONB,
    "game2Completed" BOOLEAN NOT NULL DEFAULT false,
    "game3Type" TEXT NOT NULL,
    "game3Data" JSONB,
    "game3Completed" BOOLEAN NOT NULL DEFAULT false,
    "rewardCalculated" DOUBLE PRECISION,
    "rewardPoints" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- Create unique index for DailyChallenge
CREATE UNIQUE INDEX "DailyChallenge_userId_date_key" ON "DailyChallenge"("userId", "date");

-- Add foreign key for DailyChallenge
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update History table - drop and recreate with correct enum and columns
DROP TABLE IF EXISTS "History";

-- Create enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'HistoryType') THEN
        CREATE TYPE "HistoryType" AS ENUM ('REGISTER', 'SET_REFERRER', 'POINTS_ADDED', 'POINTS_REMOVED', 'REFERRAL_ACTIVATED', 'DAILY_REWARD', 'LEVEL_UP', 'LEVEL_DOWN', 'PATIENCE_BONUS_RESET', 'CHALLENGE_COMPLETED', 'MILESTONE_REACHED', 'WITHDRAWAL_STREAK_BROKEN');
    END IF;
END $$;

CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "HistoryType" NOT NULL,
    "description" TEXT NOT NULL,
    "pointsChange" INTEGER,
    "newPoints" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for History
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
