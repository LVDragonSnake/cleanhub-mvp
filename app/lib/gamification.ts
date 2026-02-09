// app/lib/gamification.ts

/**
 * Gamification (Clean Points -> Livelli)
 * Regole semplici e stabili:
 * - Livello minimo: 1
 * - Ogni livello richiede più XP del precedente (curva leggera)
 */

export function xpForLevel(level: number): number {
  // livello 1 parte da 0 xp
  if (level <= 1) return 0;

  // curva: 150, 350, 600, 900, 1250, 1650, 2100, ...
  // puoi ritoccarla quando vuoi senza rompere i dati
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += 100 + l * 50; // cresce di 50 ogni livello
  }
  return total;
}

export function levelFromXp(xp: number): number {
  const safeXp = Math.max(0, xp || 0);
  let level = 1;

  // trova il massimo livello raggiunto
  while (xpForLevel(level + 1) <= safeXp) {
    level++;
    if (level > 1000) break; // safety
  }
  return level;
}

/**
 * Ritorna percentuale (0..100) di avanzamento verso il livello successivo
 */
export function progressFromXp(xp: number): number {
  const safeXp = Math.max(0, xp || 0);
  const level = levelFromXp(safeXp);

  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);

  const span = Math.max(1, next - cur);
  const into = Math.min(span, Math.max(0, safeXp - cur));

  return Math.round((into / span) * 100);
}
