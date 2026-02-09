// app/lib/gamification.ts

// Soglie XP per livello (livello 1 = 0 XP)
// Cambiale quando vuoi, ma NON cambiare la logica.
export const XP_LEVELS = [0, 150, 300, 450, 600, 900, 1200, 1500, 1900, 2300, 2800] as const;

export function levelFromXp(xp: number) {
  const val = Math.max(0, Math.floor(xp || 0));
  let lvl = 1;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (val >= XP_LEVELS[i]) lvl = i + 1;
  }
  return lvl;
}

export function progressFromXp(xp: number) {
  const val = Math.max(0, Math.floor(xp || 0));
  const lvl = levelFromXp(val);

  const idx = Math.max(0, lvl - 1);
  const cur = XP_LEVELS[idx] ?? 0;
  const next = XP_LEVELS[idx + 1] ?? (cur + 500); // fallback se superi array
  const pct = next === cur ? 1 : Math.min(1, Math.max(0, (val - cur) / (next - cur)));

  return {
    level: lvl,
    currentLevelXp: cur,
    nextLevelXp: next,
    progress01: pct, // 0..1
  };
}
