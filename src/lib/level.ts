// Sistem de level conform specificației
// Zilele se resetează la fiecare level up!

export const LEVELS = {
  0: { minPoints: 0, maxPoints: 0, minReferrals: 0, daysRequired: 0, dailyPercent: 0 },
  1: { minPoints: 1, maxPoints: 249, minReferrals: 0, daysRequired: 0, dailyPercent: 3.4 },
  2: { minPoints: 250, maxPoints: 499, minReferrals: 2, daysRequired: 2, dailyPercent: 5.1 }, // 2 zile de la LvL 1
  3: { minPoints: 500, maxPoints: 1199, minReferrals: 4, daysRequired: 2, dailyPercent: 5.8 }, // 2 zile de la LvL 2 (reset)
  4: { minPoints: 1200, maxPoints: Infinity, minReferrals: 6, daysRequired: 2, dailyPercent: 6.3 }, // 2 zile de la LvL 3 (reset)
}

export type Level = 0 | 1 | 2 | 3 | 4

function normalizeLevel(level: number): Level {
  if (level < 0) return 0
  if (level > 4) return 4
  return level as Level
}

export function calculateLevel(
  points: number, 
  activeReferrals: number, 
  daysAtCurrentLevel: number
): Level {
  // Verifică de la cel mai mare level în jos
  for (let level = 4; level >= 1; level--) {
    const config = LEVELS[level as Level]
    if (
      points >= config.minPoints && 
      activeReferrals >= config.minReferrals &&
      daysAtCurrentLevel >= config.daysRequired
    ) {
      return level as Level
    }
  }
  return 0
}

export function getLevelRequirements(level: Level) {
  return LEVELS[level]
}

export function getDaysRequiredForLevel(level: Level): number {
  return LEVELS[level].daysRequired
}

export function getBasePercent(level: number): number {
  return LEVELS[normalizeLevel(level)].dailyPercent
}

export function getReferralBonusPercent(level: number): number {
  const bonuses: Record<Level, number> = { 0: 0, 1: 0.05, 2: 0.07, 3: 0.08, 4: 0.10 }
  return bonuses[normalizeLevel(level)]
}

export function calculateReferralBonus(level: number, activeReferrals: number): number {
  const maxReferrals = Math.min(activeReferrals, 10) // Max 10 pentru bonus
  return maxReferrals * getReferralBonusPercent(level)
}

export function calculatePatienceBonus(daysSinceLastChange: number): number {
  // Crește zilnic, max 2%
  return Math.min(daysSinceLastChange * 0.1, 2)
}

export function calculateTotalPercent(
  level: number,
  activeReferrals: number,
  patienceBonus: number
): number {
  const normalizedLevel = normalizeLevel(level)
  const basePercent = getBasePercent(normalizedLevel)
  const referralBonus = calculateReferralBonus(normalizedLevel, activeReferrals)
  return basePercent + referralBonus + patienceBonus
}

// Check if user is blocked from leveling up due to days requirement
export function getLevelUpBlockReason(
  currentLevel: Level,
  points: number,
  activeReferrals: number,
  daysAtCurrentLevel: number
): string | null {
  const nextLevel = Math.min(currentLevel + 1, 4) as Level
  if (nextLevel <= currentLevel) return null
  
  const requirements = LEVELS[nextLevel]
  
  if (points < requirements.minPoints) {
    return `Need $${requirements.minPoints - points} more`
  }
  
  if (activeReferrals < requirements.minReferrals) {
    return `Need ${requirements.minReferrals - activeReferrals} more referrals`
  }
  
  if (daysAtCurrentLevel < requirements.daysRequired) {
    return `Wait ${requirements.daysRequired - daysAtCurrentLevel} more days at LvL ${currentLevel}`
  }
  
  return null
}
