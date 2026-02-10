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

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<WorkerCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);
  const [minLevel, setMinLevel] = useState<number | "">("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // gate: solo company
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
      p_min_level: minLevel === "" ? null : Number(minLevel),
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

  const chips = useMemo(() => {
    const out: Array<[string, string]> = [];
    if (onlyComplete) out.push(["✅", "Completo"]);
    if (minLevel !== "") out.push(["⭐", `Livello ≥ ${minLevel}`]);
    if (province.trim()) out.push(["📍", province.trim().toUpperCase()]);
    return out;
  }, [onlyComplete, minLevel, province]);

  return (
    <div className="card">
      <h2>Cerca operatori</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Cerca (ID pubblico / provincia / CAP)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <button onClick={load} disabled={loading}>
          {loading ? "Carico..." : "Cerca"}
        </button>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label className="small">
          <input
            type="checkbox"
            checked={onlyComplete}
            onChange={(e) => setOnlyComplete(e.target.checked)}
          />{" "}
          Solo completi
        </label>

        <label className="small">
          Livello minimo{" "}
          <input
            style={{ width: 70 }}
            value={minLevel}
            onChange={(e) => {
              const v = e.target.value;
              setMinLevel(v === "" ? "" : Number(v));
            }}
            placeholder="es. 3"
          />
        </label>

        <label className="small">
          Provincia{" "}
          <input
            style={{ width: 90 }}
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="es. MI"
          />
        </label>
      </div>

      {chips.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {chips.map(([i, t]) => (
            <span
              key={t}
              className="small"
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              {i} {t}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {rows.map((w) => (
          <div
            key={w.worker_public_no}
            style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 800 }}>
                  Operatore #{w.worker_public_no}
                </div>
                <div className="small" style={{ marginTop: 4 }}>
                  Livello: <b>{w.clean_level}</b> · Stato:{" "}
                  <b>{w.profile_status}</b> · Zona:{" "}
                  <b>{(w.res_province || "—").toString().toUpperCase()}</b>{" "}
                  {(w.res_cap ? `(${w.res_cap})` : "")}
                </div>
              </div>

              <button
                onClick={() =>
                  (window.location.href = `/company/workers/${w.worker_public_no}`)
                }
              >
                Apri
              </button>
            </div>

            <div className="small" style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {w.exp_cleaning ? <span>🧽 Pulizie</span> : null}
              {w.work_night ? <span>🌙 Notturno</span> : null}
              {w.work_team ? <span>👥 Team</span> : null}
              {w.work_public_places ? <span>🏢 Luoghi pubblici</span> : null}
              {w.work_client_contact ? <span>🗣️ Contatto clienti</span> : null}
              {!w.exp_cleaning &&
              !w.work_night &&
              !w.work_team &&
              !w.work_public_places &&
              !w.work_client_contact ? <span>—</span> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/company">Dashboard Azienda</a>
        <a href="/profile">Profilo</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}
