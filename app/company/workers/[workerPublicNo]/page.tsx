"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type WorkerDetail = {
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

export default function WorkerPublicPage({
  params,
}: {
  params: { workerPublicNo: string };
}) {
  const publicNo = Number(params.workerPublicNo);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      const { data, error } = await supabase.rpc("company_get_worker", {
        p_worker_public_no: publicNo,
      });

      if (error) {
        setRow(null);
        setError(error.message);
        setLoading(false);
        return;
      }

      const first = (data && data[0]) as WorkerDetail | undefined;
      setRow(first ?? null);
      setLoading(false);
    })();
  }, [publicNo]);

  async function unlockContact() {
    setError(null);
    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: publicNo,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // ricarica dettaglio
    const { data } = await supabase.rpc("company_get_worker", {
      p_worker_public_no: publicNo,
    });
    setRow((data && data[0]) ?? null);
  }

  if (loading) return <div className="card">Caricamento...</div>;

  return (
    <div className="card">
      <h2>Operatore</h2>

      {error ? (
        <div className="small" style={{ marginTop: 8 }}>
          {error}
        </div>
      ) : null}

      {!row ? (
        <>
          <div className="small">Operatore non trovato.</div>
          <button
            style={{ marginTop: 12 }}
            onClick={() => (window.location.href = "/company/workers")}
          >
            ← Torna alla lista
          </button>
        </>
      ) : (
        <>
          <div className="small" style={{ marginTop: 8 }}>
            <b>Operatore #{row.worker_public_no}</b> · Livello {row.clean_level} ·{" "}
            {row.profile_status} · Zona: {row.res_province ?? "—"}{" "}
            {row.res_cap ? `(${row.res_cap})` : ""}
          </div>

          <hr style={{ margin: "14px 0" }} />

          <h3>Contatti</h3>
          {row.unlocked ? (
            <div className="small">
              Email: <b>{row.contact_email ?? "—"}</b>
              <br />
              Telefono: <b>{row.contact_phone ?? "—"}</b>
            </div>
          ) : (
            <>
              <div className="small">
                Contatti bloccati. Per vedere email/telefono devi sbloccare.
              </div>
              <button style={{ marginTop: 10 }} onClick={unlockContact}>
                Sblocca contatti (1 credito)
              </button>
            </>
          )}

          <hr style={{ margin: "14px 0" }} />

          <h3>CV (dati strutturati)</h3>
          <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(row.worker_data ?? {}, null, 2)}
          </pre>

          <button
            style={{ marginTop: 12 }}
            onClick={() => (window.location.href = "/company/workers")}
          >
            ← Torna alla lista
          </button>
        </>
      )}
    </div>
  );
}
