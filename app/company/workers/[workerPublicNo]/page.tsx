"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type WorkerDetail = {
  worker_id: string;
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  worker_data: any;
  res_province: string | null;
  res_cap: string | null;
  unlocked: boolean;
  contact_email: string | null;
  contact_phone: string | null;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const workerPublicNo = useMemo(() => Number(params?.workerPublicNo ?? 0), [params]);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      window.location.href = "/login";
      return;
    }

    // must be company
    const { data: prof } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", auth.user.id)
      .single();

    if ((prof?.user_type ?? "") !== "company") {
      window.location.href = "/dashboard";
      return;
    }

    const { data: cRow } = await supabase
      .from("company_credits")
      .select("credits")
      .eq("company_id", auth.user.id)
      .single();

    setCredits(Number(cRow?.credits ?? 0));

    const { data, error: e } = await supabase.rpc("company_get_worker", {
      p_worker_public_no: workerPublicNo,
    });

    if (e) {
      setError(e.message);
      setRow(null);
      setLoading(false);
      return;
    }

    const first = Array.isArray(data) ? data[0] : null;
    setRow((first as any) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    if (!workerPublicNo) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerPublicNo]);

  async function unlock() {
    if (!row) return;
    setSaving(true);
    setError(null);

    const { error: e } = await supabase.rpc("unlock_worker_contact", {
      p_worker_id: row.worker_id,
    });

    if (e) {
      // messaggio “umano”
      if ((e.message || "").includes("NOT_ENOUGH_CREDITS")) {
        setError("Crediti insufficienti. Ricarica per sbloccare i contatti.");
      } else {
        setError(e.message);
      }
      setSaving(false);
      return;
    }

    // ricarica dati (ora unlocked true)
    await load();
    setSaving(false);
  }

  if (!workerPublicNo) return <div>Caricamento...</div>;
  if (loading) return <div>Caricamento...</div>;
  if (!row) return <div className="card">Operatore non trovato.</div>;

  const wd = row.worker_data || {};
  const languages = Array.isArray(wd.languages) ? wd.languages : [];

  return (
    <div className="card">
      <button onClick={() => (window.location.href = "/company/workers")}>← Torna alla lista</button>

      <h2 style={{ marginTop: 10 }}>
        Operatore #{row.worker_public_no}
      </h2>

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{row.clean_level}</b> — Stato: <b>{row.profile_status}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Zona: <b>{row.res_province || "—"}</b> — CAP: <b>{row.res_cap || "—"}</b>
      </div>

      <hr style={{ marginTop: 14 }} />

      <h3>Contatti</h3>

      <div className="small" style={{ marginTop: 6 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      {!row.unlocked ? (
        <div style={{ marginTop: 10 }}>
          <div className="small" style={{ opacity: 0.8 }}>
            I contatti sono bloccati. Per sbloccarli consumi <b>1 credito</b>.
          </div>
          <button onClick={unlock} disabled={saving} style={{ marginTop: 10 }}>
            {saving ? "Sblocco..." : "Sblocca contatti (1 credito)"}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          <div className="small">
            Email: <b>{row.contact_email || "—"}</b>
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            Telefono: <b>{row.contact_phone || "—"}</b>
          </div>
        </div>
      )}

      {error && (
        <div className="small" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}

      <hr style={{ marginTop: 14 }} />

      <h3>Curriculum (dati principali)</h3>

      <div className="small" style={{ marginTop: 10 }}>
        <b>Lingue:</b>{" "}
        {languages.length
          ? languages.map((l: any) => l?.name).filter(Boolean).join(", ")
          : "—"}
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        <b>Esperienza pulizie:</b> {wd.exp_cleaning ? "✅" : "—"}
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        <b>Disponibilità trasferte:</b> {wd?.availability?.trips || "—"}
      </div>

      <div className="small" style={{ marginTop: 10, opacity: 0.8 }}>
        (poi lo renderizziamo bene “a sezioni” come hai chiesto: questo è solo il primo step funzionale)
      </div>
    </div>
  );
}
