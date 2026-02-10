"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type WorkerCard = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string | null;
  res_cap: string | null;

  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;
};

function badge(text: string) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        border: "1px solid #e6e6e6",
        borderRadius: 999,
        fontSize: 12,
        marginRight: 6,
        marginTop: 6,
      }}
    >
      {text}
    </span>
  );
}

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<WorkerCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  // filtri
  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);
  const [minLevel, setMinLevel] = useState<number | "">("");
  const [province, setProvince] = useState("");

  const minLevelInt = useMemo(() => (minLevel === "" ? null : Number(minLevel)), [minLevel]);

  useEffect(() => {
    (async () => {
      // auth + blocco se non company
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
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("company_list_workers", {
      p_q: q.trim() || null,
      p_only_complete: onlyComplete,
      p_min_level: minLevelInt,
      p_province: province.trim() || null,
    });

    if (error) {
      setError(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as any) ?? []);
    setLoading(false);
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Cerca operatori</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        <div>
          <label>Cerca (ID pubblico / provincia / CAP)</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="es. 1042 o MI o 20100" />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={onlyComplete}
              onChange={(e) => setOnlyComplete(e.target.checked)}
            />
            Solo profili completi
          </label>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="small">Livello minimo</span>
            <input
              style={{ width: 90 }}
              value={minLevel}
              onChange={(e) => {
                const v = e.target.value;
                setMinLevel(v === "" ? "" : Number(v));
              }}
              type="number"
              min={1}
              placeholder="1"
            />
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="small">Provincia</span>
            <input
              style={{ width: 90 }}
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="MI"
            />
          </div>

          <button onClick={load}>Filtra</button>
          <button onClick={() => (window.location.href = "/company")}>← Dashboard azienda</button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        {rows.length === 0 ? (
          <div className="small">Nessun risultato.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {rows.map((w) => {
              const code = `Operatore #${w.worker_public_no}`;
              const zone = `${w.res_province ?? "—"} • ${w.res_cap ?? "—"}`;
              const status = w.profile_status === "complete" ? "✅ completo" : "⏳ incompleto";

              return (
                <div
                  key={w.worker_public_no}
                  style={{
                    border: "1px solid #e6e6e6",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ minWidth: 260 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{code}</div>
                    <div className="small" style={{ marginTop: 4 }}>
                      Livello: <b>{w.clean_level ?? 1}</b> — {status}
                    </div>
                    <div className="small" style={{ marginTop: 4 }}>
                      Zona: <b>{zone}</b>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      {w.exp_cleaning ? badge("Esperienza pulizie") : null}
                      {w.work_night ? badge("Notturno") : null}
                      {w.work_team ? badge("Team") : null}
                      {w.work_public_places ? badge("Luoghi pubblici") : null}
                      {w.work_client_contact ? badge("Contatto clienti") : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={() =>
                        (window.location.href = `/company/workers/${encodeURIComponent(
                          String(w.worker_public_no)
                        )}`)
                      }
                    >
                      Vedi dettaglio
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
