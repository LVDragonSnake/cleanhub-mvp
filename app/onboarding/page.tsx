"use client";

import { useEffect, useState } from "react";
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
  worker_birth_date: string | null; // ISO yyyy-mm-dd
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
};

export default function OnboardingWorkerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meEmail, setMeEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  // form state
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("Italia");
  const [gender, setGender] = useState<string>("");

  const [resAddress, setResAddress] = useState("");
  const [resCity, setResCity] = useState("");
  const [resProvince, setResProvince] = useState("");
  const [resCap, setResCap] = useState("");

  const [citizenship, setCitizenship] = useState("");
  const [permitType, setPermitType] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [hasCar, setHasCar] = useState<boolean>(false);

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
        .select(
          [
            "id",
            "email",
            "first_name",
            "last_name",
            "user_type",
            "profile_status",
            "onboarding_step",
            "worker_phone",
            "worker_birth_date",
            "worker_birth_city",
            "worker_birth_country",
            "worker_gender",
            "worker_res_address",
            "worker_res_city",
            "worker_res_province",
            "worker_res_cap",
            "worker_citizenship",
            "worker_permit_type",
            "worker_driving_license",
            "worker_has_car",
          ].join(",")
        )
        .eq("id", auth.user.id)
        .single();

      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }

      // se è company o client, fuori (loro hanno altri onboarding)
      const t = (prof?.user_type ?? "worker") as string;
      if (t === "company") {
        window.location.href = "/company-onboarding";
        return;
      }
      if (t === "client") {
        window.location.href = "/client-onboarding";
        return;
      }

      const p = prof as Profile;
      setProfile(p);

      // preload campi se già presenti
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

      setLoading(false);
    })();
  }, []);

  async function save() {
    setError(null);

    // mini-validazione (base)
    if (!phone.trim()) return setError("Inserisci il telefono.");
    if (!birthDate) return setError("Inserisci la data di nascita.");
    if (!resCity.trim()) return setError("Inserisci la città di residenza.");
    if (!resProvince.trim()) return setError("Inserisci la provincia di residenza.");
    if (!resCap.trim()) return setError("Inserisci il CAP.");

    setSaving(true);

    const { error: e } = await supabase
      .from("profiles")
      .update({
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

        // step 1 completato, poi faremo step 2 (esperienze/competenze)
        onboarding_step: 2,
        profile_status: "incomplete",
      })
      .eq("id", profile!.id);

    setSaving(false);

    if (e) return setError(e.message);

    // avanti: per ora rimandiamo al profilo
    window.location.href = "/profile";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Onboarding Operatore</h2>
      <div className="small">Loggato come: <b>{meEmail}</b></div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14 }} />

      <label>Telefono *</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Es. 3331234567" />

      <label>Data di nascita *</label>
      <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" />

      <label>Città di nascita</label>
      <input value={birthCity} onChange={(e) => setBirthCity(e.target.value)} placeholder="Es. Milano" />

      <label>Paese di nascita</label>
      <input value={birthCountry} onChange={(e) => setBirthCountry(e.target.value)} placeholder="Es. Italia" />

      <label>Sesso</label>
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option value="">—</option>
        <option value="F">F</option>
        <option value="M">M</option>
        <option value="Altro">Altro</option>
      </select>

      <div style={{ marginTop: 14 }} />

      <label>Indirizzo di residenza</label>
      <input value={resAddress} onChange={(e) => setResAddress(e.target.value)} placeholder="Via, civico" />

      <label>Città (residenza) *</label>
      <input value={resCity} onChange={(e) => setResCity(e.target.value)} />

      <label>Provincia (residenza) *</label>
      <input value={resProvince} onChange={(e) => setResProvince(e.target.value)} placeholder="Es. RM" />

      <label>CAP (residenza) *</label>
      <input value={resCap} onChange={(e) => setResCap(e.target.value)} placeholder="Es. 00100" />

      <div style={{ marginTop: 14 }} />

      <label>Cittadinanza</label>
      <input value={citizenship} onChange={(e) => setCitizenship(e.target.value)} placeholder="Es. Italiana" />

      <label>Permesso di soggiorno (tipologia)</label>
      <input value={permitType} onChange={(e) => setPermitType(e.target.value)} placeholder="Es. A tempo indeterminato" />

      <label>Patente</label>
      <input value={drivingLicense} onChange={(e) => setDrivingLicense(e.target.value)} placeholder="Es. B / Nessuna" />

      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
        <input type="checkbox" checked={hasCar} onChange={(e) => setHasCar(e.target.checked)} style={{ margin: 0 }} />
        Automunito
      </label>

      <button onClick={save} disabled={saving} style={{ marginTop: 14 }}>
        {saving ? "Salvo..." : "Salva e continua"}
      </button>

      <div className="small" style={{ marginTop: 10 }}>
        (Step 1/2 — dopo aggiungiamo esperienze/competenze tipo “Cleaning Curriculum”.)
      </div>
    </div>
  );
}
