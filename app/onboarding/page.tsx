"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type WorkerProgress = {
  packs?: Record<string, boolean>;
};

type Profile = {
  id: string;
  email: string | null;
  user_type: string | null;

  // gamification
  clean_points: number | null;
  clean_level: number | null;
  worker_progress: WorkerProgress | null;

  // base
  first_name: string | null;
  last_name: string | null;

  // worker fields (top level)
  worker_phone: string | null;
  worker_birth_date: string | null; // yyyy-mm-dd
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
};

const PROFILE_SELECT = `id,email,user_type,
clean_points,clean_level,worker_progress,
first_name,last_name,
worker_phone,worker_birth_date,worker_birth_city,worker_birth_country,worker_gender,
worker_res_address,worker_res_city,worker_res_province,worker_res_cap,
worker_citizenship,worker_permit_type,worker_driving_license,worker_has_car,
worker_data` as const;

const PACK_POINTS = 100;
const MAX_LEVEL = 5;

/** livelli semplici: 0-149 => lv1, 150-299 => lv2, ... */
function levelFromPoints(points: number) {
  return Math.min(MAX_LEVEL, 1 + Math.floor(points / 150));
}

function packTitle(pack: string) {
  if (pack === "general") return "Dati personali";
  if (pack === "experience") return "Esperienza lavorativa";
  if (pack === "skills") return "Competenze e preferenze";
  return "Onboarding";
}

