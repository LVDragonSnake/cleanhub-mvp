"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type WorkerRow = {
  worker_public_no: number;
  clean_level: number | null;
  exp_cleaning: boolean | null;
  work_night: boolean | null;
  work_team: boolean | null;
  work_public_places: boolean | null;
  work_client_contact: boolean | null;
  province: string | null;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<WorkerRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // filtri base (poi li estendiamo)
  const [minLevel, setMinLevel] = useState("");
  const [province, setProvince] = useState("");

  const filters = useMemo(
    () => ({
      minLevel: minLevel.trim() ? Number(minLevel) : null,
      province: province.trim() ? province.trim() : null,
    }),
    [minLevel, province]
  );

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // controllo user_type=company
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      setLoading(false);
      await loadWorkers(filters.minLevel, filters.province);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWorkers(pMinLevel: number | null, pProvince: string | null) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("list_workers_public", {
      p_min_level: pMinLevel,
      p_province: pProvince,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    setRows((data as any) ?? []);
    setLoading(false);
  }

  async function onApplyFilters() {
    await loadWorkers(filters.minLevel, filters.province);
  }

  return (
    <div className="card">
      <h2>Operatori</h2>

      <div className="small" style={{ marginTop: 8 }}>
        Lista operatori (dati pubblici). I contatti si sbloccano con crediti.
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ minWidth: 160 }}>
          <label>Livello minimo</label>
          <input value={minLevel} onChange={(e) => setMinLevel(e.target.value)} placeholder="es. 3" />
        </div>

        <div style={{ minWidth: 200 }}>
          <label>Provincia (sigla)</label>
          <input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="es. MI" />
        </div>

        <div style={{ alignSelf: "end" }}>
          <button onClick={onApplyFilters} disabled={loading}>
            {loading ? "Carico..." : "Applica filtri"}
          </button>
        </div>
      </div>

      <hr />

      {loading ? (
        <div>Caricamento...</div>
      ) : rows.length === 0 ? (
        <div className="small">Nessun operatore trovato.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rows.map((w) => (
            <div
              key={w.worker_public_no}
              style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <b>Operatore #{w.worker_public_no}</b>
                  <div className="small" style={{ marginTop: 6 }}>
                    Livello: <b>{w.clean_level ?? "-"}</b>
                    {w.province ? <> — Provincia: <b>{w.province}</b></> : null}
                  </div>

                  <div className="small" style={{ marginTop: 6 }}>
                    {w.exp_cleaning ? "✅ Pulizie" : "—"}{" "}
                    {w.work_night ? "✅ Notturno" : "—"}{" "}
                    {w.work_team ? "✅ Team" : "—"}{" "}
                    {w.work_public_places ? "✅ Luoghi pubblici" : "—"}{" "}
                    {w.work_client_contact ? "✅ Clienti" : "—"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    onClick={() =>
                      (window.location.href = `/company/workers/${encodeURIComponent(
                        String(w.worker_public_no)
                      )}`)
                    }
                  >
                    Vedi profilo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/company">Company</a>
        <a href="/company/jobs">Jobs</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Profilo</a>
      </div>
    </div>
  );
}
