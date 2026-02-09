"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { levelFromXp, progressFromXp } from "../lib/gamification";

type ProfileLite = {
  id: string;
  clean_points: number | null;
  clean_level: number | null;
};

export default function WorkerHeader() {
  const [p, setP] = useState<ProfileLite | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id,clean_points,clean_level")
        .eq("id", auth.user.id)
        .single();

      if (error) return;
      setP(data as any);
    })();
  }, []);

  if (!p) return null;

  const xp = p.clean_points ?? 0;
  const lvl = p.clean_level ?? levelFromXp(xp);
  const pct = progressFromXp(xp);

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Livello {lvl}</div>

        <div style={{ flex: 1 }}>
          <div style={{ height: 10, background: "#eaeef6", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "#2F6BFF" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
