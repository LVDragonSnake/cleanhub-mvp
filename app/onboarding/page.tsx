"use client";

import { useEffect, useMemo, useState } from "react";
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
  onboarding_step: number | null;

  clean_points: number | null;
  clean_level: number | null;

  worker_progress: WorkerProgress | null;

  worker_phone: string | null;
  worker_birth_date: string | null;
  worker_birth_city: string | null;
  worker_birth_country: string | null;
  worker_gender: "M" | "F" | null;

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

const PROFILE_SELECT = `
id,email,first_name,last_name,user_type,profile_status,onboarding_step,
clean_points,clean_level,worker_progress,
worker_phone,worker_birth_date,worker_birth_city,worker_birth_country,worker_gender,
worker_res_address,worker_res_city,worker_res_province,worker_res_cap,
worker_citizenship,worker_permit_type,worker_driving_license,worker_has_car,
worker_data
`;

export default function OnboardingWorkerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const step = useMemo(() => {
    const s = profile?.onboarding_step ?? 1;
    return Math.min(Math.max(s, 1), 3);
  }, [profile?.onboarding_step]);

  // STEP 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [birthCountry, setBirthCountry] = useState("Italia");
  const [gender, setGender] = useState<"M" | "F" | "">("");

  const [resAddress, setResAddress] = useState("");
  const [resCity, setResCity] = useState("");
  const [resProvince, setResProvince] = useState("");
  const [resCap, setResCap] = useState("");

  const [citizenship, setCitizenship] = useState("");
  const [permitType, setPermitType] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [hasCar, setHasCar] = useState(false);

  // STEP 2
  const [lang1, setLang1] = useState("Italiano");
  const [lang2, setLang2] = useState("");
  const [expCleaning, setExpCleaning] = useState(false);
  const [workNight, setWorkNight] = useState(false);
  const [workTeam, setWorkTeam] = useState(false);
  const [workPublicPlaces, setWorkPublicPlaces] = useState(false);
  const [workClientContact, setWorkClientContact] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_SELECT)
        .eq("id", auth.user.id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const p = data as Profile;
      setProfile(p);

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
      setHasCar(Boolean(p.worker_has_car));

      const wd = p.worker_data ?? {};
      const langs = wd.languages ?? [];
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

  async function completePack(pack: "general" | "experience" | "skills") {
    if (!profile) return;

    const progress = profile.worker_progress ?? { packs: {} };
    if (progress.packs?.[pack]) return;

    const newPoints = (profile.clean_points ?? 0) + 100;
    const newLevel = Math.min(5, 1 + Math.floor(newPoints / 150));

    const newProgress: WorkerProgress = {
      packs: { ...progress.packs, [pack]: true },
    };

    await supabase.from("profiles").update({
      clean_points: newPoints,
      clean_level: newLevel,
      worker_progress: newProgress,
    }).eq("id", profile.id);

    setProfile({
      ...profile,
      clean_points: newPoints,
      clean_level: newLevel,
      worker_progress: newProgress,
    });
  }

  async function saveStep(nextStep: number, pack?: "general" | "experience" | "skills") {
    if (!profile) return;
    setSaving(true);
    setError(null);

    await supabase.from("profiles").update({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      worker_phone: phone.trim(),
      worker_birth_date: birthDate,
      worker_birth_city: birthCity || null,
      worker_birth_country: birthCountry || null,
      worker_gender: gender || null,
      worker_res_address: resAddress || null,
      worker_res_city: resCity,
      worker_res_province: resProvince,
      worker_res_cap: resCap,
      worker_citizenship: citizenship || null,
      worker_permit_type: permitType || null,
      worker_driving_license: drivingLicense || null,
      worker_has_car: hasCar,
      worker_data: {
        languages: [
          { name: lang1 },
          ...(lang2 ? [{ name: lang2 }] : []),
        ],
        exp_cleaning: expCleaning,
        work_night: workNight,
        work_team: workTeam,
        work_public_places: workPublicPlaces,
        work_client_contact: workClientContact,
      },
      onboarding_step: nextStep,
    }).eq("id", profile.id);

    if (pack) await completePack(pack);
    setSaving(false);
    if (nextStep >= 3) window.location.href = "/profile";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Onboarding Operatore</h2>

      <div>Step {step} / 3</div>
      <div>Clean Points: {profile?.clean_points ?? 0}</div>
      <div>Livello: {profile?.clean_level ?? 1}</div>

      {error && <div>{error}</div>}

      {step === 1 && (
        <>
          <input placeholder="Nome" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <input placeholder="Cognome" value={lastName} onChange={e => setLastName(e.target.value)} />
          <select value={gender} onChange={e => setGender(e.target.value as "M" | "F")}>
            <option value="">—</option>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
          </select>
          <button onClick={() => saveStep(2, "general")}>Avanti</button>
        </>
      )}

      {step === 2 && (
        <>
          <input value={lang1} onChange={e => setLang1(e.target.value)} />
          <input value={lang2} onChange={e => setLang2(e.target.value)} />
          <button onClick={() => saveStep(3, "experience")}>Avanti</button>
        </>
      )}

      {step === 3 && (
        <button onClick={() => saveStep(3, "skills")}>Completa</button>
      )}
    </div>
  );
}
