"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { progressFromXp } from "../lib/gamification";

type ProfileLite = {
  first_name: string | null;
  user_type: string | null;
  clean_points: number | null;
};

export default function WorkerHeader() {
  const [loading, setLoading] = useState(true);
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!auth.user) {
        setLoading(false);
        return;
      }

      setMeEmail(auth.user.email ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name,user_type,clean_points")
        .eq("id", auth.user.id)
        .single();

      if (!mounted) return;

      if (!error) setProfile(data as any);
      setLoading(false);
    })();

    // (facoltativo) ascolta cambi sessione
    const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
      // refresh veloce (senza seghe)
      window.location.reload();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // se non loggato, niente header
  if (loading) return null;
  if (!meEmail) return null;

  // se non worker, header minimal (o niente)
  const isWorker = (profile?.user_type ?? "worker") === "worker";
  if (!isWorker) return null;

  const xp = profile?.clean_points ?? 0;
  const { level, ratio } = progressFromXp(xp);
  const pct = Math.round(ratio * 100);

  return (
    <div className="workerHeader">
      <div className="workerHeader__left">
        <b>{profile?.first_name ? `Ciao ${profile.first_name}` : "Ciao Operatore"}</b>
        <span className="workerHeader__email">{meEmail}</span>
      </div>

      <div className="workerHeader__right">
        <div className="workerHeader__level">
          Livello <b>{level}</b>
        </div>

        <div className="workerHeader__bar" aria-label="Progresso livello">
          <div className="workerHeader__barFill" style={{ width: `${pct}%` }} />
        </div>

        <div className="workerHeader__nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/profile">Profilo</a>
          <a
            href="#"
            onClick={async (e) => {
              e.preventDefault();
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  );
}
