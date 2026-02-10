"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type WorkerCard = {
  worker_id: string;
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string | null;
  res_cap: string | null;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [meType, setMeType] = useState<string>("");
  const [credits, setCredits] = useState<number>(0);

  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(false);

  const [rows, setRows] = useState<WorkerCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
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

    const ut = (prof?.user_type ?? "worker") as string;
    setMeType(ut);

    if (ut !== "company") {
      window.location.href = "/dashboard";
      return;
    }

    // credits
    const { data: cRow } = await supabase
      .from("company_credits")
      .select("credits")
      .eq("company_id", auth.user.id)
      .single();

    setCredits(Number(cRow?.credits ?? 0));

    // workers list via RPC (SAFE)
    const { data, error: e } = await supabase.rpc("company_list_workers", {
      p_q: q.trim() ? q.trim() : null,
      p_only_complete: onlyComplete,
    });

    if (e) {
      setError(e.message);
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

  const subtitle = useMemo(() => {
    const a = [];
    if (onlyComplete) a.push("solo completi");
    if (q.trim()) a.push(`filtro: "${q.trim()}"`);
    return a.length ? `(${a.join(", ")})` : "";
  }, [onlyComplete, q]);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Ricerca Operatori</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca (CAP / provincia / numero operatore)"
          style={{ flex: 1 }}
        />
        <button onClick={() => load()}>Cerca</button>
      </div>

      <div style={{ marginTop: 10 }}>
        <label className="small" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={onlyComplete}
            onChange={(e) => setOnlyComplete(e.target.checked)}
          />
          Solo profili completi
        </label>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 10, opacity: 0.8 }}>
        {rows.length} risultati {subtitle}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((w) => (
          <div
            key={w.worker_id}
            style={{
              border: "1px solid #e6e6e6",
              borderRadius: 12,
              padding: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>
                Operatore #{w.worker_public_no}
              </div>

              <div className="small" style={{ marginTop: 6 }}>
                Livello: <b>{w.clean_level}</b> — Stato:{" "}
                <b>{w.profile_status}</b>
              </div>

              <div className="small" style={{ marginTop: 6 }}>
                Zona: <b>{w.res_province || "—"}</b> — CAP: <b>{w.res_cap || "—"}</b>
              </div>

              <div className="small" style={{ marginTop: 6, opacity: 0.75 }}>
                (Contatti nascosti finché non sblocchi)
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
        ))}
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/company">Home azienda</a>
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Logout
        </a>
      </div>
    </div>
  );
}
