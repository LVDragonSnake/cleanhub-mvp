// app/lib/gamification.ts

// Regola semplice: 150 XP per livello
export const XP_PER_LEVEL = 150;

// Livello a partire dagli XP (min 1)
export function levelFromXp(xp: number): number {
  const safe = Math.max(0, Number.isFinite(xp) ? xp : 0);
  return Math.max(1, Math.floor(safe / XP_PER_LEVEL) + 1);
}

/**
 * Ritorna la progress bar del livello corrente:
 * - progress: 0..1 (quanto manca al prossimo livello)
 * - currentLevelXp: XP accumulati dentro al livello
 * - nextLevelXp: XP necessari per passare al prossimo livello
 * - nextLevel: livello successivo
 */
export function progressFromXp(xp: number): {
  level: number;
  nextLevel: number;
  progress: number;
  currentLevelXp: number;
  nextLevelXp: number;
} {
  const safe = Math.max(0, Number.isFinite(xp) ? xp : 0);

  const level = levelFromXp(safe);
  const base = (level - 1) * XP_PER_LEVEL;

  const currentLevelXp = safe - base;
  const nextLevelXp = XP_PER_LEVEL;

  const progress = Math.max(0, Math.min(1, currentLevelXp / nextLevelXp));

  return {
    level,
    nextLevel: level + 1,
    progress,
    currentLevelXp,
    nextLevelXp,
  };
}
