-- Fix HistoryType enum - add missing deposit types
DO $$
BEGIN
    -- Check if DEPOSIT_PENDING exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'DEPOSIT_PENDING' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'HistoryType')
    ) THEN
        ALTER TYPE "HistoryType" ADD VALUE 'DEPOSIT_PENDING';
    END IF;

    -- Check if DEPOSIT_APPROVED exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'DEPOSIT_APPROVED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'HistoryType')
    ) THEN
        ALTER TYPE "HistoryType" ADD VALUE 'DEPOSIT_APPROVED';
    END IF;

    -- Check if DEPOSIT_REJECTED exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'DEPOSIT_REJECTED' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'HistoryType')
    ) THEN
        ALTER TYPE "HistoryType" ADD VALUE 'DEPOSIT_REJECTED';
    END IF;
END $$;
