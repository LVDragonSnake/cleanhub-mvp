"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type WorkerProgress = {
  packs?: Record<string, boolean>;
} | null;

type Profile = {
  id: string;
  user_type: string | null;
  first_name: string | null;
  clean_points: number | null;
  clean_level: number | null;
  worker_progress: WorkerProgress;
};

const PACKS: Array<{ key: string; title: string }> = [
  { key: "general", title: "Dati personali" },
  { key: "documents", title: "Documenti" },
  { key: "languages", title: "Lingue" },
  { key: "experience", title: "Esperienza lavorativa" },
  { key: "training", title: "Formazione" },
  { key: "availability", title: "Disponibilità e richieste" },
  { key: "extra", title: "Altre informazioni" },
];

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

      const { data } = await supabase
        .from("profiles")
        .select("id,user_type,first_name,clean_points,clean_level,worker_progress")
        .eq("id", auth.user.id)
        .single();

      const p = (data as Profile) ?? null;

      // ✅ se sei company, NON devi vedere dashboard worker
      if ((p?.user_type ?? "") === "company") {
        window.location.href = "/company";
        return;
      }
      if ((p?.user_type ?? "") === "client") {
        window.location.href = "/client";
        return;
      }

      setProfile(p);
      setLoading(false);
    })();
  }, []);

  const packs = useMemo(() => profile?.worker_progress?.packs || {}, [profile?.worker_progress]);

  if (loading) return <div>Caricamento...</div>;
  if (!profile) return <div>Errore profilo</div>;

  return (
    <div className="card">
      <h2>Ciao {profile.first_name || "Operatore"}</h2>

      <p style={{ marginTop: 6 }}>
        Livello: <b>{profile.clean_level ?? 1}</b>
      </p>

      <hr />

      <h3>Avanzamento profilo</h3>

      {PACKS.map((p) => {
        const done = !!packs[p.key];
        return (
          <Pack
            key={p.key}
            title={p.title}
            done={done}
            onClick={() => (window.location.href = `/onboarding?pack=${encodeURIComponent(p.key)}`)}
          />
        );
      })}
    </div>
  );
}

function Pack({
  title,
  done,
  onClick,
}: {
  title: string;
  done?: boolean;
  onClick: () => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <b>{title}</b>
        {done ? <span>✅ Completato</span> : <span>❌ Da completare</span>}
      </div>

      <div>
        <button onClick={onClick} style={{ marginTop: 6 }}>
          {done ? "Modifica" : "Completa"}
        </button>
      </div>
    </div>
  );
}
