-- CreateEnum
CREATE TYPE "HistoryType" AS ENUM ('REGISTER', 'SET_REFERRER', 'POINTS_ADDED', 'POINTS_REMOVED', 'REFERRAL_ACTIVATED', 'DAILY_REWARD', 'LEVEL_UP', 'LEVEL_DOWN', 'PATIENCE_BONUS_RESET', 'CHALLENGE_COMPLETED', 'MILESTONE_REACHED', 'WITHDRAWAL_STREAK_BROKEN');

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "referrerId" TEXT,
    "activeReferrals" INTEGER NOT NULL DEFAULT 0,
    "patienceBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPointsChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLevelUpDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daysAtCurrentLevel" INTEGER NOT NULL DEFAULT 0,
    "lastChallengeDate" TIMESTAMP(3),
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable History
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

-- CreateTable DailyChallenge
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

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_uniqueId_key" ON "User"("uniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_userId_date_key" ON "DailyChallenge"("userId", "date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("uniqueId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
