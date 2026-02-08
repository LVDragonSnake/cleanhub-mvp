"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null; // "worker" | "company"
  profile_status: string | null;
  onboarding_step: number | null;
  created_at?: string | null;
};

export default function CompanyPage() {
  const [loading, setLoading] = useState(true);
  const [meEmail, setMeEmail] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const email = (data.user.email || "").toLowerCase();
      setMeEmail(email);

      const { data: prof, error: e } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,user_type,profile_status,onboarding_step,created_at")
        .eq("id", data.user.id)
        .single();

      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }

      // Protezione: se non è company, fuori
      if ((prof?.user_type ?? "worker") !== "company") {
        window.location.href = "/profile";
        return;
      }

      setProfile(prof as Profile);
      setLoading(false);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Area Azienda</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 10 }}>
        Loggato come: <b>{meEmail}</b>
      </div>

      <div className="small" style={{ marginTop: 12 }}>
        <div>
          Tipo: <b>{profile?.user_type ?? "—"}</b>
        </div>
        <div>
          Stato profilo: <b>{profile?.profile_status ?? "—"}</b> (step{" "}
          {profile?.onboarding_step ?? "—"})
        </div>
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Profilo</a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
        >
          Logout
        </a>
      </div>
    </div>
  );
}
