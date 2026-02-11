"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type WorkerDetail = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  province: string | null;
  res_cap: string | null;
  worker_data: any;
  contact_unlocked: boolean;
  contact_email: string | null;
  contact_phone: string | null;
};

export default function CompanyWorkerDetailPage({
  params,
}: {
  params: { workerPublicNo: string };
}) {
  const publicNo = Number(params.workerPublicNo);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    (async () => {
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

      await load();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setError(null);

    if (!Number.isFinite(publicNo)) {
      setRow(null);
      setError("ID operatore non valido.");
      return;
    }

    const { data, error } = await supabase.rpc("get_worker_public", {
      p_public_no: publicNo,
    });

    if (error) {
      setRow(null);
      setError(error.message);
      return;
    }

    const first = (data ?? [])[0] as WorkerDetail | undefined;
    if (!first) {
      setRow(null);
      setError("Operatore non trovato.");
      return;
    }

    setRow(first);
  }

  async function unlock() {
    if (!row) return;
    setUnlocking(true);
    setError(null);

    // la tua RPC di unlock (metti il nome corretto che hai già)
    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: row.worker_public_no,
    });

    if (error) {
      setUnlocking(false);
      setError(error.message);
      return;
    }

    // ricarica dettaglio + aggiorna header crediti
    await load();
    window.dispatchEvent(new Event("credits:update"));

    setUnlocking(false);
  }

  if (loading) return <div className="card">Caricamento...</div>;

  return (
    <div className="card">
      <h2>Operatore #{publicNo}</h2>

      {error ? (
        <div className="small" style={{ marginBottom: 10 }}>
          {error}
        </div>
      ) : null}

      {!row ? (
        <button onClick={() => (window.location.href = "/company/workers")}>
          ← Torna alla lista
        </button>
      ) : (
        <>
          <div className="small" style={{ marginBottom: 10 }}>
            Livello: <b>{row.clean_level}</b> · Stato: {row.profile_status} · Zona:{" "}
            {row.province ?? "—"} {row.res_cap ? `(${row.res_cap})` : ""}
          </div>

          <hr />

          <h3>Contatti</h3>
          {row.contact_unlocked ? (
            <div className="small">
              Email: <b>{row.contact_email ?? "—"}</b>
              <br />
              Telefono: <b>{row.contact_phone ?? "—"}</b>
            </div>
          ) : (
            <>
              <div className="small">Contatti bloccati. Per vedere email/telefono devi sbloccare.</div>
              <button onClick={unlock} disabled={unlocking} style={{ marginTop: 10 }}>
                {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
              </button>
            </>
          )}

          <hr />

          <h3>CV (dati strutturati)</h3>
          <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(row.worker_data ?? {}, null, 2)}
          </pre>

          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button onClick={() => (window.location.href = "/company/workers")}>
              ← Torna alla lista
            </button>

            {/* qui poi ci attacchiamo la PROPOSTA */}
            <button onClick={() => (window.location.href = `/company/proposals/new?worker=${row.worker_public_no}`)}>
              Invia proposta
            </button>
          </div>
        </>
      )}
    </div>
  );
}
