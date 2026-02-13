// app/company/workers/[workerPublicNo]/WorkerDetailsClient.tsx
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

  languages: any;
  availability: any;
  skills: any;
  environments: any;
  education: any;
  hobbies: any;
};

type ContactInfo = {
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
  const [contact, setContact] = useState<ContactInfo>({
    contact_unlocked: false,
    email: null,
    phone: null,
  });

  const [err, setErr] = useState<string | null>(null);
  const [unlockErr, setUnlockErr] = useState<string | null>(null);

  const publicNo = Number(workerPublicNo);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setUnlockErr(null);

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

      // 1) Dettaglio operatore (NUOVA RPC: company_get_worker)
      const { data, error } = await supabase.rpc("company_get_worker", {
        p_worker_public_no: publicNo,
      });

      if (error) {
        setErr(error.message);
        setRow(null);
        setLoading(false);
        return;
      }

      const first = Array.isArray(data) ? data[0] : data;
      setRow((first ?? null) as WorkerDetail | null);

      // 2) Contatti (se hai la RPC, proviamo a leggerli; se non esiste, ignoriamo)
      //    Nome più probabile: retrieve_worker_contact_if_unlocked
      try {
        const { data: cData, error: cErr } = await supabase.rpc(
          "retrieve_worker_contact_if_unlocked",
          { p_public_no: publicNo }
        );

        if (!cErr) {
          const cFirst = Array.isArray(cData) ? cData[0] : cData;

          setContact({
            contact_unlocked: Boolean(cFirst?.contact_unlocked ?? false),
            email: cFirst?.email ?? null,
            phone: cFirst?.phone ?? null,
          });
        } else {
          // se la RPC non esiste / non accessibile, non blocchiamo la pagina
          setContact({ contact_unlocked: false, email: null, phone: null });
        }
      } catch {
        setContact({ contact_unlocked: false, email: null, phone: null });
      }

      setLoading(false);
    })();
  }, [publicNo]);

  async function reloadAfterUnlock() {
    // ricarica dettaglio operatore
    const { data, error } = await supabase.rpc("company_get_worker", {
      p_worker_public_no: publicNo,
    });

    if (error) {
      setUnlockErr(error.message);
      return;
    }

    const first = Array.isArray(data) ? data[0] : data;
    setRow((first ?? null) as WorkerDetail | null);

    // ricarica contatti (se esiste)
    try {
      const { data: cData, error: cErr } = await supabase.rpc(
        "retrieve_worker_contact_if_unlocked",
        { p_public_no: publicNo }
      );

      if (!cErr) {
        const cFirst = Array.isArray(cData) ? cData[0] : cData;
        setContact({
          contact_unlocked: Boolean(cFirst?.contact_unlocked ?? false),
          email: cFirst?.email ?? null,
          phone: cFirst?.phone ?? null,
        });
      }
    } catch {
      // ignora
    }
  }

  async function unlock() {
    setUnlockErr(null);

    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: publicNo,
    });

    if (error) {
      setUnlockErr(error.message);
      return;
    }

    await reloadAfterUnlock();
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
        Livello: <b>{row.clean_level ?? "—"}</b> · Stato:{" "}
        <b>{row.profile_status ?? "—"}</b> · Zona:{" "}
        <b>
          {row.res_province ?? "—"} {row.res_cap ? `(${row.res_cap})` : ""}
        </b>
      </div>

      <hr />

      <h3>Contatti</h3>
      {contact.contact_unlocked ? (
        <div className="small">
          Email: <b>{contact.email ?? "—"}</b>
          <br />
          Telefono: <b>{contact.phone ?? "—"}</b>
        </div>
      ) : (
        <div className="small">
          Contatti bloccati. Per vedere email/telefono devi sbloccare.
        </div>
      )}

      {!contact.contact_unlocked ? (
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
        <b>Lingue</b>: {JSON.stringify(row.languages ?? null)}
        <br />
        <b>Disponibilità</b>: {JSON.stringify(row.availability ?? null)}
        <br />
        <b>Skills</b>: {JSON.stringify(row.skills ?? null)}
        <br />
        <b>Ambienti</b>: {JSON.stringify(row.environments ?? null)}
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
