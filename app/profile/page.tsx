"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
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

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Profilo</h2>

      <div className="small">Email: {profile.email}</div>
      <div className="small">Nome: {profile.first_name} {profile.last_name}</div>
      <div className="small">Ruolo: {profile.desired_role}</div>
      <div className="small">CV: {profile.cv_url ? "Caricato ✅" : "Non caricato"}</div>

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
