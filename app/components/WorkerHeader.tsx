"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { progressFromXp } from "../lib/gamification";
import { LevelBar } from "./LevelBar";

type ProfileLite = {
  first_name: string | null;
  clean_points: number | null;
};

const LS_LAST_LEVEL = "cleanhub_last_level";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // se localStorage è bloccato (Safari Private ecc), ignoriamo
  }
}

export default function WorkerHeader() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [levelUp, setLevelUp] = useState<{ from: number; to: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("first_name,clean_points")
        .eq("id", auth.user.id)
        .single();

      setProfile((data as any) ?? null);
      setLoading(false);
    })();
  }, []);

  const xp = profile?.clean_points ?? 0;

  // ⚠️ super-safe: se progressFromXp dovesse mai lanciare, non rompiamo l’app
  const p = useMemo(() => {
    try {
      return progressFromXp(xp);
    } catch {
      return { level: 1, nextLevel: 2, progress: 0 };
    }
  }, [xp]);

  useEffect(() => {
    if (loading) return;
    if (!profile) return;

    const currentLevel = p.level;

    let prevLevel: number | null = null;
    const raw = typeof window !== "undefined" ? safeGet(LS_LAST_LEVEL) : null;
    if (raw) {
      const n = Number(raw);
      prevLevel = Number.isFinite(n) ? n : null;
    }

    if (prevLevel == null) {
      safeSet(LS_LAST_LEVEL, String(currentLevel));
      return;
    }

    if (currentLevel > prevLevel) {
      setLevelUp({ from: prevLevel, to: currentLevel });
      safeSet(LS_LAST_LEVEL, String(currentLevel));

      const t = setTimeout(() => setLevelUp(null), 1800);
      return () => clearTimeout(t);
    }

    safeSet(LS_LAST_LEVEL, String(currentLevel));
  }, [loading, profile, p.level]);

  if (loading) return null;
  if (!profile) return null;

  return (
    <div style={{ padding: "10px 16px" }}>
      <LevelBar level={p.level} nextLevel={p.nextLevel} progress={p.progress} />

      {levelUp && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.25)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: 360,
              maxWidth: "92vw",
              background: "white",
              borderRadius: 16,
              padding: 18,
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Confetti />

            <div style={{ fontSize: 14, opacity: 0.8 }}>Complimenti!</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
              Livello {levelUp.to} 🎉
            </div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
              Da {levelUp.from} → {levelUp.to}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Confetti() {
  const dots = new Array(28).fill(0);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <style>{`
        @keyframes ch_confetti_fall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(320px) rotate(320deg); opacity: 0; }
        }
      `}</style>

      {dots.map((_, i) => {
        const left = Math.round(Math.random() * 100);
        const delay = (Math.random() * 0.25).toFixed(2);
        const size = 6 + Math.round(Math.random() * 7);

        return (
          <span
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: `${left}%`,
              width: size,
              height: size,
              borderRadius: 999,
              background: i % 2 === 0 ? "#2563eb" : "#22c55e",
              animation: `ch_confetti_fall 1.2s ease-in ${delay}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}
