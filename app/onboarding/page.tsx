"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  onboarding_step: number | null;
  profile_status: string | null;
  cv_url: string | null;
};

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const step = useMemo(() => profile?.onboarding_step ?? 1, [profile]);

  useEffect(() => {
    (async () => {
      // ✅ edit=1 letto in modo “a prova di Next”
      const params = new URLSearchParams(window.location.search);
      const isEdit = params.get("edit") === "1";
      setEditMode(isEdit);

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
        // ✅ Se profilo completo e NON in edit mode: fuori da onboarding
        if (prof.profile_status === "complete" && !isEdit) {
          window.location.href = "/profile";
          return;
        }

        setProfile(prof as Profile);
        setFirstName(prof.first_name ?? "");
        setLastName(prof.last_name ?? "");
      }

      setLoading(false);
    })();
  }, []);

  async function saveBaseData(nextStep?: number) {
    if (!userId) return;
    setMessage(null);

    const payload: any = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    };

    // se onboarding normale, avanza step
    if (!editMode && nextStep) {
      payload.onboarding_step = nextStep;
      payload.profile_status = "incomplete";
    }

    const { error, data } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) return setMessage(error.message);

    setProfile(data as Profile);
    setMessage(editMode ? "Dati aggiornati ✅" : "Step 1 salvato ✅");
  }

  async function finishWithoutCv() {
    if (!userId) return;
    setMessage(null);

    const { error, data } = await supabase
      .from("profiles")
      .update({ onboarding_step: 3, profile_status: "complete" })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) return setMessage(error.message);

    setProfile(data as Profile);
    window.location.href = "/profile";
  }

  async function uploadCv() {
    if (!userId) return;
    setMessage(null);

    if (!cvFile) {
      setMessage("Seleziona un PDF prima di caricare.");
      return;
    }

    const ext = cvFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") return setMessage("Carica un PDF, per favore.");

    const filePath = `${userId}/${Date.now()}_${cvFile.name}`;

    const up = await supabase.storage.from("cvs").upload(filePath, cvFile, {
      upsert: false,
      contentType: "application/pdf",
    });

    if (up.error) return setMessage(up.error.message);

    // edit mode: aggiorna solo cv_url
    if (editMode) {
      const { error, data } = await supabase
        .from("profiles")
        .update({ cv_url: filePath })
        .eq("id", userId)
        .select("*")
        .single();

      if (error) return setMessage(error.message);

      setProfile(data as Profile);
      setCvFile(null);
      setMessage("CV aggiornato ✅");
      return;
    }

    // onboarding normale: completa
    const { error, data } = await supabase
      .from("profiles")
      .update({
        cv_url: filePath,
        onboarding_step: 3,
        profile_status: "complete",
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

  // ✅ EDIT MODE
  if (editMode) {
    return (
      <div className="card">
        <h2>Modifica profilo</h2>
        <div className="small">Aggiorna i dati e/o sostituisci il CV.</div>

        <label>Nome</label>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

        <label>Cognome</label>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

        <button onClick={() => saveBaseData()}>Salva dati</button>

        <div style={{ marginTop: 14 }} />

        <label>CV (PDF) — sostituisci</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
        />

        <button onClick={uploadCv}>Carica nuovo CV</button>

        {message && <div className="small">{message}</div>}

        <div className="nav" style={{ marginTop: 14 }}>
          <a href="/profile">Torna al profilo</a>
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

  // ✅ ONBOARDING MODE
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

          <button onClick={() => saveBaseData(2)}>Salva e continua</button>
        </>
      )}

      {step >= 2 && (
        <>
          <label>CV (PDF) — opzionale in Fase 1</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
          />

          <button onClick={uploadCv}>Carica CV e completa</button>
          <button onClick={finishWithoutCv}>Salta e completa</button>
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
