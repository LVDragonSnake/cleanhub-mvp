"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  first_name: string | null;
  clean_points: number | null;
  clean_level: number | null;
  worker_progress: {
    packs?: Record<string, boolean>;
  } | null;
};

export default function DashboardWorker() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id,first_name,clean_points,clean_level,worker_progress")
        .eq("id", auth.user.id)
        .single();

      if (error) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(data as any);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Caricamento...</div>;
  if (!profile) return <div>Errore profilo</div>;

  const packs = profile.worker_progress?.packs || {};

  return (
    <div className="card">
      <h2>Ciao {profile.first_name || "Operatore"}</h2>

      <p>
        Livello: <b>{profile.clean_level ?? 1}</b>
      </p>
      <p>
        Clean Points: <b>{profile.clean_points ?? 0}</b>
      </p>

      <hr />

      <h3>Avanzamento profilo</h3>

      <Pack
        title="Dati personali"
        done={!!packs.general}
        onClick={() => (window.location.href = "/onboarding?pack=general")}
      />

      <Pack
        title="Esperienza lavorativa"
        done={!!packs.experience}
        onClick={() => (window.location.href = "/onboarding?pack=experience")}
      />

      <Pack
        title="Competenze e preferenze"
        done={!!packs.skills}
        onClick={() => (window.location.href = "/onboarding?pack=skills")}
      />

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Profilo</a>
      </div>
    </div>
  );
}

function Pack({
  title,
  done,
  onClick,
}: {
  title: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <b>{title}</b> {done ? "✅ Completato" : "❌ Da completare"}
      <div>
        <button onClick={onClick} style={{ marginTop: 4 }}>
          {done ? "Modifica" : "Completa"}
        </button>
      </div>
    </div>
  );
}
