"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Row = {
  worker_id: string;
  worker_public_no: number;
  clean_level: number;
  province: string | null;
  has_car: boolean;
  unlocked: boolean;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  // filtri base (li miglioriamo dopo)
  const [levelMin, setLevelMin] = useState("");
  const [province, setProvince] = useState("");

  const params = useMemo(() => {
    return {
      p_level_min: levelMin.trim() ? Number(levelMin) : null,
      p_level_max: null,
      p_province: province.trim() ? province.trim() : null,
    };
  }, [levelMin, province]);

  async function load() {
    setError(null);
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      window.location.href = "/login";
      return;
    }

    // controllo company
    const { data: prof } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", auth.user.id)
      .single();

    if ((prof?.user_type ?? "") !== "company") {
      window.location.href = "/dashboard";
      return;
    }

    const { data, error } = await supabase.rpc("company_list_workers", params);
    if (error) {
      setError(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Ricerca operatori</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div className="small">Livello minimo</div>
          <input
            value={levelMin}
            onChange={(e) => setLevelMin(e.target.value)}
            placeholder="es. 3"
            style={{ width: 120 }}
          />
        </div>

        <div>
          <div className="small">Provincia (sigla)</div>
          <input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="es. MI"
            style={{ width: 120 }}
          />
        </div>

        <div style={{ alignSelf: "end" }}>
          <button onClick={load}>Cerca</button>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {rows.length === 0 ? (
          <div className="small">Nessun operatore trovato.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => (
              <div
                key={r.worker_id}
                style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <b>Operatore #{r.worker_public_no}</b>
                    <div className="small" style={{ marginTop: 4 }}>
                      Livello: <b>{r.clean_level}</b>
                      {" · "}
                      Provincia: <b>{r.province || "—"}</b>
                      {" · "}
                      Automunito: <b>{r.has_car ? "Sì" : "No"}</b>
                    </div>
                  </div>

                  <div>
                    {r.unlocked ? <span>✅ Contatti sbloccati</span> : <span>🔒 Contatti bloccati</span>}
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() =>
                      (window.location.href = `/company/workers/${encodeURIComponent(
                        String(r.worker_public_no)
                      )}`)
                    }
                  >
                    Vedi profilo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <button onClick={() => (window.location.href = "/company")}>← Dashboard azienda</button>
      </div>
    </div>
  );
}