export default function OnboardingPage() {
  const search = useSearchParams();
  const pack = (search.get("pack") || "general").toLowerCase(); // general | experience | skills
  const edit = search.get("edit") === "1";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [meEmail, setMeEmail] = useState("");

  const [profile, setProfile] = useState<Profile | null>(null);

  // --------- STATE: GENERAL ---------
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

  // --------- STATE: EXPERIENCE (jsonb) ---------
  const [expCleaning, setExpCleaning] = useState(false);
  const [workNight, setWorkNight] = useState(false);
  const [workTeam, setWorkTeam] = useState(false);
  const [workPublicPlaces, setWorkPublicPlaces] = useState(false);
  const [workClientContact, setWorkClientContact] = useState(false);

  // --------- STATE: SKILLS (jsonb) ---------
  const [lang1, setLang1] = useState("Italiano");
  const [lang2, setLang2] = useState("");

  const points = profile?.clean_points ?? 0;
  const level = profile?.clean_level ?? 1;

  const packDone = useMemo(() => {
    const packs = profile?.worker_progress?.packs || {};
    return !!packs?.[pack];
  }, [profile?.worker_progress, pack]);

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

      if (e || !prof) {
        setError(e?.message || "Errore profilo");
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

      // PREFILL (sempre, così edit funziona)
      setFirstName(p.first_name ?? "");
      setLastName(p.last_name ?? "");

      setPhone(p.worker_phone ?? "");
      setBirthDate(p.worker_birth_date ?? "");
      setBirthCity(p.worker_birth_city ?? "");
      setBirthCountry(p.worker_birth_country ?? "Italia");
      setGender(((p.worker_gender ?? "") as any) === "M" ? "M" : ((p.worker_gender ?? "") as any) === "F" ? "F" : "");

      setResAddress(p.worker_res_address ?? "");
      setResCity(p.worker_res_city ?? "");
      setResProvince(p.worker_res_province ?? "");
      setResCap(p.worker_res_cap ?? "");

      setCitizenship(p.worker_citizenship ?? "");
      setPermitType(p.worker_permit_type ?? "");
      setDrivingLicense(p.worker_driving_license ?? "");
      setHasCar(Boolean(p.worker_has_car ?? false));

      const wd = (p.worker_data ?? {}) as any;
      setExpCleaning(!!wd.exp_cleaning);
      setWorkNight(!!wd.work_night);
      setWorkTeam(!!wd.work_team);
      setWorkPublicPlaces(!!wd.work_public_places);
      setWorkClientContact(!!wd.work_client_contact);

      const langs = Array.isArray(wd.languages) ? wd.languages : [];
      if (langs[0]?.name) setLang1(langs[0].name);
      if (langs[1]?.name) setLang2(langs[1].name);

      setLoading(false);
    })();
  }, []);

  async function awardPackIfFirstTime(packName: string) {
    if (!profile) return;

    const progress = (profile.worker_progress ?? { packs: {} }) as WorkerProgress;
    const already = !!progress.packs?.[packName];
    if (already) return; // NO punti doppioni

    const newPoints = (profile.clean_points ?? 0) + PACK_POINTS;
    const newLevel = levelFromPoints(newPoints);

    const newProgress: WorkerProgress = {
      ...progress,
      packs: {
        ...(progress.packs ?? {}),
        [packName]: true,
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
      throw new Error(e.message);
    }

    setProfile({
      ...profile,
      clean_points: newPoints,
      clean_level: newLevel,
      worker_progress: newProgress,
    });
  }

  async function savePack() {
    if (!profile) return;
    setError(null);
    setSaving(true);

    try {
      // 1) VALIDAZIONE MINIMA PER PACCHETTO
      if (pack === "general") {
        if (!firstName.trim()) throw new Error("Inserisci il nome.");
        if (!lastName.trim()) throw new Error("Inserisci il cognome.");
        // per accesso piattaforma bastano nome+cognome+email: quindi NON blocchiamo su tutti i campi.
        // però se l'utente li compila, li salviamo.
      }

      // 2) BUILD PAYLOAD
      const wdPrev = (profile.worker_data ?? {}) as any;

      const wdNext =
        pack === "experience"
          ? {
              ...wdPrev,
              exp_cleaning: expCleaning,
              work_night: workNight,
              work_team: workTeam,
              work_public_places: workPublicPlaces,
              work_client_contact: workClientContact,
            }
          : pack === "skills"
          ? {
              ...wdPrev,
              languages: [
                { name: (lang1 || "Italiano").trim() },
                ...(lang2.trim() ? [{ name: lang2.trim() }] : []),
              ],
            }
          : wdPrev;

      const updatePayload: any =
        pack === "general"
          ? {
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
            }
          : {
              worker_data: wdNext,
            };

      if (pack !== "general") updatePayload.worker_data = wdNext;

      const { error: e } = await supabase.from("profiles").update(updatePayload).eq("id", profile.id);
      if (e) throw new Error(e.message);

      // 3) AGGIORNA STATE LOCALE
      const newProfile: Profile = {
        ...profile,
        ...updatePayload,
        worker_data: wdNext,
      };
      setProfile(newProfile);

      // 4) PUNTI + FLAG PACCHETTO
      await awardPackIfFirstTime(pack);

      // 5) TORNA ALLA DASH
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "Errore salvataggio");
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;
  if (!profile) return <div>Errore profilo</div>;

  return (
    <div className="card">
      <h2>Onboarding Operatore — {packTitle(pack)}</h2>

      <div className="small">
        Loggato come: <b>{meEmail}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Clean Points: <b>{points}</b> — Livello: <b>{level}</b>
      </div>

      {packDone && !edit && (
        <div className="small" style={{ marginTop: 10 }}>
          ✅ Questo pacchetto risulta già completato. (Se vuoi modificarlo: apri da Profilo → Modifica onboarding)
        </div>
      )}

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {/* -------------------- GENERAL -------------------- */}
      {pack === "general" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Dati base</b>
          </div>

          <label>Nome *</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

          <label>Cognome *</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <label>Sesso</label>
          <select value={gender} onChange={(e) => setGender(e.target.value as any)}>
            <option value="">—</option>
            <option value="F">F</option>
            <option value="M">M</option>
          </select>

          <div style={{ marginTop: 14 }} className="small">
            <b>Contatti</b>
          </div>

          <label>Telefono</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <div style={{ marginTop: 14 }} className="small">
            <b>Nascita</b>
          </div>

          <label>Data di nascita</label>
          <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" />

          <label>Città di nascita</label>
          <input value={birthCity} onChange={(e) => setBirthCity(e.target.value)} />

          <label>Paese di nascita</label>
          <input value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} />

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

      {/* -------------------- EXPERIENCE -------------------- */}
      {pack === "experience" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Esperienza e preferenze</b>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <input
              type="checkbox"
              checked={expCleaning}
              onChange={(e) => setExpCleaning(e.target.checked)}
            />
            Esperienza nel campo delle pulizie
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input
              type="checkbox"
              checked={workClientContact}
              onChange={(e) => setWorkClientContact(e.target.checked)}
            />
            Lavoro a contatto con persone/clienti
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input
              type="checkbox"
              checked={workNight}
              onChange={(e) => setWorkNight(e.target.checked)}
            />
            Lavoro notturno
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input
              type="checkbox"
              checked={workTeam}
              onChange={(e) => setWorkTeam(e.target.checked)}
            />
            Lavoro in team
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input
              type="checkbox"
              checked={workPublicPlaces}
              onChange={(e) => setWorkPublicPlaces(e.target.checked)}
            />
            Lavoro in luoghi pubblici
          </label>
        </>
      )}

      {/* -------------------- SKILLS -------------------- */}
      {pack === "skills" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Lingue</b>
          </div>

          <label>Lingua 1</label>
          <input value={lang1} onChange={(e) => setLang1(e.target.value)} />

          <label style={{ marginTop: 10 }}>Lingua 2 (opzionale)</label>
          <input value={lang2} onChange={(e) => setLang2(e.target.value)} />
        </>
      )}

      <div style={{ marginTop: 14 }}>
        <button onClick={savePack} disabled={saving}>
          {saving ? "Salvo..." : packDone && !edit ? "Vai in dashboard" : "Salva e completa pacchetto"}
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
