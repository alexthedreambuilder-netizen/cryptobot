-- Add new enum values to HistoryType
-- Note: PostgreSQL doesn't allow adding values to existing enums in a single command
-- We need to create a new enum, alter the column, and drop the old one

-- Add new values to HistoryType enum
ALTER TYPE "HistoryType" ADD VALUE IF NOT EXISTS 'WITHDRAWAL_REQUEST';
ALTER TYPE "HistoryType" ADD VALUE IF NOT EXISTS 'WITHDRAWAL_APPROVED';
ALTER TYPE "HistoryType" ADD VALUE IF NOT EXISTS 'WITHDRAWAL_REJECTED';
ALTER TYPE "HistoryType" ADD VALUE IF NOT EXISTS 'DEPOSIT';
