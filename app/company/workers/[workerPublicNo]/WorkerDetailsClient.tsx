// app/company/workers/[workerPublicNo]/WorkerDetailsClient.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type WorkerDetail = {
  worker_public_no: number;
  clean_level: number | null;
  province: string | null;

  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;

  languages: any;
  availability: any;
  env: any;

  contact_unlocked: boolean;
  email: string | null;
  phone: string | null;
};

export default function WorkerDetailsClient({
  workerPublicNo,
}: {
  workerPublicNo: string;
}) {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [unlockErr, setUnlockErr] = useState<string | null>(null);
  const publicNo = Number(workerPublicNo);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      if (!Number.isFinite(publicNo)) {
        setErr("ID operatore non valido.");
        setLoading(false);
        return;
      }

      // 🔎 Dettaglio operatore (RPC)
      const { data, error } = await supabase.rpc("get_worker_public", {
        p_public_no: publicNo,
      });

      if (error) {
        setErr(error.message);
        setRow(null);
      } else {
        const first = Array.isArray(data) ? data[0] : data;
        setRow(first ?? null);
      }

      setLoading(false);
    })();
  }, [publicNo]);

  async function unlock() {
    setUnlockErr(null);

    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: publicNo,
    });

    if (error) {
      setUnlockErr(error.message);
      return;
    }

    // ricarica dettaglio dopo unlock
    const { data, error: e2 } = await supabase.rpc("get_worker_public", {
      p_public_no: publicNo,
    });
    if (e2) {
      setUnlockErr(e2.message);
      return;
    }
    const first = Array.isArray(data) ? data[0] : data;
    setRow(first ?? null);
  }

  if (loading) return <div className="card">Caricamento...</div>;

  if (err)
    return (
      <div className="card">
        <h2>Operatore</h2>
        <div className="small">{err}</div>
        <div style={{ marginTop: 12 }}>
          <Link href="/company/workers">← Torna alla lista</Link>
        </div>
      </div>
    );

  if (!row)
    return (
      <div className="card">
        <h2>Operatore</h2>
        <div className="small">Operatore non trovato.</div>
        <div style={{ marginTop: 12 }}>
          <Link href="/company/workers">← Torna alla lista</Link>
        </div>
      </div>
    );

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      <div className="small" style={{ marginBottom: 10 }}>
        Livello: <b>{row.clean_level ?? "—"}</b> · Zona:{" "}
        <b>{row.province ?? "—"}</b>
      </div>

      <hr />

      <h3>Contatti</h3>
      {row.contact_unlocked ? (
        <div className="small">
          Email: <b>{row.email ?? "—"}</b>
          <br />
          Telefono: <b>{row.phone ?? "—"}</b>
        </div>
      ) : (
        <div className="small">
          Contatti bloccati. Per vedere email/telefono devi sbloccare.
        </div>
      )}

      {!row.contact_unlocked ? (
        <div style={{ marginTop: 10 }}>
          <button onClick={unlock}>Sblocca contatti (1 credito)</button>
          {unlockErr ? (
            <div className="small" style={{ marginTop: 8 }}>
              {unlockErr}
            </div>
          ) : null}
        </div>
      ) : null}

      <hr />

      <h3>CV (dati strutturati)</h3>
      <div className="small">
        <b>Lingue</b>: {JSON.stringify(row.languages ?? [])}
        <br />
        <b>Disponibilità</b>: {JSON.stringify(row.availability ?? {})}
        <br />
        <b>Ambienti</b>: {JSON.stringify(row.env ?? {})}
        <br />
        <b>Skills</b>: pulizie {row.exp_cleaning ? "sì" : "no"} · notturno{" "}
        {row.work_night ? "sì" : "no"} · team {row.work_team ? "sì" : "no"} ·
        luoghi pubblici {row.work_public_places ? "sì" : "no"} · contatto
        clienti {row.work_client_contact ? "sì" : "no"}
      </div>

      <div style={{ marginTop: 14 }}>
        <Link href="/company/workers">← Torna alla lista</Link>
      </div>
    </div>
  );
}
