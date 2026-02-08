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

  worker_data: any;
};

function isAdminEmail(email?: string | null) {
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes((email || "").toLowerCase());
}

/**
 * IMPORTANTE:
 * Deve essere UNA stringa literal (non concatenazioni con +),
 * così Supabase/TS non ti tipizza `data` come GenericStringError.
 */
const PROFILE_SELECT = `id,email,first_name,last_name,user_type,profile_status,onboarding_step,
worker_phone,worker_birth_date,worker_birth_city,worker_birth_country,worker_gender,
worker_res_address,worker_res_city,worker_res_province,worker_res_cap,
worker_citizenship,worker_permit_type,worker_driving_license,worker_has_car,
worker_data` as const;

export default function OnboardingWorkerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [me, setMe] = useState<any>(null);
  const [meEmail, setMeEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  const step = useMemo(() => {
    const s = profile?.onboarding_step ?? 1;
    return Math.min(Math.max(s, 1), 3);
  }, [profile?.onboarding_step]);

  // STEP 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("Italia");
  const [gender, setGender] = useState("");

  const [resAddress, setResAddress] = useState("");
  const [resCity, setResCity] = useState("");
  const [resProvince, setResProvince] = useState("");
  const [resCap, setResCap] = useState("");

  const [citizenship, setCitizenship] = useState("");
  const [permitType, setPermitType] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [hasCar, setHasCar] = useState(false);

  // STEP 2 (in worker_data)
  const [lang1, setLang1] = useState("Italiano");
  const [lang2, setLang2] = useState("");

  const [expCleaning, setExpCleaning] = useState(false);
  const [workNight, setWorkNight] = useState(false);
  const [workTeam, setWorkTeam] = useState(false);
  const [workPublicPlaces, setWorkPublicPlaces] = useState(false);
  const [workClientContact, setWorkClientContact] = useState(false);

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

      // Cast "a prova di TS" (evita il problema GenericStringError in build)
      const p = prof as unknown as Profile;

      const t = (p.user_type ?? "worker") as string;
      if (t === "company") {
        window.location.href = "/company-onboarding";
        return;
      }
      if (t === "client") {
        window.location.href = "/client-onboarding";
        return;
      }

      setProfile(p);

      // prefill step 1
      setFirstName(p.first_name ?? "");
      setLastName(p.last_name ?? "");
      setPhone(p.worker_phone ?? "");
      setBirthDate(p.worker_birth_date ?? "");
      setBirthCity(p.worker_birth_city ?? "");
      setBirthCountry(p.worker_birth_country ?? "Italia");
      setGender(p.worker_gender ?? "");

      setResAddress(p.worker_res_address ?? "");
      setResCity(p.worker_res_city ?? "");
      setResProvince(p.worker_res_province ?? "");
      setResCap(p.worker_res_cap ?? "");

      setCitizenship(p.worker_citizenship ?? "");
      setPermitType(p.worker_permit_type ?? "");
      setDrivingLicense(p.worker_driving_license ?? "");
      setHasCar(Boolean(p.worker_has_car ?? false));

      // prefill step 2 da worker_data
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
  }, []);

  async function saveStep(nextStep: number) {
    if (!profile?.id) return;
    setError(null);

    if (nextStep >= 2) {
      if (!firstName.trim()) return setError("Inserisci il nome.");
      if (!lastName.trim()) return setError("Inserisci il cognome.");
      if (!phone.trim()) return setError("Inserisci il telefono.");
      if (!birthDate) return setError("Inserisci la data di nascita.");
      if (!resCity.trim()) return setError("Inserisci la città di residenza.");
      if (!resProvince.trim()) return setError("Inserisci la provincia di residenza.");
      if (!resCap.trim()) return setError("Inserisci il CAP.");
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

    const isComplete = nextStep >= 3;

    const { error: e } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),

        worker_phone: phone.trim(),
        worker_birth_date: birthDate,
        worker_birth_city: birthCity.trim() || null,
        worker_birth_country: birthCountry.trim() || null,
        worker_gender: gender || null,

        worker_res_address: resAddress.trim() || null,
        worker_res_city: resCity.trim(),
        worker_res_province: resProvince.trim(),
        worker_res_cap: resCap.trim(),

        worker_citizenship: citizenship.trim() || null,
        worker_permit_type: permitType.trim() || null,
        worker_driving_license: drivingLicense.trim() || null,
        worker_has_car: hasCar,

        worker_data,
        onboarding_step: nextStep,
        profile_status: isComplete ? "complete" : "incomplete",
      })
      .eq("id", profile.id);

    if (e) {
      setSaving(false);
      setError(e.message);
      return;
    }

    setProfile((p) =>
      p
        ? ({
            ...p,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            worker_phone: phone.trim(),
            worker_birth_date: birthDate,
            worker_birth_city: birthCity.trim() || null,
            worker_birth_country: birthCountry.trim() || null,
            worker_gender: gender || null,
            worker_res_address: resAddress.trim() || null,
            worker_res_city: resCity.trim(),
            worker_res_province: resProvince.trim(),
            worker_res_cap: resCap.trim(),
            worker_citizenship: citizenship.trim() || null,
            worker_permit_type: permitType.trim() || null,
            worker_driving_license: drivingLicense.trim() || null,
            worker_has_car: hasCar,
            worker_data,
            onboarding_step: nextStep,
            profile_status: isComplete ? "complete" : "incomplete",
          } as Profile)
        : p
    );

    setSaving(false);

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

      <div className="small">
        Loggato come: <b>{meEmail}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Step <b>{step}</b> / 3
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Dati anagrafici</b>
          </div>

          <label>Nome *</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />

          <label>Cognome *</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <label>Telefono *</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label>Data di nascita *</label>
          <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" />

          <label>Città di nascita</label>
          <input value={birthCity} onChange={(e) => setBirthCity(e.target.value)} />

          <label>Paese di nascita</label>
          <input value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} />

          <label>Sesso</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">—</option>
            <option value="F">F</option>
            <option value="M">M</option>
            <option value="Altro">Altro</option>
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

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
            <input
              type="checkbox"
              checked={hasCar}
              onChange={(e) => setHasCar(e.target.checked)}
              style={{ margin: 0 }}
            />
            Automunito
          </label>

          <button onClick={() => saveStep(2)} disabled={saving} style={{ marginTop: 12 }}>
            {saving ? "Salvo..." : "Avanti"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Lingue e preferenze</b>
          </div>

          <label>Lingua 1</label>
          <input value={lang1} onChange={(e) => setLang1(e.target.value)} />

          <label style={{ marginTop: 10 }}>Lingua 2 (opzionale)</label>
          <input value={lang2} onChange={(e) => setLang2(e.target.value)} />

          <div style={{ marginTop: 14 }} className="small">
            <b>Preferenze</b>
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
            <input type="checkbox" checked={workNight} onChange={(e) => setWorkNight(e.target.checked)} />
            Lavoro notturno
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <input type="checkbox" checked={workTeam} onChange={(e) => setWorkTeam(e.target.checked)} />
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

      {step === 3 && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Conferma</b>
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
