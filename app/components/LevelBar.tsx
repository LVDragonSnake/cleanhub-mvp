"use client";

import React from "react";

export function LevelBar({
  level,
  nextLevel,
  progress,
}: {
  level: number;
  nextLevel: number;
  progress: number; // 0..1
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700 }}>Livello {level}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Prossimo: {nextLevel}</div>
      </div>

      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "#2563eb",
            borderRadius: 999,
            transition: "width 700ms ease",
          }}
        />
      </div>
    </div>
  );
}
