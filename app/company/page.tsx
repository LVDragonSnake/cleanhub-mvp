"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
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
      if (prof?.user_type !== "company") {
        // worker -> profile, admin -> admin (se lo usi), altrimenti home
        if (prof?.user_type === "worker") window.location.href = "/profile";
        else window.location.href = "/";
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
      <h2>Azienda</h2>

      <div className="small" style={{ marginTop: 8 }}>
        Loggato come: <b>{meEmail}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14 }} />

      <div className="small">
        <div>
          Profilo: <b>company</b>
        </div>
        <div>
          Stato: <b>{profile?.profile_status ?? "—"}</b>
