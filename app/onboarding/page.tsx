"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type WorkerProgress = {
  packs?: {
    general?: boolean;
    experience?: boolean;
    skills?: boolean;
  };
};

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
  profile_status: string | null;

  clean_points: number | null;
  clean_level: number | null;
  worker_progress: WorkerProgress | null;

  worker_phone: string | null;
  worker_birth_date: string | null;
  worker_birth_city: string | null;
  worker_birth_country: string | null;
  worker_gender: string | null;

  worker_res_address: string | null;
  worker_res_city: string | null;
  worker_res_province: string | null;
  worker_res_cap: string | null;

  worker_citizenship: string | null;
  worker_permit_type: string | null;
  worker_driving_license: string | null;
  worker_has_car: boolean | null;

  worker_data: any;
};

const PROFILE_SELECT = `id,email,first_name,last_name,user_type,profile_status,
clean_points,clean_level,worker_progress,
worker_phone,worker_birth_date,worker_birth_city,worker_birth_country,worker_gender,
worker_res_address,worker_res_city,worker_res_province,worker_res_cap,
worker_citizenship,worker_permit_type,worker_driving_license,worker_has_car,
worker_data` as const;

function isAdminEmail(email?: string | null) {
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes((email || "").toLowerCase());
}

/** Next 15: useSearchParams deve stare in componente dentro Suspense */
export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <OnboardingInner />
    </Suspense>
  );
}

