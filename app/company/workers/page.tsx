"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type WorkerRow = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string | null;
  res_cap: string | null;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<WorkerRow[]>([]);
  const [q, setQ] = useState("");
  const [minLevel, setMinLevel] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Checkbox "solo completi" tolto (come hai chiesto)
  const onlyComplete = false;

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

      await load();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setError(null);

    const min = minLevel.trim() ? Number(minLevel.trim()) : null;
    const prov = province.trim() ? province.trim() : null;
    const query = q.trim() ? q.trim() : null;

    const { data, error } = await supabase.rpc("company_list_workers", {
      p_q: query,
      p_only_complete: onlyComplete,
      p_min_level: Number.isFinite(min as any) ? (min as number) : null,
      p_province: prov,
    });

    if (error) {
      setRows([]);
      setError(error.message);
      return;
    }

    setRows((data || []) as WorkerRow[]);
  }

  if (loading) return <div className="card">Caricamento...</div>;

  return (
    <div className="card">
      <h2>Cerca operatori</h2>

      {error ? (
        <div className="small" style={{ marginTop: 8 }}>
          {error}
        </div>
      ) : null}

      <div className="small" style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <input
          placeholder="Cerca (ID pubblico / provincia / CAP)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            style={{ width: 140 }}
            placeholder="Livello min (es. 3)"
            value={minLevel}
            onChange={(e) => setMinLevel(e.target.value)}
          />
          <input
            style={{ width: 140 }}
            placeholder="Provincia (es. MI)"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          />
          <button onClick={load}>Cerca</button>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {rows.length === 0 ? (
          <div className="small">Nessun risultato.</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.worker_public_no}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Operatore #{r.worker_public_no}</div>
                <div className="small">
                  Livello: {r.clean_level} · Stato: {r.profile_status} · Zona:{" "}
                  {r.res_province ?? "—"} {r.res_cap ? `(${r.res_cap})` : ""}
                </div>
              </div>

              <button
                onClick={() =>
                  (window.location.href = `/company/workers/${r.worker_public_no}`)
                }
              >
                Apri
              </button>
            </div>
          ))
        )}
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/company">Dashboard Azienda</a>
        <a href="/profile">Profilo</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}
