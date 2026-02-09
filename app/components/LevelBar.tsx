"use client";

import React, { useEffect, useMemo, useState } from "react";

export function LevelBar({
  level,
  nextLevel,
  progress, // 0..1
}: {
  level: number;
  nextLevel: number;
  progress: number;
}) {
  // per animare la barra al mount/aggiornamento
  const pct = useMemo(() => Math.round(Math.max(0, Math.min(1, progress)) * 100), [progress]);
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    // micro-delay per far partire la transition
    const t = setTimeout(() => setAnimatedPct(pct), 50);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: 520, maxWidth: "92vw" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            opacity: 0.9,
            marginBottom: 6,
          }}
        >
          <span>Livello {level}</span>
          <span>Livello {nextLevel}</span>
        </div>

        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${animatedPct}%`,
              background: "#2563eb", // BLU
              borderRadius: 999,
              transition: "width 600ms ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
