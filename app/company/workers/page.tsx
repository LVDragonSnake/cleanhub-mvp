"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Row = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string | null;
  res_cap: string | null;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);

  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

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

      await loadCredits();
      await loadWorkers();

      setLoading(false);
    })();
  }, []);

  async function loadCredits() {
    // RLS: l'azienda vede solo la sua riga
    const { data, error } = await supabase
      .from("company_credits")
      .select("credits")
      .single();

    // se non esiste riga -> crediti 0 (non è un errore "grave")
    if (error) {
      setCredits(0);
      return;
    }
    setCredits(Number((data as any)?.credits ?? 0));
  }

  async function loadWorkers() {
    setError(null);

    const { data, error } = await supabase.rpc("company_list_workers", {
      p_q: q.trim() ? q.trim() : null,
      p_only_complete: onlyComplete,
    });

    if (error) {
      setError(error.message);
      setRows([]);
      return;
    }

    setRows((data as any) ?? []);
  }

  const subtitle = useMemo(() => {
    return `Crediti: ${credits} • Risultati: ${rows.length}`;
  }, [credits, rows.length]);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Operatori</h2>
      <div className="small" style={{ marginTop: 6 }}>{subtitle}</div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          placeholder="Cerca (ID pubblico / provincia / CAP)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <button onClick={loadWorkers}>Cerca</button>

        <label className="small" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={onlyComplete}
            onChange={(e) => setOnlyComplete(e.target.checked)}
          />
          Solo completi
        </label>

        <button onClick={() => (window.location.href = "/company")} style={{ marginLeft: "auto" }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {rows.length === 0 ? (
          <div className="small">Nessun operatore trovato.</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.worker_public_no}
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>
                  Operatore #{r.worker_public_no}
                </div>
                <div className="small" style={{ marginTop: 4 }}>
                  Livello: <b>{r.clean_level ?? 1}</b> • Stato:{" "}
                  <b>{r.profile_status}</b>
                </div>
                <div className="small" style={{ marginTop: 4 }}>
                  Zona: <b>{r.res_province ?? "—"}</b> • CAP: <b>{r.res_cap ?? "—"}</b>
                </div>
              </div>

              <button onClick={() => (window.location.href = `/company/workers/${r.worker_public_no}`)}>
                Apri profilo →
              </button>
            </div>
          ))
        )}
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Profilo</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}
