"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type Detail = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string;
  has_car: boolean;

  citizenship: string;
  driving_license: string;

  languages: any[];
  env: any;
  training: any;
  availability: any;
  extra: any;
};

type Contact = {
  worker_id: string;
  email: string | null;
  phone: string | null;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const workerPublicNo = useMemo(() => Number(params?.workerPublicNo ?? ""), [params]);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [credits, setCredits] = useState<number | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(workerPublicNo) || workerPublicNo <= 0) return;

    (async () => {
      setError(null);
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // check tipo utente
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      // 1) crediti
      const { data: cData, error: cErr } = await supabase.rpc("get_company_credits");
      if (cErr) {
        setError(cErr.message);
        setLoading(false);
        return;
      }
      setCredits((cData as any) ?? 0);

      // 2) dettaglio pubblico (safe)
      const { data: dData, error: dErr } = await supabase.rpc("get_worker_public_detail", {
        p_worker_public_no: workerPublicNo,
      });

      if (dErr) {
        setError(dErr.message);
        setLoading(false);
        return;
      }

      const detail = ((dData as any)?.[0] as Detail) ?? null;
      setRow(detail);

      // 3) contatti solo se già sbloccati (se no torna vuoto)
      const { data: ctData, error: ctErr } = await supabase.rpc("get_worker_contact_if_unlocked", {
        p_worker_public_no: workerPublicNo,
      });

      if (ctErr) {
        setError(ctErr.message);
        setLoading(false);
        return;
      }

      const ct = ((ctData as any)?.[0] as Contact) ?? null;
      setContact(ct);

      setLoading(false);
    })();
  }, [workerPublicNo]);

  async function unlock() {
    if (!row) return;

    setUnlocking(true);
    setError(null);

    try {
      // Se contatti già presenti, non fare nulla
      if (contact?.worker_id) {
        setUnlocking(false);
        return;
      }

      // Risolvo worker_id dal DB usando worker_public_no (server-side sarebbe meglio,
      // ma qui facciamo una query safe: prendo worker_id tramite RPC contatti (che se non sbloccato non torna)
      // quindi qui serve una mini RPC “resolver”: invece usiamo una query diretta SOLO sull’id:
      // Per evitare di leggere campi sensibili, seleziono solo "id" e filtro su worker_public_no.
      const { data: idRow, error: idErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_type", "worker")
        .eq("worker_public_no", workerPublicNo)
        .single();

      if (idErr) {
        setUnlocking(false);
        setError(idErr.message);
        return;
      }

      const workerId = (idRow as any)?.id as string;
      if (!workerId) {
        setUnlocking(false);
        setError("Operatore non trovato.");
        return;
      }

      // Chiama la tua funzione: scala 1 credito e registra unlock
      const { error: uErr } = await supabase.rpc("unlock_worker_contact", {
        p_worker_id: workerId,
      });

      if (uErr) {
        setUnlocking(false);
        // messaggio chiaro
        if ((uErr.message || "").includes("NOT_ENOUGH_CREDITS")) {
          setError("Crediti insufficienti.");
        } else {
          setError(uErr.message);
        }
        return;
      }

      // Ricarico crediti + contatti
      const { data: cData } = await supabase.rpc("get_company_credits");
      setCredits((cData as any) ?? 0);

      const { data: ctData } = await supabase.rpc("get_worker_contact_if_unlocked", {
        p_worker_public_no: workerPublicNo,
      });

      const ct = ((ctData as any)?.[0] as Contact) ?? null;
      setContact(ct);

      setUnlocking(false);
    } catch (e: any) {
      setUnlocking(false);
      setError(e?.message ?? "Errore unlock.");
    }
  }

  if (!Number.isFinite(workerPublicNo) || workerPublicNo <= 0) return <div>Operatore non valido.</div>;
  if (loading) return <div>Caricamento...</div>;
  if (!row) return <div className="card">Operatore non trovato.</div>;

  const isUnlocked = !!contact?.worker_id;

  return (
    <div className="card">
      <h2>Operatore #{String(row.worker_public_no).padStart(6, "0")}</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Crediti disponibili: <b>{credits ?? 0}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{row.clean_level}</b> — Stato: <b>{row.profile_status}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Provincia: <b>{row.res_province || "—"}</b> — Automunito: <b>{row.has_car ? "Sì" : "No"}</b>
      </div>

      <hr />

      <h3>Contatti</h3>
      {isUnlocked ? (
        <div className="small">
          Email: <b>{contact?.email ?? "—"}</b>
          <br />
          Telefono: <b>{contact?.phone ?? "—"}</b>
        </div>
      ) : (
        <>
          <div className="small">Contatti bloccati 🔒</div>
          <div style={{ marginTop: 10 }}>
            <button onClick={unlock} disabled={unlocking}>
              {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
            </button>
          </div>
        </>
      )}

      <hr />

      <h3>Documenti (safe)</h3>
      <div className="small">
        Cittadinanza: <b>{row.citizenship || "—"}</b>
      </div>
      <div className="small">
        Patente: <b>{row.driving_license || "—"}</b>
      </div>

      <hr />

      <h3>Lingue</h3>
      <div className="small">
        {(row.languages || []).length === 0
          ? "—"
          : (row.languages || []).map((l: any, i: number) => (
              <span key={i} style={{ marginRight: 8 }}>
                <b>{l?.name ?? "—"}</b>
              </span>
            ))}
      </div>

      <hr />

      <h3>Esperienza / ambienti</h3>
      <pre style={{ fontSize: 12, background: "#f7f7f7", padding: 10, borderRadius: 10, overflow: "auto" }}>
        {JSON.stringify(row.env ?? {}, null, 2)}
      </pre>

      <h3>Formazione</h3>
      <pre style={{ fontSize: 12, background: "#f7f7f7", padding: 10, borderRadius: 10, overflow: "auto" }}>
        {JSON.stringify(row.training ?? {}, null, 2)}
      </pre>

      <h3>Disponibilità</h3>
      <pre style={{ fontSize: 12, background: "#f7f7f7", padding: 10, borderRadius: 10, overflow: "auto" }}>
        {JSON.stringify(row.availability ?? {}, null, 2)}
      </pre>

      <h3>Extra</h3>
      <pre style={{ fontSize: 12, background: "#f7f7f7", padding: 10, borderRadius: 10, overflow: "auto" }}>
        {JSON.stringify(row.extra ?? {}, null, 2)}
      </pre>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Indietro</button>
      </div>
    </div>
  );
}
