"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { LevelBar } from "./LevelBar";
import { progressFromXp } from "../lib/gamification";

type HeaderProfile = {
  id: string;
  user_type: string | null;
  first_name: string | null;
  clean_points: number | null;
  clean_level: number | null;
};

export default function AppHeader() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: auth, error: authErr } = await supabase.auth.getUser();

        if (authErr || !auth?.user) {
          setAuthed(false);
          setProfile(null);
          setCredits(null);
          setLoading(false);
          return;
        }

        setAuthed(true);

        const { data: prof, error: pErr } = await supabase
          .from("profiles")
          .select("id,user_type,first_name,clean_points,clean_level")
          .eq("id", auth.user.id)
          .single();

        if (pErr || !prof) {
          // IMPORTANTISSIMO: mai crashare se RLS blocca o torna null
          setProfile(null);
          setCredits(null);
          setLoading(false);
          return;
        }

        setProfile(prof as HeaderProfile);

        // Se è company, prova a leggere i crediti (ma in modo safe)
        if ((prof as any)?.user_type === "company") {
          try {
            const res = await fetch("/api/company/credits", { cache: "no-store" });
            let json: any = {};
            try {
              json = await res.json();
            } catch {
              json = {};
            }
            const c = Number(json?.credits);
            setCredits(Number.isFinite(c) ? c : 0);
          } catch {
            setCredits(0);
          }
        } else {
          setCredits(null);
        }

        setLoading(false);
      } catch {
        // fail-safe totale
        setAuthed(false);
        setProfile(null);
        setCredits(null);
        setLoading(false);
      }
    })();
  }, []);

  const xp = profile?.clean_points ?? 0;
  const p = useMemo(() => progressFromXp(xp), [xp]);

  if (loading) return null;

  // Header minimale anche se non loggato o profilo non leggibile
  if (!authed) {
    return (
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee" }}>
        <div style={{ fontWeight: 800 }}>Cleanhub</div>
      </div>
    );
  }

  const userType = profile?.user_type ?? "worker";

  return (
    <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 800 }}>Cleanhub</div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {userType === "company" ? (
            <div className="small">
              Crediti: <b>{credits ?? 0}</b>
            </div>
          ) : (
            <div className="small">
              Ciao <b>{profile?.first_name ?? "Operatore"}</b>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Level bar SOLO per worker */}
      {userType !== "company" && userType !== "client" && (
        <div style={{ marginTop: 10 }}>
          <LevelBar level={p.level} nextLevel={p.nextLevel} progress={p.progress} />
        </div>
      )}
    </div>
  );
}
