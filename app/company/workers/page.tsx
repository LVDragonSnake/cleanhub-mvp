"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type WorkerCard = {
  worker_public_no: number;
  clean_level: number | null;
  profile_status: string | null;
  res_province: string | null;
  res_cap: string | null;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);

  const [credits, setCredits] = useState<number>(0);

  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);
  const [minLevel, setMinLevel] = useState<string>("");
  const [province, setProvince] = useState<string>("");

  const [rows, setRows] = useState<WorkerCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // ✅ blocco se non company
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      // crediti
      try {
        const res = await fetch("/api/company/credits");
        const json = await res.json();
        setCredits(Number(json.credits ?? 0));
      } catch {
        setCredits(0);
      }

      await loadWorkers();

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWorkers() {
    setError(null);

    try {
      const res = await fetch(
        `/api/company/search-workers?q=${encodeURIComponent(q)}&complete=${onlyComplete ? "1" : "0"}`
      );
      const json = await res.json();
      const list = (json.rows || []) as WorkerCard[];

      // filtri extra lato client (semplici e sicuri)
      const minL = Number(minLevel);
      const prov = province.trim().toLowerCase();

      const filtered = list.filter((r) => {
        if (Number.isFinite(minL) && minLevel.trim() !== "") {
          if ((r.clean_level ?? 1) < minL) return false;
        }
        if (prov) {
          const rp = (r.res_province ?? "").toLowerCase();
          if (!rp.includes(prov)) return false;
        }
        return true;
      });

      setRows(filtered);
    } catch (e: any) {
      setError(e?.message || "Errore caricamento operatori");
      setRows([]);
    }
  }

  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (onlyComplete) parts.push("solo completi");
    if (minLevel.trim()) parts.push(`livello ≥ ${minLevel.trim()}`);
    if (province.trim()) parts.push(`provincia ~ ${province.trim()}`);
    if (q.trim()) parts.push(`ricerca: "${q.trim()}"`);
    return parts.length ? parts.join(" · ") : "tutti";
  }, [onlyComplete, minLevel, province, q]);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Cerca operatori</h2>

      <div className="small" style={{ marginTop: 8, opacity: 0.9 }}>
        Crediti: <b>{credits}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <input
          placeholder="Cerca (ID pubblico / provincia / CAP)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={loadWorkers} style={{ marginTop: 8 }}>
          Cerca
        </button>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label className="small">
          <input
            type="checkbox"
            checked={onlyComplete}
            onChange={(e) => setOnlyComplete(e.target.checked)}
          />{" "}
          Solo completi
        </label>

        <div className="small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Livello minimo</span>
          <input
            value={minLevel}
            onChange={(e) => setMinLevel(e.target.value)}
            placeholder="es. 3"
            style={{ width: 80 }}
          />
        </div>

        <div className="small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>Provincia</span>
          <input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="es. MI"
            style={{ width: 90 }}
          />
        </div>
      </div>

      <div className="small" style={{ marginTop: 10, opacity: 0.75 }}>
        Filtri: {subtitle}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.length === 0 ? (
          <div className="small">Nessun operatore trovato.</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.worker_public_no}
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: 12,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>Operatore #{r.worker_public_no}</div>
                <div className="small" style={{ marginTop: 4, opacity: 0.8 }}>
                  Livello: {r.clean_level ?? 1} · Stato: {r.profile_status ?? "incomplete"} · Zona:{" "}
                  {(r.res_province ?? "—") + (r.res_cap ? ` (${r.res_cap})` : "")}
                </div>
              </div>

              {/* ✅ QUI era il bug: stavi andando su /worker/proposals (route sbagliata) */}
              <button onClick={() => (window.location.href = `/company/workers/${r.worker_public_no}`)}>
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
