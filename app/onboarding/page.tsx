"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { levelFromXp } from "../lib/gamification";

type PackKey =
  | "general"
  | "documents"
  | "languages"
  | "experience"
  | "training"
  | "availability"
  | "extra";

const PACK_ORDER: PackKey[] = [
  "general",
  "documents",
  "languages",
  "experience",
  "training",
  "availability",
  "extra",
];

const PACK_LABEL: Record<PackKey, string> = {
  general: "Dati personali",
  documents: "Documenti",
  languages: "Lingue",
  experience: "Esperienza lavorativa",
  training: "Formazione",
  availability: "Disponibilità e richieste",
  extra: "Altre informazioni",
};

type WorkerProgress = {
  packs?: Partial<Record<PackKey, boolean>>;
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

  // worker fields (top-level)
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

/** ✅ Next 15: useSearchParams dentro Suspense */
export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <OnboardingInner />
    </Suspense>
  );
}

function OnboardingInner() {
  const searchParams = useSearchParams();
  const pack = ((searchParams.get("pack") || "general") as PackKey) || "general";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [me, setMe] = useState<any>(null);
  const [meEmail, setMeEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  // ====== GENERAL ======
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

  // ====== DOCUMENTS ======
  const [citizenship, setCitizenship] = useState("");
  const [permitType, setPermitType] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [hasCar, setHasCar] = useState(false);

  // ====== LANGUAGES (worker_data) ======
  const [lang1, setLang1] = useState("Italiano");
  const [lang2, setLang2] = useState("");

  // ====== EXPERIENCE (worker_data) ======
  const [expCleaning, setExpCleaning] = useState(false);
  const [workNight, setWorkNight] = useState(false);
  const [workTeam, setWorkTeam] = useState(false);
  const [workPublicPlaces, setWorkPublicPlaces] = useState(false);
  const [workClientContact, setWorkClientContact] = useState(false);

  const [envHotel, setEnvHotel] = useState(false);
  const [envCare, setEnvCare] = useState(false);
  const [envPrivateHomes, setEnvPrivateHomes] = useState(false);
  const [envShopping, setEnvShopping] = useState(false);
  const [envOffices, setEnvOffices] = useState(false);
  const [envHospital, setEnvHospital] = useState(false);
  const [envRestaurants, setEnvRestaurants] = useState(false);
  const [envOther, setEnvOther] = useState(false);
  const [envOtherText, setEnvOtherText] = useState("");

  // ====== TRAINING (worker_data) ======
  const [schoolYearEnd, setSchoolYearEnd] = useState("");
  const [schoolCourse, setSchoolCourse] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const [trainingCourses, setTrainingCourses] = useState("");
  const [studyReadings, setStudyReadings] = useState("");
  const [studyDocsTv, setStudyDocsTv] = useState("");
  const [studySeminars, setStudySeminars] = useState("");
  const [studyFairs, setStudyFairs] = useState("");

  // ====== AVAILABILITY (worker_data) ======
  const [availableTrips, setAvailableTrips] = useState<"" | "yes" | "no">("");
  const [moveRadiusKm, setMoveRadiusKm] = useState("");
  const [contractPrefs, setContractPrefs] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [currentlyEmployed, setCurrentlyEmployed] = useState<"" | "yes" | "no">("");
  const [hourlyRequest, setHourlyRequest] = useState("");

  // ====== EXTRA (worker_data) ======
  const [hobbies, setHobbies] = useState("");
  const [traits, setTraits] = useState("");
  const [moreInfo, setMoreInfo] = useState("");

  const packs = useMemo(() => profile?.worker_progress?.packs || {}, [profile?.worker_progress]);
  const points = profile?.clean_points ?? 0;
  const level = profile?.clean_level ?? 1;

  const allDone = useMemo(() => {
    const p = packs || {};
    return PACK_ORDER.every((k) => !!p[k]);
  }, [packs]);

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

      // prefill GENERAL
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

      // prefill DOCUMENTS
      setCitizenship(p.worker_citizenship ?? "");
      setPermitType(p.worker_permit_type ?? "");
      setDrivingLicense(p.worker_driving_license ?? "");
      setHasCar(Boolean(p.worker_has_car ?? false));

      // worker_data
      const wd = (p.worker_data ?? {}) as any;

      // LANGUAGES
      const langs = Array.isArray(wd.languages) ? wd.languages : [];
      if (langs[0]?.name) setLang1(langs[0].name);
      if (langs[1]?.name) setLang2(langs[1].name);

      // EXPERIENCE
      setExpCleaning(!!wd.exp_cleaning);
      setWorkNight(!!wd.work_night);
      setWorkTeam(!!wd.work_team);
      setWorkPublicPlaces(!!wd.work_public_places);
      setWorkClientContact(!!wd.work_client_contact);

      const env = wd.env || {};
      setEnvHotel(!!env.hotel);
      setEnvCare(!!env.care);
      setEnvPrivateHomes(!!env.private_homes);
      setEnvShopping(!!env.shopping);
      setEnvOffices(!!env.offices);
      setEnvHospital(!!env.hospital);
      setEnvRestaurants(!!env.restaurants);
      setEnvOther(!!env.other);
      setEnvOtherText(env.other_text || "");

      // TRAINING
      const tr = wd.training || {};
      setSchoolYearEnd(tr.school_year_end || "");
      setSchoolCourse(tr.school_course || "");
      setSchoolName(tr.school_name || "");
      setTrainingCourses(tr.courses || "");
      setStudyReadings(tr.readings || "");
      setStudyDocsTv(tr.docs_tv || "");
      setStudySeminars(tr.seminars || "");
      setStudyFairs(tr.fairs || "");

      // AVAILABILITY
      const av = wd.availability || {};
      setAvailableTrips(av.trips ?? "");
      setMoveRadiusKm(av.radius_km ?? "");
      setContractPrefs(av.contract_prefs ?? "");
      setAvailabilityNotes(av.notes ?? "");
      setCurrentlyEmployed(av.currently_employed ?? "");
      setHourlyRequest(av.hourly_request ?? "");

      // EXTRA
      const ex = wd.extra || {};
      setHobbies(ex.hobbies ?? "");
      setTraits(ex.traits ?? "");
      setMoreInfo(ex.more_info ?? "");

      setLoading(false);
    })();
  }, []);

  function validateCurrentPack(pk: PackKey) {
    if (pk === "general") {
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

  async function completePack(packKey: PackKey) {
    if (!profile) return;

    const current = profile.worker_progress || { packs: {} };
    const already = !!current.packs?.[packKey];
    if (already) return;

    const newPoints = (profile.clean_points ?? 0) + 100;
    const newLevel = levelFromXp(newPoints);

    const newProgress: WorkerProgress = {
      ...current,
      packs: {
        ...(current.packs || {}),
        [packKey]: true,
      },
    };

    const nowAllDone = PACK_ORDER.every((k) => !!newProgress.packs?.[k]);

    const { error: e } = await supabase
      .from("profiles")
      .update({
        clean_points: newPoints,
        clean_level: newLevel,
        worker_progress: newProgress,
        profile_status: nowAllDone ? "complete" : "incomplete",
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
      profile_status: nowAllDone ? "complete" : "incomplete",
    });
  }

  async function saveCurrentPack() {
    if (!profile) return;
    setError(null);

    const validation = validateCurrentPack(pack);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);

    // worker_data merge
    const baseWd = (profile.worker_data ?? {}) as any;

    const worker_data = {
      ...baseWd,

      // LANGUAGES
      languages: [
        { name: (lang1 || "Italiano").trim() },
        ...(lang2.trim() ? [{ name: lang2.trim() }] : []),
      ],

      // EXPERIENCE
      exp_cleaning: expCleaning,
      work_night: workNight,
      work_team: workTeam,
      work_public_places: workPublicPlaces,
      work_client_contact: workClientContact,
      env: {
        hotel: envHotel,
        care: envCare,
        private_homes: envPrivateHomes,
        shopping: envShopping,
        offices: envOffices,
        hospital: envHospital,
        restaurants: envRestaurants,
        other: envOther,
        other_text: envOther ? envOtherText.trim() : "",
      },

      // TRAINING
      training: {
        school_year_end: schoolYearEnd.trim(),
        school_course: schoolCourse.trim(),
        school_name: schoolName.trim(),
        courses: trainingCourses.trim(),
        readings: studyReadings.trim(),
        docs_tv: studyDocsTv.trim(),
        seminars: studySeminars.trim(),
        fairs: studyFairs.trim(),
      },

      // AVAILABILITY
      availability: {
        trips: availableTrips,
        radius_km: moveRadiusKm.trim(),
        contract_prefs: contractPrefs.trim(),
        notes: availabilityNotes.trim(),
        currently_employed: currentlyEmployed,
        hourly_request: hourlyRequest.trim(),
      },

      // EXTRA
      extra: {
        hobbies: hobbies.trim(),
        traits: traits.trim(),
        more_info: moreInfo.trim(),
      },
    };

    // update DB
    const { error: e } = await supabase
      .from("profiles")
      .update({
        // GENERAL
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

        // DOCUMENTS
        worker_citizenship: citizenship.trim() || null,
        worker_permit_type: permitType.trim() || null,
        worker_driving_license: drivingLicense.trim() || null,
        worker_has_car: hasCar,

        // JSON
        worker_data,
      })
      .eq("id", profile.id);

    if (e) {
      setSaving(false);
      setError(e.message);
      return;
    }

    // aggiorna stato locale (minimo indispensabile)
    setProfile({ ...profile, worker_data });

    // completa pack + punti
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
        Livello: <b>{level}</b>
        {allDone ? " — Profilo completo ✅" : ""}
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Pack: <b>{PACK_LABEL[pack] || pack}</b> {packs?.[pack] ? "✅" : "❌"}
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {/* ================== GENERAL ================== */}
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
          <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date" />

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
        </>
      )}

      {/* ================== DOCUMENTS ================== */}
      {pack === "documents" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Documenti</b>
          </div>

          <label>Cittadinanza</label>
          <input value={citizenship} onChange={(e) => setCitizenship(e.target.value)} />

          <label>Permesso di soggiorno (tipologia)</label>
          <input value={permitType} onChange={(e) => setPermitType(e.target.value)} />

          <label>Patente</label>
          <input value={drivingLicense} onChange={(e) => setDrivingLicense(e.target.value)} />

          <div className="chkRow" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={hasCar} onChange={(e) => setHasCar(e.target.checked)} />
            <span>Automunito</span>
          </div>
        </>
      )}

      {/* ================== LANGUAGES ================== */}
      {pack === "languages" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Lingue</b>
          </div>

          <label>Lingua 1</label>
          <input value={lang1} onChange={(e) => setLang1(e.target.value)} />

          <label>Lingua 2 (opzionale)</label>
          <input value={lang2} onChange={(e) => setLang2(e.target.value)} />
        </>
      )}

      {/* ================== EXPERIENCE ================== */}
      {pack === "experience" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Esperienza</b>
          </div>

          <div className="chkRow">
            <input type="checkbox" checked={expCleaning} onChange={(e) => setExpCleaning(e.target.checked)} />
            <span>Esperienza nel campo delle pulizie</span>
          </div>

          <div className="chkRow">
            <input
              type="checkbox"
              checked={workClientContact}
              onChange={(e) => setWorkClientContact(e.target.checked)}
            />
            <span>Lavoro a contatto con persone/clienti</span>
          </div>

          <div className="chkRow">
            <input type="checkbox" checked={workNight} onChange={(e) => setWorkNight(e.target.checked)} />
            <span>Lavoro notturno</span>
          </div>

          <div className="chkRow">
            <input type="checkbox" checked={workTeam} onChange={(e) => setWorkTeam(e.target.checked)} />
            <span>Lavoro in team</span>
          </div>

          <div className="chkRow">
            <input
              type="checkbox"
              checked={workPublicPlaces}
              onChange={(e) => setWorkPublicPlaces(e.target.checked)}
            />
            <span>Lavoro in luoghi pubblici</span>
          </div>

          <div style={{ marginTop: 14 }} className="small">
            <b>Ambienti di lavoro</b>
          </div>

          <div className="chkRow">
            <input type="checkbox" checked={envHotel} onChange={(e) => setEnvHotel(e.target.checked)} />
            <span>Alberghi / hotel</span>
          </div>
          <div className="chkRow">
            <input type="checkbox" checked={envCare} onChange={(e) => setEnvCare(e.target.checked)} />
            <span>Case di cura</span>
          </div>
          <div className="chkRow">
            <input
              type="checkbox"
              checked={envPrivateHomes}
              onChange={(e) => setEnvPrivateHomes(e.target.checked)}
            />
            <span>Case private</span>
          </div>
          <div className="chkRow">
            <input type="checkbox" checked={envShopping} onChange={(e) => setEnvShopping(e.target.checked)} />
            <span>Centri commerciali</span>
          </div>
          <div className="chkRow">
            <input type="checkbox" checked={envOffices} onChange={(e) => setEnvOffices(e.target.checked)} />
            <span>Uffici</span>
          </div>
          <div className="chkRow">
            <input type="checkbox" checked={envHospital} onChange={(e) => setEnvHospital(e.target.checked)} />
            <span>Ospedali / Cliniche</span>
          </div>
          <div className="chkRow">
            <input
              type="checkbox"
              checked={envRestaurants}
              onChange={(e) => setEnvRestaurants(e.target.checked)}
            />
            <span>Ristoranti / bar</span>
          </div>
          <div className="chkRow">
            <input type="checkbox" checked={envOther} onChange={(e) => setEnvOther(e.target.checked)} />
            <span>Altro</span>
          </div>

          {envOther && (
            <>
              <label>Altro (specifica)</label>
              <input value={envOtherText} onChange={(e) => setEnvOtherText(e.target.value)} />
            </>
          )}
        </>
      )}

      {/* ================== TRAINING ================== */}
      {pack === "training" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Formazione</b>
          </div>

          <div className="small" style={{ marginTop: 10 }}>
            <b>Formazione scolastica</b>
          </div>

          <label>Anno di fine</label>
          <input value={schoolYearEnd} onChange={(e) => setSchoolYearEnd(e.target.value)} />

          <label>Corso di studi</label>
          <input value={schoolCourse} onChange={(e) => setSchoolCourse(e.target.value)} />

          <label>Scuola</label>
          <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />

          <div className="small" style={{ marginTop: 10 }}>
            <b>Approfondimenti</b>
          </div>

          <label>Corsi di formazione</label>
          <textarea value={trainingCourses} onChange={(e) => setTrainingCourses(e.target.value)} />

          <label>Letture di studio</label>
          <textarea value={studyReadings} onChange={(e) => setStudyReadings(e.target.value)} />

          <label>Documentari / programmi televisivi</label>
          <textarea value={studyDocsTv} onChange={(e) => setStudyDocsTv(e.target.value)} />

          <label>Seminari</label>
          <textarea value={studySeminars} onChange={(e) => setStudySeminars(e.target.value)} />

          <label>Fiere</label>
          <textarea value={studyFairs} onChange={(e) => setStudyFairs(e.target.value)} />
        </>
      )}

      {/* ================== AVAILABILITY ================== */}
      {pack === "availability" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Disponibilità e richieste</b>
          </div>

          <label>Disponibilità trasferte</label>
          <select value={availableTrips} onChange={(e) => setAvailableTrips(e.target.value as any)}>
            <option value="">—</option>
            <option value="yes">Sì</option>
            <option value="no">No</option>
          </select>

          <label>Spostamenti (raggio km)</label>
          <input value={moveRadiusKm} onChange={(e) => setMoveRadiusKm(e.target.value)} />

          <label>Tipi di contratti e lavori ricercati o preferiti</label>
          <textarea value={contractPrefs} onChange={(e) => setContractPrefs(e.target.value)} />

          <label>Giorni/date/orari di disponibilità o non disponibilità</label>
          <textarea value={availabilityNotes} onChange={(e) => setAvailabilityNotes(e.target.value)} />

          <label>Attualmente assunto o con contratti attivi?</label>
          <select value={currentlyEmployed} onChange={(e) => setCurrentlyEmployed(e.target.value as any)}>
            <option value="">—</option>
            <option value="yes">Sì</option>
            <option value="no">No</option>
          </select>

          <label>Richiesta oraria indicativa</label>
          <input value={hourlyRequest} onChange={(e) => setHourlyRequest(e.target.value)} />
        </>
      )}

      {/* ================== EXTRA ================== */}
      {pack === "extra" && (
        <>
          <div style={{ marginTop: 14 }} className="small">
            <b>Altre informazioni</b>
          </div>

          <label>Hobbies</label>
          <textarea value={hobbies} onChange={(e) => setHobbies(e.target.value)} />

          <label>Tratti caratteriali</label>
          <textarea value={traits} onChange={(e) => setTraits(e.target.value)} />

          <label>Ulteriori informazioni</label>
          <textarea value={moreInfo} onChange={(e) => setMoreInfo(e.target.value)} />
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
