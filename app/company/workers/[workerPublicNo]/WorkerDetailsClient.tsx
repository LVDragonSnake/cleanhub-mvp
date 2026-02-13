"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type WorkerDetail = {
  worker_public_no: number;
  clean_level: number | null;
  profile_status: string | null;
  province: string | null;

  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;

  languages: any;
  availability: any;
  environments: any;
  skills: any;
  education: any;
  hobbies: any;

  contact_unlocked: boolean;
  email: string | null;
  phone: string | null;
};

export default function WorkerDetailsClient({ workerPublicNo }: { workerPublicNo: string }) {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [unlockErr, setUnlockErr] = useState<string | null>(null);

  const publicNo = Number(workerPublicNo);

  async function load() {
    setErr(null);

    if (!Number.isFinite(publicNo)) {
      setErr("ID operatore non valido.");
      setRow(null);
      return;
    }

    const { data, error } = await supabase.rpc("company_get_worker", {
      p_worker_public_no: publicNo,
    });

    if (error) {
      setErr(error.message);
      setRow(null);
      return;
    }

    const first = Array.isArray(data) ? data[0] : data;
    setRow((first ?? null) as any);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }
      await load();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    await load();
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
        Livello: <b>{row.clean_level ?? "—"}</b> · Stato: <b>{row.profile_status ?? "—"}</b> · Zona:{" "}
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
        <div className="small">Contatti bloccati. Per vedere email/telefono devi sbloccare.</div>
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

      <h3>CV</h3>
      <div className="small">
        <b>Lingue</b>: {JSON.stringify(row.languages ?? [])}
        <br />
        <b>Disponibilità</b>: {JSON.stringify(row.availability ?? {})}
        <br />
        <b>Ambienti</b>: {JSON.stringify(row.environments ?? {})}
        <br />
        <b>Skills</b>: {JSON.stringify(row.skills ?? {})}
        <br />
        <b>Formazione</b>: {JSON.stringify(row.education ?? {})}
        <br />
        <b>Extra</b>: {JSON.stringify(row.hobbies ?? {})}
        <br />
        <br />
        pulizie {row.exp_cleaning ? "sì" : "no"} · notturno {row.work_night ? "sì" : "no"} · team{" "}
        {row.work_team ? "sì" : "no"} · luoghi pubblici {row.work_public_places ? "sì" : "no"} · contatto clienti{" "}
        {row.work_client_contact ? "sì" : "no"}
      </div>

      <div style={{ marginTop: 14 }}>
        <Link href="/company/workers">← Torna alla lista</Link>
      </div>
    </div>
  );
}
