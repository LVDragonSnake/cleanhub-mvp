// app/components/WorkerHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { progressFromXp } from "../lib/gamification";

type ProfileLite = {
  first_name: string | null;
  user_type: string | null;
  clean_points: number | null;
};

export default function WorkerHeader() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileLite | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("first_name,user_type,clean_points")
        .eq("id", auth.user.id)
        .single();

      setProfile((data as ProfileLite) ?? null);
      setLoading(false);
    })();
  }, []);

  // niente header se non loggato
  if (loading) return null;
  if (!profile) return null;

  // lo mostriamo SOLO per worker (se vuoi anche per altri, togli questa riga)
  if ((profile.user_type ?? "worker") !== "worker") return null;

  const xp = profile.clean_points ?? 0;
  const p = progressFromXp(xp);

  return (
    <div
      style={{
        width: "100%",
        padding: "10px 12px",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* WRAPPER corto */}
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          Livello {p.level}
        </div>

        {/* barra */}
        <div
          style={{
            width: "100%",
            height: 10,
            borderRadius: 999,
            background: "rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.round(p.progress01 * 100)}%`,
              height: "100%",
              background: "#1d4ed8", // BLU
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </div>
  );
}
