"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  desired_role: string | null;
  onboarding_step: number | null;
  profile_status: string | null;
  cv_url: string | null;
};

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [desiredRole, setDesiredRole] = useState("");

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const step = useMemo(() => profile?.onboarding_step ?? 1, [profile]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setUserId(data.user.id);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (prof) {
  // ✅ Se il profilo è già completo, l’onboarding non deve comparire
  if (prof.profile_status === "complete") {
    window.location.href = "/profile";
    return;
  }

  setProfile(prof as Profile);
  setFirstName(prof.first_name ?? "");
  setLastName(prof.last_name ?? "");
  setDesiredRole(prof.desired_role ?? "");
}

setLoading(false);

    })();
  }, []);

  async function saveStep1() {
    if (!userId) return;
    setMessage(null);

    const { error, data } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        desired_role: desiredRole.trim(),
        onboarding_step: 2,
        profile_status: "incomplete"
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) return setMessage(error.message);

    setProfile(data as Profile);
    setMessage("Step 1 salvato ✅");
  }

  async function uploadCvAndFinish() {
    if (!userId) return;
    setMessage(null);

    if (!cvFile) {
      const { error, data } = await supabase
        .from("profiles")
        .update({ onboarding_step: 3, profile_status: "complete" })
        .eq("id", userId)
        .select("*")
        .single();

      if (error) return setMessage(error.message);
      setProfile(data as Profile);
      window.location.href = "/profile";
      return;
    }

    const ext = cvFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") return setMessage("Carica un PDF, per favore.");

    const filePath = `${userId}/${Date.now()}_${cvFile.name}`;

    const up = await supabase.storage.from("cvs").upload(filePath, cvFile, {
      upsert: false,
      contentType: "application/pdf"
    });

    if (up.error) return setMessage(up.error.message);

    const { error, data } = await supabase
      .from("profiles")
      .update({
        cv_url: filePath,
        onboarding_step: 3,
        profile_status: "complete"
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) return setMessage(error.message);

    setProfile(data as Profile);
    window.location.href = "/profile";
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Onboarding</h2>
      <div className="small">Step {step}/3</div>

      {step === 1 && (
        <>
          <label>Nome</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

          <label>Cognome</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <label>Ruolo desiderato</label>
          <input
            value={desiredRole}
            onChange={(e) => setDesiredRole(e.target.value)}
            placeholder="Es. Addetto alle pulizie, Housekeeping..."
          />

          <button onClick={saveStep1}>Salva e continua</button>
        </>
      )}

      {step >= 2 && (
        <>
          <label>CV (PDF) — opzionale in Fase 1</label>
          <input type="file" accept="application/pdf" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />

          <button onClick={uploadCvAndFinish}>
            {cvFile ? "Carica CV e completa" : "Salta e completa"}
          </button>
        </>
      )}

      {message && <div className="small">{message}</div>}

      <div className="small" style={{ marginTop: 14 }}>
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
