"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type WorkerPublic = {
  worker_public_no: number;
  clean_level: number | null;
  province: string | null;

  exp_cleaning: boolean | null;
  work_night: boolean | null;
  work_team: boolean | null;
  work_public_places: boolean | null;
  work_client_contact: boolean | null;

  languages: any;
  availability: any;
  env: any;

  // contatti (solo se sbloccati)
  contact_unlocked: boolean;
  email: string | null;
  phone: string | null;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const workerPublicNo = useMemo(() => Number(params?.workerPublicNo ?? ""), [params]);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(workerPublicNo) || workerPublicNo <= 0) return;

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

      await fetchWorker();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerPublicNo]);

  async function fetchWorker() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("get_worker_public", {
      p_public_no: workerPublicNo,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    const one = Array.isArray(data) ? data[0] : data;
    setRow((one as any) ?? null);
    setLoading(false);
  }

  async function unlock() {
    setUnlocking(true);
    setError(null);

    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: workerPublicNo,
    });

    if (error) {
      setUnlocking(false);
      // Supabase ti passa l’exception come message
      if ((error.message || "").includes("NOT_ENOUGH_CREDITS")) {
        setError("Crediti insufficienti. Acquista un pacchetto crediti.");
        return;
      }
      setError(error.message);
      return;
    }

    setUnlocking(false);
    await fetchWorker();
  }

  if (!Number.isFinite(workerPublicNo) || workerPublicNo <= 0) return <div>Caricamento...</div>;
  if (loading) return <div>Caricamento...</div>;
  if (!row) return <div className="card">Operatore non trovato.</div>;

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Indietro</button>
      </div>

      <hr />

      <div className="small">
        Livello: <b>{row.clean_level ?? "-"}</b>
        {row.province ? <> — Provincia: <b>{row.province}</b></> : null}
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        <b>Preferenze / esperienza</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        {row.exp_cleaning ? "✅ Pulizie" : "—"}{" "}
        {row.work_night ? "✅ Notturno" : "—"}{" "}
        {row.work_team ? "✅ Team" : "—"}{" "}
        {row.work_public_places ? "✅ Luoghi pubblici" : "—"}{" "}
        {row.work_client_contact ? "✅ Clienti" : "—"}
      </div>

      <div className="small" style={{ marginTop: 14 }}>
        <b>Lingue</b>
      </div>
      <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(row.languages ?? [], null, 2)}
      </pre>

      <div className="small" style={{ marginTop: 14 }}>
        <b>Disponibilità</b>
      </div>
      <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(row.availability ?? {}, null, 2)}
      </pre>

      <div className="small" style={{ marginTop: 14 }}>
        <b>Ambienti</b>
      </div>
      <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(row.env ?? {}, null, 2)}
      </pre>

      <hr />

      <div style={{ marginTop: 10 }}>
        <b>Contatti</b>
      </div>

      {row.contact_unlocked ? (
        <div className="small" style={{ marginTop: 8 }}>
          Email: <b>{row.email ?? "-"}</b>
          <br />
          Telefono: <b>{row.phone ?? "-"}</b>
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>
          <div className="small">Contatti nascosti. Sblocca con 1 credito.</div>
          <button onClick={unlock} disabled={unlocking} style={{ marginTop: 8 }}>
            {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
          </button>
        </div>
      )}
    </div>
  );
}
