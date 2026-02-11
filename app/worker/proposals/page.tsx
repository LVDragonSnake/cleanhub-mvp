"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type ProposalRow = {
  id: number;
  status: "sent" | "accepted" | "rejected" | "withdrawn";
  payload: any;
  created_at: string;
  updated_at: string;
  worker_public_no: number;
  company_id: string;
};

export default function WorkerProposalsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProposalRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // blocco se non worker
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "worker") !== "worker") {
        window.location.href = "/dashboard";
        return;
      }

      await load();
      setLoading(false);
    })();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("worker_proposals")
      .select("id,status,payload,created_at,updated_at,worker_public_no,company_id")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setRows((data as any) ?? []);
  }

  async function setStatus(id: number, status: "accepted" | "rejected") {
    setSavingId(id);
    setError(null);

    const { error } = await supabase
      .from("worker_proposals")
      .update({ status })
      .eq("id", id);

    if (error) {
      setSavingId(null);
      setError(error.message);
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSavingId(null);
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Proposte ricevute</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 10, opacity: 0.85 }}>
        Qui vedi le proposte preliminari inviate dalle imprese. Puoi accettare/rifiutare.
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.length === 0 ? (
          <div className="small">Nessuna proposta.</div>
        ) : (
          rows.map((r) => {
            const p = r.payload || {};
            return (
              <div
                key={r.id}
                style={{
                  border: "1px solid #e6e6e6",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <b>Proposta #{r.id}</b>
                <div className="small" style={{ marginTop: 6 }}>
                  Stato: <b>{r.status}</b>
                </div>

                <div className="small" style={{ marginTop: 8 }}>
                  <div>Tipo lavoro: <b>{p.job_type ?? "—"}</b></div>
                  <div>Impegno: <b>{p.hours ?? "—"}</b></div>
                  <div>Contratto: <b>{p.contract_type ?? "—"}</b></div>
                  {p.notes ? <div>Note: <b>{p.notes}</b></div> : null}
                </div>

                {r.status === "sent" ? (
                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    <button onClick={() => setStatus(r.id, "accepted")} disabled={savingId === r.id}>
                      Accetta
                    </button>
                    <button onClick={() => setStatus(r.id, "rejected")} disabled={savingId === r.id}>
                      Rifiuta
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Profilo</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}
