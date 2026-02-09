"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { progressFromXp } from "../lib/gamification";
import { LevelBar } from "./LevelBar";

type ProfileLite = {
  first_name: string | null;
  clean_points: number | null;
};

export default function WorkerHeader() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileLite | null>(null);

  const [levelUp, setLevelUp] = useState<{ from: number; to: number } | null>(null);
  const prevLevelRef = useRef<number | null>(null);

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
  const p = useMemo(() => progressFromXp(xp), [xp]);

  useEffect(() => {
    if (loading) return;

    const prev = prevLevelRef.current;
    if (prev == null) {
      prevLevelRef.current = p.level;
      return;
    }

    if (p.level > prev) {
      setLevelUp({ from: prev, to: p.level });
      prevLevelRef.current = p.level;

      const t = setTimeout(() => setLevelUp(null), 1800);
      return () => clearTimeout(t);
    }

    prevLevelRef.current = p.level;
  }, [loading, p.level]);

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
  const dots = new Array(22).fill(0);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <style>{`
        @keyframes ch_confetti_fall {
          0%   { transform: translateY(-30px) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(260px) rotate(260deg); opacity: 0; }
        }
      `}</style>

      {dots.map((_, i) => {
        const left = Math.round(Math.random() * 100);
        const delay = (Math.random() * 0.25).toFixed(2);
        const size = 6 + Math.round(Math.random() * 6);

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
