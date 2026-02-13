"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type WorkerDetail = {
  worker_public_no: number;
  clean_level: number | null;
  profile_status: string | null;
  res_province: string | null;
  res_cap: string | null;

  contact_unlocked: boolean;
  email: string | null;
  phone: string | null;

  languages: any;
  availability: any;
  environments: any;
  skills: any;
  education: any;
  hobbies: any;
};

export default function WorkerDetailsClient({
  workerPublicNo,
}: {
  workerPublicNo: string;
}) {
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

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

      const { data, error } = await supabase.rpc("company_get_worker", {
        p_worker_public_no: publicNo,
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
        Livello: <b>{row.clean_level ?? "—"}</b> · Stato:{" "}
        <b>{row.profile_status ?? "—"}</b> · Zona:{" "}
        <b>{row.res_province ?? "—"}</b> {row.res_cap ? `(${row.res_cap})` : ""}
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
          Contatti bloccati (per ora).
        </div>
      )}

      <hr />

      <h3>CV</h3>
      <div className="small">
        <b>Lingue</b>: {JSON.stringify(row.languages ?? null)}
        <br />
        <b>Disponibilità</b>: {JSON.stringify(row.availability ?? null)}
        <br />
        <b>Ambienti</b>: {JSON.stringify(row.environments ?? null)}
        <br />
        <b>Skills</b>: {JSON.stringify(row.skills ?? null)}
        <br />
        <b>Formazione</b>: {JSON.stringify(row.education ?? null)}
        <br />
        <b>Extra</b>: {JSON.stringify(row.hobbies ?? null)}
      </div>

      <div style={{ marginTop: 14 }}>
        <Link href="/company/workers">← Torna alla lista</Link>
      </div>
    </div>
  );
}
