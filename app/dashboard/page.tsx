"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  first_name: string | null;
  clean_points: number;
  clean_level: number;
  worker_progress: {
    packs?: {
      general?: boolean;
      experience?: boolean;
      skills?: boolean;
    };
  };
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

      const { data } = await supabase
        .from("profiles")
        .select("id,first_name,clean_points,clean_level,worker_progress")
        .eq("id", auth.user.id)
        .single();

      if (!data) {
        window.location.href = "/login";
        return;
      }

      setProfile(data);
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
        Livello: <b>{profile.clean_level}</b>
      </p>
      <p>
        Clean Points: <b>{profile.clean_points}</b>
      </p>

      <hr />

      <h3>Completa il profilo</h3>

      <Pack
        title="Dati personali"
        done={packs.general}
      />

      <Pack
        title="Esperienza lavorativa"
        done={packs.experience}
      />

      <Pack
        title="Competenze"
        done={packs.skills}
      />
    </div>
  );
}

function Pack({
  title,
  done,
}: {
  title: string;
  done?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <b>{title}</b>{" "}
      {done ? "✅ Completato" : "❌ Da completare"}

      {!done && (
        <div>
          <button
            onClick={() => {
              window.location.href = "/onboarding";
            }}
            style={{ marginTop: 6 }}
          >
            Completa
          </button>
        </div>
      )}
    </div>
  );
}
