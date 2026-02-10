"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type WorkerDetail = {
  worker_id: string;
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string | null;
  res_cap: string | null;
  worker_data: any;
  unlocked: boolean;
  contact_email: string | null;
  contact_phone: string | null;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const publicNo = useMemo(() => Number(params?.workerPublicNo || 0), [params]);

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    (async () => {
      if (!publicNo) return;

      // auth + blocco se non company
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      await refreshCredits();
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicNo]);

  async function refreshCredits() {
    try {
      const res = await fetch("/api/company/credits");
      const json = await res.json();
      setCredits(Number(json.credits ?? 0));
    } catch {
      setCredits(0);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("company_get_worker", {
      p_worker_public_no: publicNo,
    });

    if (error) {
      setError(error.message);
      setRow(null);
      setLoading(false);
      return;
    }

    const first = Array.isArray(data) ? data[0] : null;
    setRow(first ?? null);
    setLoading(false);
  }

  async function unlock() {
    if (!row) return;

    setUnlocking(true);
    setError(null);

    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: publicNo,
    });

    if (error) {
      // error.message conterrà NOT_ENOUGH_CREDITS / NOT_COMPANY / etc.
      setError(error.message);
      setUnlocking(false);
      return;
    }

    await refreshCredits();
    await load();
    setUnlocking(false);
  }

  if (!publicNo) return <div>Caricamento...</div>;
  if (loading) return <div>Caricamento...</div>;
  if (!row) return <div className="card">Operatore non trovato.</div>;

  const wd = row.worker_data || {};
  const langs = Array.isArray(wd.languages) ? wd.languages : [];
  const av = wd.availability || {};
  const env = wd.env || {};
  const tr = wd.training || {};

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{row.clean_level ?? 1}</b> — Stato: <b>{row.profile_status}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Zona: <b>{row.res_province ?? "—"}</b> • <b>{row.res_cap ?? "—"}</b>
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Torna alla lista</button>

        {!row.unlocked ? (
          <button onClick={unlock} disabled={unlocking}>
            {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
          </button>
        ) : (
          <span className="small">✅ Contatti sbloccati</span>
        )}
      </div>

      <hr style={{ marginTop: 14 }} />

      <h3>Contatti</h3>
      {!row.unlocked ? (
        <div className="small">🔒 Contatti nascosti finché non sblocchi.</div>
      ) : (
        <div className="small" style={{ marginTop: 6 }}>
          Email: <b>{row.contact_email ?? "—"}</b>
          <br />
          Telefono: <b>{row.contact_phone ?? "—"}</b>
        </div>
      )}

      <hr style={{ marginTop: 14 }} />

      <h3>Lingue</h3>
      <div className="small" style={{ marginTop: 6 }}>
        {langs.length === 0 ? "—" : langs.map((l: any) => l?.name).filter(Boolean).join(", ")}
      </div>

      <h3 style={{ marginTop: 14 }}>Esperienza</h3>
      <div className="small" style={{ marginTop: 6 }}>
        {wd.exp_cleaning ? "✅ Esperienza pulizie" : "— Esperienza pulizie"} <br />
        {wd.work_client_contact ? "✅ Contatto clienti" : "— Contatto clienti"} <br />
        {wd.work_night ? "✅ Notturno" : "— Notturno"} <br />
        {wd.work_team ? "✅ Team" : "— Team"} <br />
        {wd.work_public_places ? "✅ Luoghi pubblici" : "— Luoghi pubblici"} <br />
      </div>

      <h3 style={{ marginTop: 14 }}>Ambienti</h3>
      <div className="small" style={{ marginTop: 6 }}>
        {env.hotel ? "✅ Hotel" : null} {env.care ? "✅ Case di cura" : null}{" "}
        {env.private_homes ? "✅ Case private" : null} {env.shopping ? "✅ Centri commerciali" : null}{" "}
        {env.offices ? "✅ Uffici" : null} {env.hospital ? "✅ Ospedali/Cliniche" : null}{" "}
        {env.restaurants ? "✅ Ristoranti/Bar" : null} {env.other ? `✅ Altro: ${env.other_text || ""}` : null}
        {!env.hotel &&
        !env.care &&
        !env.private_homes &&
        !env.shopping &&
        !env.offices &&
        !env.hospital &&
        !env.restaurants &&
        !env.other
          ? "—"
          : null}
      </div>

      <h3 style={{ marginTop: 14 }}>Disponibilità</h3>
      <div className="small" style={{ marginTop: 6 }}>
        Trasferte: <b>{av.trips || "—"}</b> <br />
        Raggio km: <b>{av.radius_km || "—"}</b> <br />
        Contratti preferiti: <b>{av.contract_prefs || "—"}</b> <br />
        Note: <b>{av.notes || "—"}</b> <br />
        Attualmente impiegato: <b>{av.currently_employed || "—"}</b> <br />
        Richiesta oraria: <b>{av.hourly_request || "—"}</b>
      </div>

      <h3 style={{ marginTop: 14 }}>Formazione</h3>
      <div className="small" style={{ marginTop: 6 }}>
        Fine scuola: <b>{tr.school_year_end || "—"}</b> <br />
        Corso: <b>{tr.school_course || "—"}</b> <br />
        Scuola: <b>{tr.school_name || "—"}</b> <br />
        Corsi: <b>{tr.courses || "—"}</b>
      </div>
    </div>
  );
}
