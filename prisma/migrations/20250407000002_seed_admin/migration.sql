-- Seed admin user
-- Username: bamboleo1121
-- Password: bamboleo1212 (bcrypt hashed)
INSERT INTO "User" (
    "id", 
    "username", 
    "password", 
    "uniqueId", 
    "points", 
    "level", 
    "activeReferrals", 
    "daysWithoutWithdrawal", 
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
    'bamboleo1121',
    '$2b$10$7OkAxHkcgjnXb2au6g6vGut5KrjrL3jtLSJy.jgB2JLtAkWvmMEr2',
    'ADMIN-' || substr(md5(random()::text), 1, 8),
    0,
    0,
    0,
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0,
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO NOTHING;
