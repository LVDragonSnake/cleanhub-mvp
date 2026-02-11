"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type WorkerDetail = {
  worker_public_no: number;
  clean_level: number;
  province: string | null;
  contact_unlocked: boolean;
  email: string | null;
  phone: string | null;
  languages: any[];
  availability: any;
  env: any;

  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const publicNo = useMemo(() => Number(params?.workerPublicNo || 0), [params]);

  const [loading, setLoading] = useState(true);
  const [meOk, setMeOk] = useState(false);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Proposta preliminare (form guidato)
  const [jobType, setJobType] = useState("");
  const [hours, setHours] = useState("");
  const [contractType, setContractType] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sentOk, setSentOk] = useState(false);

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

      setMeOk(true);
    })();
  }, []);

  useEffect(() => {
    if (!meOk) return;
    if (!publicNo) return;

    (async () => {
      setLoading(true);
      setError(null);

      // RPC già esistente nel tuo sistema: get_worker_public(p_public_no)
      const { data, error } = await supabase.rpc("get_worker_public", {
        p_public_no: publicNo,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const r = Array.isArray(data) ? data[0] : null;
      setRow((r as any) ?? null);
      setLoading(false);
    })();
  }, [meOk, publicNo]);

  async function unlock() {
    if (!publicNo) return;
    setError(null);

    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: publicNo,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // ricarico dettaglio
    const { data: d2, error: e2 } = await supabase.rpc("get_worker_public", {
      p_public_no: publicNo,
    });
    if (!e2) {
      const r2 = Array.isArray(d2) ? d2[0] : null;
      setRow((r2 as any) ?? null);
    }
  }

  async function sendProposal() {
    if (!publicNo) return;

    setError(null);
    setSentOk(false);

    if (!jobType.trim()) {
      setError("Seleziona il tipo di lavoro.");
      return;
    }
    if (!hours.trim()) {
      setError("Indica l'impegno orario (es. 20 ore/settimana).");
      return;
    }

    setSending(true);

    const payload = {
      job_type: jobType.trim(),
      hours: hours.trim(),
      contract_type: contractType.trim() || null,
      notes: notes.trim() || null,
      created_from: "company_worker_detail_v1",
    };

    const { data, error } = await supabase.rpc("company_send_proposal", {
      p_public_no: publicNo,
      p_payload: payload,
    });

    if (error) {
      setSending(false);
      setError(error.message);
      return;
    }

    setSending(false);
    setSentOk(true);

    // pulizia form (facoltativo)
    setJobType("");
    setHours("");
    setContractType("");
    setNotes("");
  }

  if (!publicNo) return <div>Caricamento...</div>;
  if (loading) return <div>Caricamento...</div>;
  if (!row) return <div>Operatore non trovato.</div>;

  const zone = [row.province].filter(Boolean).join(" ");

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{row.clean_level ?? 1}</b> · Zona: <b>{zone || "—"}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {/* CONTATTI */}
      <hr style={{ margin: "14px 0" }} />
      <h3>Contatti</h3>

      {row.contact_unlocked ? (
        <div className="small" style={{ marginTop: 6 }}>
          Email: <b>{row.email ?? "—"}</b>
          <br />
          Telefono: <b>{row.phone ?? "—"}</b>
        </div>
      ) : (
        <>
          <div className="small" style={{ marginTop: 6 }}>
            Contatti bloccati. Per vedere email/telefono devi sbloccare (1 credito).
          </div>
          <button style={{ marginTop: 10 }} onClick={unlock}>
            Sblocca contatti (1 credito)
          </button>
        </>
      )}

      {/* PROPOSTA PRELIMINARE */}
      <hr style={{ margin: "14px 0" }} />
      <h3>Proposta preliminare (prima dello sblocco)</h3>

      <div className="small" style={{ marginTop: 6, opacity: 0.85 }}>
        Serve per capire la disponibilità dell’operatore senza consumare crediti.
        Puoi comunque sbloccare i contatti quando vuoi.
      </div>

      <label style={{ marginTop: 10 }}>Tipo lavoro *</label>
      <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
        <option value="">—</option>
        <option value="pulizie_hotel">Pulizie Hotel</option>
        <option value="pulizie_uffici">Pulizie Uffici</option>
        <option value="pulizie_case_private">Pulizie Case private</option>
        <option value="pulizie_industriali">Pulizie Industriali</option>
        <option value="altro">Altro</option>
      </select>

      <label>Impegno orario *</label>
      <input
        placeholder="es. 20 ore/settimana, turni notturni, ecc."
        value={hours}
        onChange={(e) => setHours(e.target.value)}
      />

      <label>Tipo contratto (opzionale)</label>
      <input
        placeholder="es. tempo determinato, indeterminato, collaborazione..."
        value={contractType}
        onChange={(e) => setContractType(e.target.value)}
      />

      <label>Note (opzionale)</label>
      <textarea
        placeholder="Dettagli utili: luogo, orari, richieste, ecc."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={sendProposal} disabled={sending}>
          {sending ? "Invio..." : "Invia proposta"}
        </button>
        {sentOk && (
          <span className="small" style={{ marginLeft: 10 }}>
            ✅ Proposta inviata
          </span>
        )}
      </div>

      {/* CV (dati strutturati che già mostri) */}
      <hr style={{ margin: "14px 0" }} />
      <h3>CV (dati strutturati)</h3>

      <div className="small" style={{ marginTop: 6 }}>
        <b>Lingue</b>
        <div>{(row.languages || []).map((l: any) => l?.name).filter(Boolean).join(", ") || "—"}</div>

        <div style={{ marginTop: 10 }}>
          <b>Esperienza / Skills</b>
          <div>
            Pulizie: {row.exp_cleaning ? "Sì" : "No"} · Notturno: {row.work_night ? "Sì" : "No"} · Team:{" "}
            {row.work_team ? "Sì" : "No"} · Luoghi pubblici: {row.work_public_places ? "Sì" : "No"} ·
            Contatto clienti: {row.work_client_contact ? "Sì" : "No"}
          </div>
        </div>
      </div>

      <button style={{ marginTop: 14 }} onClick={() => (window.location.href = "/company/workers")}>
        ← Torna alla lista
      </button>
    </div>
  );
}
