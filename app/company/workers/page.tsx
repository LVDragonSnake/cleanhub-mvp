"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Row = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string;
  has_car: boolean;
  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(false);
  const [minLevel, setMinLevel] = useState("0");

  const minLevelNum = useMemo(() => {
    const n = Number(minLevel);
    return Number.isFinite(n) ? n : 0;
  }, [minLevel]);

  useEffect(() => {
    (async () => {
      setError(null);

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

      await runSearch();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch() {
    setError(null);

    const { data, error } = await supabase.rpc("search_workers_public", {
      p_query: q.trim(),
      p_only_complete: onlyComplete,
      p_min_level: minLevelNum,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setRows((data as any) ?? []);
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Operatori</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <label>Cerca (numero o provincia)</label>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Es: 120 oppure MI" />
      </div>

      <div className="chkRow" style={{ marginTop: 10 }}>
        <input type="checkbox" checked={onlyComplete} onChange={(e) => setOnlyComplete(e.target.checked)} />
        <span>Solo profili completi</span>
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Livello minimo</label>
        <input value={minLevel} onChange={(e) => setMinLevel(e.target.value)} />
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={runSearch}>Cerca</button>
      </div>

      <hr />

      {rows.length === 0 ? (
        <div className="small">Nessun operatore trovato.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((r) => (
            <div
              key={r.worker_public_no}
              style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}
            >
              <b>Operatore #{String(r.worker_public_no).padStart(6, "0")}</b>

              <div className="small" style={{ marginTop: 6 }}>
                Livello: <b>{r.clean_level}</b> — Stato profilo: <b>{r.profile_status}</b>
              </div>

              <div className="small" style={{ marginTop: 6 }}>
                Provincia: <b>{r.res_province || "—"}</b> — Automunito: <b>{r.has_car ? "Sì" : "No"}</b>
              </div>

              <div className="small" style={{ marginTop: 6 }}>
                Pulizie: {r.exp_cleaning ? "✅" : "—"} | Notte: {r.work_night ? "✅" : "—"} | Team:{" "}
                {r.work_team ? "✅" : "—"} | Pubblico: {r.work_public_places ? "✅" : "—"} | Clienti:{" "}
                {r.work_client_contact ? "✅" : "—"}
              </div>

              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() =>
                    (window.location.href = `/company/workers/${encodeURIComponent(String(r.worker_public_no))}`)
                  }
                >
                  Vedi profilo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Profilo</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}
