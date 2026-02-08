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
  cv_url: string | null;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [cvLink, setCvLink] = useState<string | null>(null);
  const [cvMsg, setCvMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }
      setMe(auth.user);

      const { data: prof, error: e } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,user_type,profile_status,onboarding_step,cv_url")
        .eq("id", auth.user.id)
        .single();

      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }

      // ✅ Se è azienda, /profile non deve mostrare la UI worker
      if ((prof?.user_type ?? "worker") === "company") {
        window.location.href = "/company";
        return;
      }

      // ✅ Se worker ma non ha completato onboarding, manda lì (se lo usi ancora)
      if ((prof?.profile_status ?? "incomplete") !== "complete") {
        window.location.href = "/onboarding";
        return;
      }

      setProfile(prof as Profile);
      setLoading(false);
    })();
  }, []);

  async function generateCvLink() {
    setCvMsg(null);
    setCvLink(null);

    if (!profile?.cv_url) {
      setCvMsg("Nessun CV caricato.");
      return;
    }

    const { data, error } = await supabase.storage
      .from("cvs")
      .createSignedUrl(profile.cv_url, 60 * 5);

    if (error) {
      setCvMsg(error.message);
      return;
    }

    setCvLink(data?.signedUrl ?? null);
    setCvMsg("Link CV pronto ✅ (valido 5 minuti)");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Profilo</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 10 }}>
        Email: {me?.email ?? "—"}
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        Nome: {`${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "—"}
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        CV: {profile?.cv_url ? "Caricato ✅" : "Non caricato"}
      </div>

      <div style={{ marginTop: 14 }} />

      <button onClick={generateCvLink}>Genera link CV</button>

      {cvLink && (
        <div className="small" style={{ marginTop: 10 }}>
          <a href={cvLink} target="_blank" rel="noreferrer">
            Scarica / Apri CV
          </a>
        </div>
      )}

      {cvMsg && <div className="small" style={{ marginTop: 10 }}>{cvMsg}</div>}

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/onboarding?edit=1">Modifica onboarding</a>
        <a href="/admin">Admin</a>
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
