"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type PackKey =
  | "general"
  | "documents"
  | "languages"
  | "experience"
  | "training"
  | "availability"
  | "extra";

const PACK_LABEL: Record<PackKey, string> = {
  general: "Dati personali",
  documents: "Documenti",
  languages: "Lingue",
  experience: "Esperienza lavorativa",
  training: "Formazione",
  availability: "Disponibilità e richieste",
  extra: "Altre informazioni",
};

type Profile = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;

  clean_points: number | null;
  clean_level: number | null;

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

const PROFILE_SELECT = `id,email,first_name,last_name,
clean_points,clean_level,
worker_phone,worker_birth_date,worker_birth_city,worker_birth_country,worker_gender,
worker_res_address,worker_res_city,worker_res_province,worker_res_cap,
worker_citizenship,worker_permit_type,worker_driving_license,worker_has_car,
worker_data` as const;

function yesNo(v: any) {
  return v ? "Sì" : "No";
}

function fmt(v: any) {
  if (v === null || v === undefined) return "—";
  const s = String(v).trim();
  return s ? s : "—";
}

function listFromLanguages(wd: any) {
  const arr = Array.isArray(wd?.languages) ? wd.languages : [];
  return arr.map((x: any) => x?.name).filter(Boolean);
}

export default function CurriculumPage() {
  const [loading, setLoading] = useState(true);
  const [meEmail, setMeEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      setMeEmail((auth.user.email || "").toLowerCase());

      const { data, error: e } = await supabase
        .from("profiles")
        .select(PROFILE_SELECT)
        .eq("id", auth.user.id)
        .single();

      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }

      setProfile((data as unknown as Profile) ?? null);
      setLoading(false);
    })();
  }, []);

  const wd = useMemo(() => (profile?.worker_data ?? {}) as any, [profile?.worker_data]);

  const languages = useMemo(() => listFromLanguages(wd), [wd]);

  const env = wd?.env ?? {};
  const training = wd?.training ?? {};
  const availability = wd?.availability ?? {};
  const extra = wd?.extra ?? {};

  const expFlags = useMemo(() => {
    const items: Array<{ label: string; value: boolean }> = [
      { label: "Esperienza nel campo delle pulizie", value: !!wd?.exp_cleaning },
      { label: "Lavoro a contatto con persone/clienti", value: !!wd?.work_client_contact },
      { label: "Lavoro notturno", value: !!wd?.work_night },
      { label: "Lavoro in team", value: !!wd?.work_team },
      { label: "Lavoro in luoghi pubblici", value: !!wd?.work_public_places },
    ];
    return items;
  }, [wd]);

  const envFlags = useMemo(() => {
    const items: Array<{ label: string; value: boolean }> = [
      { label: "Alberghi / hotel", value: !!env?.hotel },
      { label: "Case di cura", value: !!env?.care },
      { label: "Case private", value: !!env?.private_homes },
      { label: "Centri commerciali", value: !!env?.shopping },
      { label: "Uffici", value: !!env?.offices },
      { label: "Ospedali / Cliniche", value: !!env?.hospital },
      { label: "Ristoranti / bar", value: !!env?.restaurants },
      { label: "Altro", value: !!env?.other },
    ];
    return items;
  }, [env]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Curriculum Operatore</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Loggato come: <b>{meEmail}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {!profile ? (
        <div className="small" style={{ marginTop: 10 }}>
          Errore: profilo non trovato.
        </div>
      ) : (
        <>
          {/* HEADER MINI */}
          <div className="small" style={{ marginTop: 10 }}>
            Nome:{" "}
            <b>
              {`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "—"}
            </b>
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            Livello: <b>{profile.clean_level ?? 1}</b>
          </div>

          <hr style={{ margin: "14px 0" }} />

          {/* SEZIONI */}
          <Section
            title={PACK_LABEL.general}
            onEdit={() => (window.location.href = "/onboarding?pack=general")}
          >
            <TwoCol
              left={[
                ["Telefono", fmt(profile.worker_phone)],
                ["Data di nascita", fmt(profile.worker_birth_date)],
                ["Sesso", fmt(profile.worker_gender)],
                ["Città di nascita", fmt(profile.worker_birth_city)],
                ["Paese di nascita", fmt(profile.worker_birth_country)],
              ]}
              right={[
                ["Indirizzo", fmt(profile.worker_res_address)],
                ["Città (residenza)", fmt(profile.worker_res_city)],
                ["Provincia", fmt(profile.worker_res_province)],
                ["CAP", fmt(profile.worker_res_cap)],
              ]}
            />
          </Section>

          <Section
            title={PACK_LABEL.documents}
            onEdit={() => (window.location.href = "/onboarding?pack=documents")}
          >
            <TwoCol
              left={[
                ["Cittadinanza", fmt(profile.worker_citizenship)],
                ["Permesso di soggiorno", fmt(profile.worker_permit_type)],
              ]}
              right={[
                ["Patente", fmt(profile.worker_driving_license)],
                ["Automunito", yesNo(!!profile.worker_has_car)],
              ]}
            />
          </Section>

          <Section
            title={PACK_LABEL.languages}
            onEdit={() => (window.location.href = "/onboarding?pack=languages")}
          >
            <Line label="Lingue" value={languages.length ? languages.join(", ") : "—"} />
          </Section>

          <Section
            title={PACK_LABEL.experience}
            onEdit={() => (window.location.href = "/onboarding?pack=experience")}
          >
            <div style={{ display: "grid", gap: 8 }}>
              {expFlags.map((x) => (
                <Line key={x.label} label={x.label} value={x.value ? "✅" : "—"} />
              ))}
            </div>

            <div className="small" style={{ marginTop: 12 }}>
              <b>Ambienti di lavoro</b>
            </div>

            <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
              {envFlags.map((x) => (
                <Line key={x.label} label={x.label} value={x.value ? "✅" : "—"} />
              ))}
              {env?.other && env?.other_text ? (
                <Line label="Altro (specifica)" value={fmt(env.other_text)} />
              ) : null}
            </div>
          </Section>

          <Section
            title={PACK_LABEL.training}
            onEdit={() => (window.location.href = "/onboarding?pack=training")}
          >
            <TwoCol
              left={[
                ["Anno fine scuola", fmt(training?.school_year_end)],
                ["Corso di studi", fmt(training?.school_course)],
                ["Scuola", fmt(training?.school_name)],
              ]}
              right={[
                ["Corsi", fmt(training?.courses)],
                ["Letture", fmt(training?.readings)],
                ["Doc/TV", fmt(training?.docs_tv)],
                ["Seminari", fmt(training?.seminars)],
                ["Fiere", fmt(training?.fairs)],
              ]}
            />
          </Section>

          <Section
            title={PACK_LABEL.availability}
            onEdit={() => (window.location.href = "/onboarding?pack=availability")}
          >
            <TwoCol
              left={[
                ["Trasferte", fmt(availability?.trips)],
                ["Raggio (km)", fmt(availability?.radius_km)],
                ["Contratti preferiti", fmt(availability?.contract_prefs)],
              ]}
              right={[
                ["Note disponibilità", fmt(availability?.notes)],
                ["Attualmente assunto", fmt(availability?.currently_employed)],
                ["Richiesta oraria", fmt(availability?.hourly_request)],
              ]}
            />
          </Section>

          <Section
            title={PACK_LABEL.extra}
            onEdit={() => (window.location.href = "/onboarding?pack=extra")}
          >
            <TwoCol
              left={[
                ["Hobbies", fmt(extra?.hobbies)],
                ["Tratti caratteriali", fmt(extra?.traits)],
              ]}
              right={[["Ulteriori info", fmt(extra?.more_info)]]}
            />
          </Section>

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
        </>
      )}
    </div>
  );
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginTop: 10,
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
        <button onClick={onEdit}>Modifica</button>
      </div>

      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>{children}</div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <div style={{ width: 220, opacity: 0.75 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function TwoCol({
  left,
  right,
}: {
  left: Array<[string, string]>;
  right: Array<[string, string]>;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      <div style={{ display: "grid", gap: 8 }}>
        {left.map(([k, v]) => (
          <Line key={k} label={k} value={v} />
        ))}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {right.map(([k, v]) => (
          <Line key={k} label={k} value={v} />
        ))}
      </div>
    </div>
  );
}
