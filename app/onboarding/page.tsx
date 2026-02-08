"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  user_type: string | null;
  profile_status: string | null;
  onboarding_step: number | null;
  worker_data: any;
};

function isAdminEmail(email?: string | null) {
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
}

export default function WorkerOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // STEP (1..3)
  const step = useMemo(() => {
    const s = profile?.onboarding_step ?? 1;
    return Math.min(Math.max(s, 1), 3);
  }, [profile?.onboarding_step]);

  // Form state (step 1)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
  const [gender, setGender] = useState<"M" | "F" | "Altro" | "">("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("");
  const [citizenship, setCitizenship] = useState("");
  const [resAddress, setResAddress] = useState("");
  const [resCity, setResCity] = useState("");
  const [resProvince, setResProvince] = useState("");
  const [resCap, setResCap] = useState("");
  const [resCountry, setResCountry] = useState("Italia");

  // Step 2 (documenti / lingue / flags base)
  const [license, setLicense] = useState(""); // es. "B"
  const [hasCar, setHasCar] = useState(false);

  const [lang1, setLang1] = useState("Italiano");
  const [lang1Compr, setLang1Compr] = useState("Buono");
  const [lang1Speak, setLang1Speak] = useState("Buono");
  const [lang1Write, setLang1Write] = useState("Buono");

  const [lang2, setLang2] = useState("");
  const [lang2Compr, setLang2Compr] = useState("Base");
  const [lang2Speak, setLang2Speak] = useState("Base");
  const [lang2Write, setLang2Write] = useState("Base");

  const [expCleaning, setExpCleaning] = useState(false);
  const [workNight, setWorkNight] = useState(false);
  const [workTeam, setWorkTeam] = useState(false);
  const [workPublicPlaces, setWorkPublicPlaces] = useState(false);
  const [workClientContact, setWorkClientContact] = useState(false);

  useEffect(() => {
    (async () => {
      setErr(null);
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setMe(data.user);

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,user_type,profile_status,onboarding_step,worker_data")
        .eq("id", data.user.id)
        .single();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      // routing per tipo
      const t = prof?.user_type ?? "worker";
      if (t === "company") {
        window.location.href = "/company";
        return;
      }
      if (t === "client") {
        window.location.href = "/client-onboarding";
        return;
      }

      setProfile(prof as any);

      // prefill (se già salvato)
      const wd = (prof as any)?.worker_data || {};
      setFirstName((prof as any)?.first_name ?? wd.first_name ?? "");
      setLastName((prof as any)?.last_name ?? wd.last_name ?? "");
      setPhone(wd.phone ?? "");
      setBirthDate(wd.birth_date ?? "");
      setGender(wd.gender ?? "");
      setBirthCity(wd.birth_city ?? "");
      setBirthCountry(wd.birth_country ?? "");
      setCitizenship(wd.citizenship ?? "");
      setResAddress(wd.res_address ?? "");
      setResCity(wd.res_city ?? "");
      setResProvince(wd.res_province ?? "");
      setResCap(wd.res_cap ?? "");
      setResCountry(wd.res_country ?? "Italia");

      setLicense(wd.license ?? "");
      setHasCar(!!wd.has_car);

      const langs = Array.isArray(wd.languages) ? wd.languages : [];
      if (langs[0]) {
        setLang1(langs[0].name ?? "Italiano");
        setLang1Compr(langs[0].comprehension ?? "Buono");
        setLang1Speak(langs[0].spoken ?? "Buono");
        setLang1Write(langs[0].written ?? "Buono");
      }
      if (langs[1]) {
        setLang2(langs[1].name ?? "");
        setLang2Compr(langs[1].comprehension ?? "Base");
        setLang2Speak(langs[1].spoken ?? "Base");
        setLang2Write(langs[1].written ?? "Base");
      }

      setExpCleaning(!!wd.exp_cleaning);
      setWorkNight(!!wd.work_night);
      setWorkTeam(!!wd.work_team);
      setWorkPublicPlaces(!!wd.work_public_places);
      setWorkClientContact(!!wd.work_client_contact);

      setLoading(false);
    })();
  }, []);

  async function saveStep(nextStep: number) {
    if (!profile?.id) return;
    setSaving(true);
    setErr(null);

    const worker_data = {
      phone,
      birth_date: birthDate,
      gender,
      birth_city: birthCity,
      birth_country: birthCountry,
      citizenship,
      res_address: resAddress,
      res_city: resCity,
      res_province: resProvince,
      res_cap: resCap,
      res_country: resCountry,

      license,
      has_car: hasCar,

      languages: [
        {
          name: lang1.trim(),
          comprehension: lang1Compr,
          spoken: lang1Speak,
          written: lang1Write,
        },
        ...(lang2.trim()
          ? [
              {
                name: lang2.trim(),
                comprehension: lang2Compr,
                spoken: lang2Speak,
                written: lang2Write,
              },
            ]
          : []),
      ],

      exp_cleaning: expCleaning,
      work_night: workNight,
      work_team: workTeam,
      work_public_places: workPublicPlaces,
      work_client_contact: workClientContact,
    };

    const isComplete = nextStep >= 3;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        worker_data,
        onboarding_step: nextStep,
        profile_status: isComplete ? "complete" : "incomplete",
      })
      .eq("id", profile.id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    // ricarica profilo locale
    setProfile((p) =>
      p
        ? ({
            ...p,
            first_name: firstName,
            last_name: lastName,
            worker_data,
            onboarding_step: nextStep,
            profile_status: isComplete ? "complete" : "incomplete",
          } as any)
        : p
    );

    setSaving(false);

    // se ho finito: vai al profilo
    if (isComplete) window.location.href = "/profile";
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Onboarding Operatore</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Step <b>{step}</b> / 3
      </div>

      {err && (
        <div className="small" style={{ marginTop: 10 }}>
          {err}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Dati anagrafici</b>
          </div>

          <label>Nome</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

          <label>Cognome</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <label>Telefono</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label>Data di nascita</label>
          <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" />

          <label>Sesso</label>
          <select value={gender} onChange={(e) => setGender(e.target.value as any)}>
            <option value="">—</option>
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="Altro">Altro</option>
          </select>

          <label>Città di nascita</label>
          <input value={birthCity} onChange={(e) => setBirthCity(e.target.value)} />

          <label>Paese di nascita</label>
          <input value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} />

          <label>Cittadinanza</label>
          <input value={citizenship} onChange={(e) => setCitizenship(e.target.value)} />

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

          <label>Paese</label>
          <input value={resCountry} onChange={(e) => setResCountry(e.target.value)} />

          <button
            onClick={() => saveStep(2)}
            disabled={saving || !firstName.trim() || !lastName.trim()}
            style={{ marginTop: 12 }}
          >
            {saving ? "Salvo..." : "Avanti"}
          </button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Documenti e lingue</b>
          </div>

          <label>Patente (es. B)</label>
          <input value={license} onChange={(e) => setLicense(e.target.value)} />

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <input type="checkbox" checked={hasCar} onChange={(e) => setHasCar(e.target.checked)} />
            Automunito
          </label>

          <div style={{ marginTop: 14 }} className="small">
            <b>Lingue</b>
          </div>

          <label>Lingua 1</label>
          <input value={lang1} onChange={(e) => setLang1(e.target.value)} />
          <div className="small" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={lang1Compr} onChange={(e) => setLang1Compr(e.target.value)}>
              <option>Base</option><option>Nella media</option><option>Buono</option><option>Ottimo</option>
            </select>
            <select value={lang1Speak} onChange={(e) => setLang1Speak(e.target.value)}>
              <option>Base</option><option>Nella media</option><option>Buono</option><option>Ottimo</option>
            </select>
            <select value={lang1Write} onChange={(e) => setLang1Write(e.target.value)}>
              <option>Base</option><option>Nella media</option><option>Buono</option><option>Ottimo</option>
            </select>
          </div>

          <label style={{ marginTop: 10 }}>Lingua 2 (opzionale)</label>
          <input value={lang2} onChange={(e) => setLang2(e.target.value)} />
          <div className="small" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={lang2Compr} onChange={(e) => setLang2Compr(e.target.value)}>
              <option>Base</option><option>Nella media</option><option>Buono</option><option>Ottimo</option>
            </select>
            <select value={lang2Speak} onChange={(e) => setLang2Speak(e.target.value)}>
              <option>Base</option><option>Nella media</option><option>Buono</option><option>Ottimo</option>
            </select>
            <select value={lang2Write} onChange={(e) => setLang2Write(e.target.value)}>
              <option>Base</option><option>Nella media</option><option>Buono</option><option>Ottimo</option>
            </select>
          </div>

          <div style={{ marginTop: 14 }} className="small">
            <b>Esperienze / preferenze (base)</b>
          </div>

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

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => saveStep(1)} disabled={saving}>
              Indietro
            </button>
            <button onClick={() => saveStep(3)} disabled={saving}>
              {saving ? "Salvo..." : "Avanti"}
            </button>
          </div>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Step 3</b> (per ora chiudiamo l’onboarding: skill e CV li aggiungiamo dopo)
          </div>

          <div className="small" style={{ marginTop: 10 }}>
            Quando clicchi “Completa”, ti mando al profilo.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={() => saveStep(2)} disabled={saving}>
              Indietro
            </button>
            <button onClick={() => saveStep(3)} disabled={saving}>
              {saving ? "Salvo..." : "Completa"}
            </button>
          </div>
        </>
      )}

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Profilo</a>
        {isAdminEmail(me?.email) && <a href="/admin">Admin</a>}
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