function OnboardingInner() {
  const searchParams = useSearchParams();
  const pack = (searchParams.get("pack") || "general") as
    | "general"
    | "experience"
    | "skills";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [me, setMe] = useState<any>(null);
  const [meEmail, setMeEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  // ====== FORM STATE ======
  // general
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("Italia");
  const [gender, setGender] = useState<"" | "M" | "F">("");

  const [resAddress, setResAddress] = useState("");
  const [resCity, setResCity] = useState("");
  const [resProvince, setResProvince] = useState("");
  const [resCap, setResCap] = useState("");

  const [citizenship, setCitizenship] = useState("");
  const [permitType, setPermitType] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [hasCar, setHasCar] = useState(false);

  // worker_data
  const [lang1, setLang1] = useState("Italiano");
  const [lang2, setLang2] = useState("");

  const [expCleaning, setExpCleaning] = useState(false);
  const [workNight, setWorkNight] = useState(false);
  const [workTeam, setWorkTeam] = useState(false);
  const [workPublicPlaces, setWorkPublicPlaces] = useState(false);
  const [workClientContact, setWorkClientContact] = useState(false);

  const packs = useMemo(() => profile?.worker_progress?.packs || {}, [profile?.worker_progress]);
  const points = profile?.clean_points ?? 0;
  const level = profile?.clean_level ?? 1;

  // FIX formattazione checkbox “sparata a destra”
  const checkboxRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    marginTop: 10,
    width: "100%",
  };

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      setMe(auth.user);
      setMeEmail((auth.user.email || "").toLowerCase());

      const { data: prof, error: e } = await supabase
        .from("profiles")
        .select(PROFILE_SELECT)
        .eq("id", auth.user.id)
        .single();

      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }

      const p = prof as unknown as Profile;

      const t = (p.user_type ?? "worker") as string;
      if (t === "company") {
        window.location.href = "/company";
        return;
      }
      if (t === "client") {
        window.location.href = "/client";
        return;
      }

      setProfile(p);

      // prefill general
      setFirstName(p.first_name ?? "");
      setLastName(p.last_name ?? "");
      setPhone(p.worker_phone ?? "");
      setBirthDate(p.worker_birth_date ?? "");
      setBirthCity(p.worker_birth_city ?? "");
      setBirthCountry(p.worker_birth_country ?? "Italia");
      setGender(((p.worker_gender as any) ?? "") as "" | "M" | "F");

      setResAddress(p.worker_res_address ?? "");
      setResCity(p.worker_res_city ?? "");
      setResProvince(p.worker_res_province ?? "");
      setResCap(p.worker_res_cap ?? "");

      setCitizenship(p.worker_citizenship ?? "");
      setPermitType(p.worker_permit_type ?? "");
      setDrivingLicense(p.worker_driving_license ?? "");
      setHasCar(Boolean(p.worker_has_car ?? false));

      // prefill worker_data
      const wd = (p.worker_data ?? {}) as any;
      const langs = Array.isArray(wd.languages) ? wd.languages : [];
      if (langs[0]?.name) setLang1(langs[0].name);
      if (langs[1]?.name) setLang2(langs[1].name);

      setExpCleaning(!!wd.exp_cleaning);
      setWorkNight(!!wd.work_night);
      setWorkTeam(!!wd.work_team);
      setWorkPublicPlaces(!!wd.work_public_places);
      setWorkClientContact(!!wd.work_client_contact);

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function completePack(packKey: "general" | "experience" | "skills") {
    if (!profile) return;

    const current = profile.worker_progress || { packs: {} };
    if (current.packs?.[packKey]) return;

    const newPoints = (profile.clean_points ?? 0) + 100;
    const newLevel = Math.min(5, 1 + Math.floor(newPoints / 150));

    const newProgress: WorkerProgress = {
      ...current,
      packs: {
        ...(current.packs || {}),
        [packKey]: true,
      },
    };

    const { error: e } = await supabase
      .from("profiles")
      .update({
        clean_points: newPoints,
        clean_level: newLevel,
        worker_progress: newProgress,
      })
      .eq("id", profile.id);

    if (e) {
      setError(e.message);
      return;
    }

    setProfile({
      ...profile,
      clean_points: newPoints,
      clean_level: newLevel,
      worker_progress: newProgress,
    });
  }

  function validatePack(packKey: "general" | "experience" | "skills") {
    if (packKey === "general") {
      if (!firstName.trim()) return "Inserisci il nome.";
      if (!lastName.trim()) return "Inserisci il cognome.";
      if (!phone.trim()) return "Inserisci il telefono.";
      if (!birthDate) return "Inserisci la data di nascita.";
      if (!gender) return "Seleziona il sesso.";
      if (!resCity.trim()) return "Inserisci la città di residenza.";
      if (!resProvince.trim()) return "Inserisci la provincia di residenza.";
      if (!resCap.trim()) return "Inserisci il CAP.";
    }
    return null;
  }

  async function saveCurrentPack() {
    if (!profile) return;
    setError(null);

    const validation = validatePack(pack);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);

    const worker_data = {
      ...(profile.worker_data ?? {}),
      languages: [
        { name: (lang1 || "Italiano").trim() },
        ...(lang2.trim() ? [{ name: lang2.trim() }] : []),
      ],
      exp_cleaning: expCleaning,
      work_night: workNight,
      work_team: workTeam,
      work_public_places: workPublicPlaces,
      work_client_contact: workClientContact,
    };

    const { error: e } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),

        worker_phone: phone.trim(),
        worker_birth_date: birthDate || null,
        worker_birth_city: birthCity.trim() || null,
        worker_birth_country: birthCountry.trim() || null,
        worker_gender: gender || null,

        worker_res_address: resAddress.trim() || null,
        worker_res_city: resCity.trim() || null,
        worker_res_province: resProvince.trim() || null,
        worker_res_cap: resCap.trim() || null,

        worker_citizenship: citizenship.trim() || null,
        worker_permit_type: permitType.trim() || null,
        worker_driving_license: drivingLicense.trim() || null,
        worker_has_car: hasCar,

        worker_data,
      })
      .eq("id", profile.id);

    if (e) {
      setSaving(false);
      setError(e.message);
      return;
    }

    setProfile({
      ...profile,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      worker_phone: phone.trim(),
      worker_birth_date: birthDate || null,
      worker_birth_city: birthCity.trim() || null,
      worker_birth_country: birthCountry.trim() || null,
      worker_gender: gender || null,
      worker_res_address: resAddress.trim() || null,
      worker_res_city: resCity.trim() || null,
      worker_res_province: resProvince.trim() || null,
      worker_res_cap: resCap.trim() || null,
      worker_citizenship: citizenship.trim() || null,
      worker_permit_type: permitType.trim() || null,
      worker_driving_license: drivingLicense.trim() || null,
      worker_has_car: hasCar,
      worker_data,
    });

    await completePack(pack);

    setSaving(false);
    window.location.href = "/dashboard";
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Onboarding Operatore</h2>

      <div className="small">
        Loggato come: <b>{meEmail}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Clean Points: <b>{points}</b> — Livello: <b>{level}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Pack:{" "}
        <b>
          {pack === "general"
            ? "Dati personali"
            : pack === "experience"
            ? "Esperienza"
            : "Competenze"}
        </b>{" "}
        {packs?.[pack] ? "✅" : "❌"}
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {pack === "general" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Dati personali</b>
          </div>

          <label>Nome *</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

          <label>Cognome *</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <label>Telefono *</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label>Data di nascita *</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />

          <label>Città di nascita</label>
          <input value={birthCity} onChange={(e) => setBirthCity(e.target.value)} />

          <label>Paese di nascita</label>
          <input value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} />

          <label>Sesso *</label>
          <select value={gender} onChange={(e) => setGender(e.target.value as any)}>
            <option value="">—</option>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
          </select>

          <div style={{ marginTop: 14 }} className="small">
            <b>Residenza</b>
          </div>

          <label>Indirizzo</label>
          <input value={resAddress} onChange={(e) => setResAddress(e.target.value)} />

          <label>Città (residenza) *</label>
          <input value={resCity} onChange={(e) => setResCity(e.target.value)} />

          <label>Provincia (residenza) *</label>
          <input value={resProvince} onChange={(e) => setResProvince(e.target.value)} />

          <label>CAP (residenza) *</label>
          <input value={resCap} onChange={(e) => setResCap(e.target.value)} />

          <div style={{ marginTop: 14 }} className="small">
            <b>Documenti</b>
          </div>

          <label>Cittadinanza</label>
          <input value={citizenship} onChange={(e) => setCitizenship(e.target.value)} />

          <label>Permesso di soggiorno (tipologia)</label>
          <input value={permitType} onChange={(e) => setPermitType(e.target.value)} />

          <label>Patente</label>
          <input value={drivingLicense} onChange={(e) => setDrivingLicense(e.target.value)} />

          <div style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={hasCar}
              onChange={(e) => setHasCar(e.target.checked)}
            />
            <span>Automunito</span>
          </div>
        </>
      )}

      {pack === "experience" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Esperienza</b>
          </div>

          <div style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={expCleaning}
              onChange={(e) => setExpCleaning(e.target.checked)}
            />
            <span>Esperienza nel campo delle pulizie</span>
          </div>

          <div style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={workClientContact}
              onChange={(e) => setWorkClientContact(e.target.checked)}
            />
            <span>Lavoro a contatto con persone/clienti</span>
          </div>

          <div style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={workNight}
              onChange={(e) => setWorkNight(e.target.checked)}
            />
            <span>Lavoro notturno</span>
          </div>

          <div style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={workTeam}
              onChange={(e) => setWorkTeam(e.target.checked)}
            />
            <span>Lavoro in team</span>
          </div>

          <div style={checkboxRowStyle}>
            <input
              type="checkbox"
              checked={workPublicPlaces}
              onChange={(e) => setWorkPublicPlaces(e.target.checked)}
            />
            <span>Lavoro in luoghi pubblici</span>
          </div>
        </>
      )}

      {pack === "skills" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Competenze</b>
          </div>

          <label>Lingua 1</label>
          <input value={lang1} onChange={(e) => setLang1(e.target.value)} />

          <label style={{ marginTop: 10 }}>Lingua 2 (opzionale)</label>
          <input value={lang2} onChange={(e) => setLang2(e.target.value)} />
        </>
      )}

      <div style={{ marginTop: 14 }}>
        <button onClick={saveCurrentPack} disabled={saving}>
          {saving ? "Salvo..." : "Salva e completa pack"}
        </button>
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Profilo</a>
        {isAdminEmail(me?.email) ? <a href="/admin">Admin</a> : null}
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
