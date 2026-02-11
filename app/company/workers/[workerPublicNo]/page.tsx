"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type WorkerDetail = {
  worker_public_no: number;
  clean_level: number | null;
  profile_status: string | null;
  res_province: string | null;
  res_cap: string | null;

  unlocked: boolean;
  contact_email: string | null;
  contact_phone: string | null;

  worker_data: any;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const workerPublicNo = useMemo(() => Number(params?.workerPublicNo || 0), [params]);

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    (async () => {
      setError(null);

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

      // crediti
      try {
        const res = await fetch("/api/company/credits");
        const json = await res.json();
        setCredits(Number(json.credits ?? 0));
      } catch {
        setCredits(0);
      }

      await loadDetail();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerPublicNo]);

  async function loadDetail() {
    setError(null);

    if (!workerPublicNo || !Number.isFinite(workerPublicNo)) {
      setRow(null);
      return;
    }

    // usa la tua API esistente (quella che già ti dava CV+unlocked)
    // Se la tua API ha un path diverso, dimmelo e la adeguo,
    // ma di solito è /api/company/worker?publicNo=...
    const res = await fetch(`/api/company/worker?publicNo=${workerPublicNo}`);
    const json = await res.json();

    if (!res.ok) {
      setRow(null);
      setError(json?.error || "Operatore non trovato.");
      return;
    }

    setRow(json.row as WorkerDetail);
  }

  async function unlock() {
    if (!row) return;
    setUnlocking(true);
    setError(null);

    try {
      const res = await fetch("/api/company/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerPublicNo: row.worker_public_no }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Errore sblocco contatti");
        setUnlocking(false);
        return;
      }

      // refresh crediti + dettaglio
      try {
        const c = await fetch("/api/company/credits");
        const cj = await c.json();
        setCredits(Number(cj.credits ?? 0));
      } catch {
        // ignore
      }

      await loadDetail();
    } finally {
      setUnlocking(false);
    }
  }

  if (loading) return <div>Caricamento...</div>;

  if (!row) {
    return (
      <div className="card">
        <h2>Operatore</h2>
        <div className="small">{error || "Operatore non trovato."}</div>
        <div style={{ marginTop: 14 }}>
          <button onClick={() => (window.location.href = "/company/workers")}>← Torna alla lista</button>
        </div>
      </div>
    );
  }

  const wd = row.worker_data || {};
  const langs = Array.isArray(wd.languages) ? wd.languages : [];
  const av = wd.availability || {};
  const env = wd.env || {};
  const tr = wd.training || {};
  const ex = wd.extra || {};

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      <div className="small" style={{ marginTop: 8, opacity: 0.9 }}>
        Crediti: <b>{credits}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
        Livello: {row.clean_level ?? 1} · Stato: {row.profile_status ?? "incomplete"} · Zona:{" "}
        {(row.res_province ?? "—") + (row.res_cap ? ` (${row.res_cap})` : "")}
      </div>

      <hr style={{ margin: "14px 0" }} />

      <h3>Contatti</h3>

      {!row.unlocked ? (
        <>
          <div className="small" style={{ opacity: 0.8 }}>
            Contatti bloccati. Per vedere email/telefono devi sbloccare.
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={unlock} disabled={unlocking}>
              {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => alert("Proposta preliminare: la implementiamo adesso come step successivo.")}
            >
              Invia proposta preliminare
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="small" style={{ marginTop: 6 }}>
            Email: <b>{row.contact_email || "—"}</b>
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            Telefono: <b>{row.contact_phone || "—"}</b>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => alert("Proposta preliminare: la implementiamo adesso come step successivo.")}
            >
              Invia proposta preliminare
            </button>
          </div>
        </>
      )}

      <hr style={{ margin: "14px 0" }} />

      <h3>CV (dati strutturati)</h3>

      <div style={{ marginTop: 10 }}>
        <b>Lingue</b>
        <div className="small" style={{ opacity: 0.85 }}>
          {langs.length ? langs.map((l: any) => l?.name).filter(Boolean).join(", ") : "—"}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Disponibilità</b>
        <div className="small" style={{ opacity: 0.85 }}>
          Trasferte: {av.trips || "—"} · Raggio km: {av.radius_km || "—"} · Richiesta oraria:{" "}
          {av.hourly_request || "—"}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Esperienza / Skills</b>
        <div className="small" style={{ opacity: 0.85 }}>
          Pulizie: {wd.exp_cleaning ? "Sì" : "No"} · Notturno: {wd.work_night ? "Sì" : "No"} · Team:{" "}
          {wd.work_team ? "Sì" : "No"} · Luoghi pubblici: {wd.work_public_places ? "Sì" : "No"} ·
          Contatto clienti: {wd.work_client_contact ? "Sì" : "No"}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Ambienti</b>
        <div className="small" style={{ opacity: 0.85 }}>
          Hotel: {env.hotel ? "Sì" : "No"} · Case di cura: {env.care ? "Sì" : "No"} · Case private:{" "}
          {env.private_homes ? "Sì" : "No"} · Centri commerciali: {env.shopping ? "Sì" : "No"} ·
          Uffici: {env.offices ? "Sì" : "No"} · Ospedali: {env.hospital ? "Sì" : "No"} · Ristoranti:{" "}
          {env.restaurants ? "Sì" : "No"}
          {env.other ? ` · Altro: ${env.other_text || "—"}` : ""}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Formazione</b>
        <div className="small" style={{ opacity: 0.85 }}>
          Fine scuola: {tr.school_year_end || "—"} · Corso: {tr.school_course || "—"} · Scuola:{" "}
          {tr.school_name || "—"}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Extra</b>
        <div className="small" style={{ opacity: 0.85 }}>
          Hobbies: {ex.hobbies || "—"} · Tratti: {ex.traits || "—"}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Torna alla lista</button>
      </div>
    </div>
  );
}
