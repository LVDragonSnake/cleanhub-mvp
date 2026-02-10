"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type WorkerDetail = {
  worker_id: string;
  worker_public_no: number;
  clean_level: number;
  province: string | null;
  worker_data: any;
  unlocked: boolean;
  contact_email: string | null;
  contact_phone: string | null;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const workerPublicNo = Number(params.workerPublicNo);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  async function load() {
    setError(null);
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase.rpc("company_get_worker", {
      p_worker_public_no: workerPublicNo,
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
    setError(null);
    setUnlocking(true);

    const { error } = await supabase.rpc("unlock_worker_contact", {
      p_worker_id: row.worker_id,
    });

    if (error) {
      setUnlocking(false);
      setError(error.message);
      return;
    }

    setUnlocking(false);
    await load();
  }

  useEffect(() => {
    if (!Number.isFinite(workerPublicNo)) {
      setError("ID operatore non valido");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerPublicNo]);

  if (loading) return <div>Caricamento...</div>;

  if (!row) {
    return (
      <div className="card">
        <h2>Profilo operatore</h2>
        {error && <div className="small">{error}</div>}
        <div style={{ marginTop: 14 }}>
          <button onClick={() => (window.location.href = "/company/workers")}>← Indietro</button>
        </div>
      </div>
    );
  }

  const wd = row.worker_data || {};
  const env = wd.env || {};
  const training = wd.training || {};
  const availability = wd.availability || {};
  const extra = wd.extra || {};

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{row.clean_level}</b> · Provincia: <b>{row.province || "—"}</b>
      </div>

      <hr />

      <h3>Profilo (pubblico)</h3>

      <div className="small">
        <b>Esperienza pulizie:</b> {wd.exp_cleaning ? "Sì" : "No"}
      </div>

      <div className="small" style={{ marginTop: 8 }}>
        <b>Ambienti:</b>{" "}
        {[
          env.hotel && "Hotel",
          env.care && "Case di cura",
          env.private_homes && "Case private",
          env.shopping && "Centri commerciali",
          env.offices && "Uffici",
          env.hospital && "Ospedali/Cliniche",
          env.restaurants && "Ristoranti/Bar",
          env.other && (env.other_text || "Altro"),
        ]
          .filter(Boolean)
          .join(", ") || "—"}
      </div>

      <div className="small" style={{ marginTop: 8 }}>
        <b>Formazione:</b>{" "}
        {[training.school_name, training.school_course, training.school_year_end]
          .filter(Boolean)
          .join(" · ") || "—"}
      </div>

      <div className="small" style={{ marginTop: 8 }}>
        <b>Disponibilità trasferte:</b> {availability.trips || "—"} · <b>Raggio:</b>{" "}
        {availability.radius_km || "—"} km
      </div>

      <div className="small" style={{ marginTop: 8 }}>
        <b>Extra:</b>{" "}
        {[extra.traits, extra.hobbies].filter(Boolean).join(" · ") || "—"}
      </div>

      <hr />

      <h3>Contatti</h3>

      {row.unlocked ? (
        <div>
          <div className="small">
            Email: <b>{row.contact_email || "—"}</b>
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            Telefono: <b>{row.contact_phone || "—"}</b>
          </div>
        </div>
      ) : (
        <div>
          <div className="small">🔒 Contatti bloccati</div>
          <div style={{ marginTop: 10 }}>
            <button onClick={unlock} disabled={unlocking}>
              {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
            </button>
          </div>
          <div className="small" style={{ marginTop: 8, opacity: 0.75 }}>
            (Puoi sbloccare anche senza pre-proposta: scelta tua.)
          </div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Indietro</button>
      </div>
    </div>
  );
}
