"use client";

export function LevelBar({
  level,
  progress,
}: {
  level: number;
  progress: number; // 0 → 1
}) {
  return (
    <div style={{ maxWidth: 220 }}>
      <div style={{ fontSize: 12, marginBottom: 4 }}>
        Livello <b>{level}</b> → <b>{level + 1}</b>
      </div>

      <div
        style={{
          height: 8,
          background: "#e5e7eb",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(progress * 100, 100)}%`,
            height: "100%",
            background: "#2563eb",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
