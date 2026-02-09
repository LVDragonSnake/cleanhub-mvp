"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Packs = {
  general?: boolean;
  experience?: boolean;
  skills?: boolean;
};

type WorkerProgress = {
  packs?: Packs;
};

type Profile = {
  id: string;
  email: string | null;

  first_name: string | null;
  last_name: string | null;
  user_type: string | null;

  // top-level worker fields
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

  // jsonb
  worker_data: any;

  // gamification
  clean_points: number | null;
  clean_level: number | null;
  worker_progress: WorkerProgress | null;
};

const PROFILE_SELECT = `id,email,first_name,last_name,user_type,
worker_phone,worker_birth_date,worker_birth_city,worker_birth_country,worker_gender,
worker_res_address,worker_res_city,worker_res_province,worker_res_cap,
worker_citizenship,worker_permit_type,worker_driving_license,worker_has_car,
worker_data,clean_points,clean_level,worker_progress` as const;

function computeLevel(points: number) {
  // 0-149 => lvl 1, 150-299 => lvl 2, ...
  const lvl = 1 + Math.floor(points / 150);
  return Math.min(5, Math.max(1, lvl));
}

function getPackFromUrl(): "general" | "experience" | "skills" | null {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search).get("pack");
  if (p === "general" || p === "experience" || p === "skills") return p;
  return null;
}

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meEmail, setMeEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  const [pack, setPack] = useState<"general" | "experience" | "skills" | null>(null);

  // ---------------------------
  // STATE PACK: GENERAL
  // ---------------------------
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
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

  // ---------------------------
  // STATE PACK: EXPERIENCE
  // ---------------------------
  const [expCleaning, setExpCleaning] = useState(false);
  const [workNight, setWorkNight] = useState(false);
  const [workTeam, setWorkTeam] = useState(false);
  const [workPublicPlaces, setWorkPublicPlaces] = useState(false);
  const [workClientContact, setWorkClientContact] = useState(false);

  // ---------------------------
  // STATE PACK: SKILLS
  // ---------------------------
  const [lang1, setLang1] = useState("Italiano");
  const [lang2, setLang2] = useState("");

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

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

      // se non è worker, fuori
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

      // pack da URL
      const fromUrl = getPackFromUrl();
      setPack(fromUrl);

      // prefill GENERAL
      setFirstName(p.first_name ?? "");
      setLastName(p.last_name ?? "");
      setPhone(p.worker_phone ?? "");
      setBirthDate(p.worker_birth_date ?? "");
      setBirthCity(p.worker_birth_city ?? "");
      setBirthCountry(p.worker_birth_country ?? "Italia");
      setGender((p.worker_gender === "M" || p.worker_gender === "F" ? p.worker_gender : "") as any);

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

      // prefill EXPERIENCE
      setExpCleaning(!!wd.exp_cleaning);
      setWorkNight(!!wd.work_night);
      setWorkTeam(!!wd.work_team);
      setWorkPublicPlaces(!!wd.work_public_places);
      setWorkClientContact(!!wd.work_client_contact);

      // prefill SKILLS
      const langs = Array.isArray(wd.languages) ? wd.languages : [];
      if (langs[0]?.name) setLang1(langs[0].name);
      if (langs[1]?.name) setLang2(langs[1].name);

      setLoading(false);
    })();
  }, []);

  const points = profile?.clean_points ?? 0;
  const level = profile?.clean_level ?? 1;
  const packs = profile?.worker_progress?.packs ?? {};

  const title = useMemo(() => {
    if (pack === "general") return "Dati personali";
    if (pack === "experience") return "Esperienza lavorativa";
    if (pack === "skills") return "Competenze e preferenze";
    return "Completa il profilo";
  }, [pack]);

  async function awardPack(packName: "general" | "experience" | "skills") {
    if (!profile) return;

    const current = profile.worker_progress ?? { packs: {} };
    const currentPacks = current.packs ?? {};

    if (currentPacks[packName]) return; // già fatto

    const add = 100; // punti per pacchetto
    const newPoints = (profile.clean_points ?? 0) + add;
    const newLevel = computeLevel(newPoints);

    const newProgress: WorkerProgress = {
      ...current,
      packs: { ...currentPacks, [packName]: true },
    };

    const { error: e } = await supabase
      .from("profiles")
      .update({
        clean_points: newPoints,
        clean_level: newLevel,
        worker_progress: newProgress,
      })
      .eq("id", profile.id);

    if (e) throw new Error(e.message);

    setProfile({
      ...profile,
      clean_points: newPoints,
      clean_level: newLevel,
      worker_progress: newProgress,
    });
  }

  async function savePack() {
    if (!profile || !pack) return;
    setError(null);
    setSaving(true);

    try {
      if (pack === "general") {
        // requisiti MINIMI per "general": nome + cognome
        if (!firstName.trim()) throw new Error("Inserisci il nome.");
        if (!lastName.trim()) throw new Error("Inserisci il cognome.");

        const { error: e } = await supabase
          .from("profiles")
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),

            worker_phone: phone.trim() || null,
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
          })
          .eq("id", profile.id);

        if (e) throw new Error(e.message);
        await awardPack("general");
      }

      if (pack === "experience") {
        const worker_data = {
          ...(profile.worker_data ?? {}),
          exp_cleaning: expCleaning,
          work_night: workNight,
          work_team: workTeam,
          work_public_places: workPublicPlaces,
          work_client_contact: workClientContact,
        };

        const { error: e } = await supabase
          .from("profiles")
          .update({ worker_data })
          .eq("id", profile.id);

        if (e) throw new Error(e.message);

        setProfile({ ...profile, worker_data });
        await awardPack("experience");
      }

      if (pack === "skills") {
        const worker_data = {
          ...(profile.worker_data ?? {}),
          languages: [
            { name: (lang1 || "Italiano").trim() },
            ...(lang2.trim() ? [{ name: lang2.trim() }] : []),
          ],
        };

        const { error: e } = await supabase
          .from("profiles")
          .update({ worker_data })
          .eq("id", profile.id);

        if (e) throw new Error(e.message);

        setProfile({ ...profile, worker_data });
        await awardPack("skills");
      }

      // torna alla dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "Errore salvataggio");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;

  // Se non hai scelto pack, fai scegliere
  if (!pack) {
    return (
      <div className="card">
        <h2>Dashboard Operatore</h2>

        <div className="small">Loggato come: <b>{meEmail}</b></div>
        <div className="small" style={{ marginTop: 8 }}>
          Livello: <b>{level}</b> — Clean Points: <b>{points}</b>
        </div>

        <div style={{ marginTop: 14 }} />

        <h3>Completa un pacchetto</h3>

        <button onClick={() => (window.location.href = "/onboarding?pack=general")} disabled={!!packs.general}>
          {packs.general ? "Dati personali ✅" : "Dati personali"}
        </button>

        <div style={{ marginTop: 8 }} />

        <button onClick={() => (window.location.href = "/onboarding?pack=experience")} disabled={!!packs.experience}>
          {packs.experience ? "Esperienza lavorativa ✅" : "Esperienza lavorativa"}
        </button>

        <div style={{ marginTop: 8 }} />

        <button onClick={() => (window.location.href = "/onboarding?pack=skills")} disabled={!!packs.skills}>
          {packs.skills ? "Competenze e preferenze ✅" : "Competenze e preferenze"}
        </button>

        <div className="nav" style={{ marginTop: 14 }}>
          <a href="/dashboard">Dashboard</a>
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

  return (
    <div className="card">
      <h2>{title}</h2>

      <div className="small">Loggato come: <b>{meEmail}</b></div>
      <div className="small" style={{ marginTop: 8 }}>
        Livello: <b>{level}</b> — Clean Points: <b>{points}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14 }} />

      {pack === "general" && (
        <>
          <label>Nome *</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

          <label>Cognome *</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <label>Telefono</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label>Data di nascita</label>
          <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" />

          <label>Città di nascita</label>
          <input value={birthCity} onChange={(e) => setBirthCity(e.target.value)} />

          <label>Paese di nascita</label>
          <input value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} />

          <label>Sesso</label>
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

          <label>Città</label>
          <input value={resCity} onChange={(e) => setResCity(e.target.value)} />

          <label>Provincia</label>
          <input value={resProvince} onChange={(e) => setResProvince(e.target.value)} />

          <label>CAP</label>
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

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={hasCar}
              onChange={(e) => setHasCar(e.target.checked)}
              style={{ margin: 0 }}
            />
            Automunito
          </label>
        </>
      )}

      {pack === "experience" && (
        <>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <input type="checkbox" checked={expCleaning} onChange={(e) => setExpCleaning(e.target.checked)} />
            Esperienza nel campo delle pulizie
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input type="checkbox" checked={workClientContact} onChange={(e) => setWorkClientContact(e.target.checked)} />
            Lavoro a contatto con persone/clienti
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input type="checkbox" checked={workNight} onChange={(e) => setWorkNight(e.target.checked)} />
            Lavoro notturno
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input type="checkbox" checked={workTeam} onChange={(e) => setWorkTeam(e.target.checked)} />
            Lavoro in team
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input type="checkbox" checked={workPublicPlaces} onChange={(e) => setWorkPublicPlaces(e.target.checked)} />
            Lavoro in luoghi pubblici
          </label>
        </>
      )}

      {pack === "skills" && (
        <>
          <label>Lingua 1</label>
          <input value={lang1} onChange={(e) => setLang1(e.target.value)} />

          <label style={{ marginTop: 10 }}>Lingua 2 (opzionale)</label>
          <input value={lang2} onChange={(e) => setLang2(e.target.value)} />
        </>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={() => (window.location.href = "/dashboard")} disabled={saving}>
          Indietro
        </button>
        <button onClick={savePack} disabled={saving}>
          {saving ? "Salvo..." : "Salva e completa pack"}
        </button>
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/dashboard">Dashboard</a>
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
