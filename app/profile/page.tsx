"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [cvLink, setCvLink] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!prof) {
        window.location.href = "/onboarding";
        return;
      }

      if (prof.profile_status !== "complete") {
        window.location.href = "/onboarding";
        return;
      }

      setProfile(prof);
      setLoading(false);
    })();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function generateCvLink() {
    setMsg(null);
    setCvLink(null);

    if (!profile?.cv_url) {
      setMsg("Nessun CV caricato.");
      return;
    }

    const { data, error } = await supabase.storage
      .from("cvs")
      .createSignedUrl(profile.cv_url, 60 * 5); // 5 minuti

    if (error) {
      setMsg(error.message);
      return;
    }

    setCvLink(data.signedUrl);
    setMsg("Link CV pronto ✅ (valido 5 minuti)");
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Profilo</h2>

      <div className="small">Email: {profile.email}</div>
      <div className="small">
        Nome: {profile.first_name} {profile.last_name}
      </div>
      <div className="small">Ruolo: {profile.desired_role}</div>
      <div className="small">CV: {profile.cv_url ? "Caricato ✅" : "Non caricato"}</div>

      {profile.cv_url && (
        <>
          <button onClick={generateCvLink}>Genera link CV</button>
          {cvLink && (
            <div className="small">
              <a href={cvLink} target="_blank" rel="noreferrer">
                Scarica / Apri CV
              </a>
            </div>
          )}
        </>
      )}

      {msg && <div className="small">{msg}</div>}

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/onboarding">Modifica onboarding</a>
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
