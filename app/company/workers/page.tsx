"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type WorkerRow = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  province: string | null;
  res_cap: string | null;
  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  const [province, setProvince] = useState("");
  const [levelMin, setLevelMin] = useState<string>("");

  // filtri skills
  const [fCleaning, setFCleaning] = useState(false);
  const [fNight, setFNight] = useState(false);
  const [fTeam, setFTeam] = useState(false);
  const [fPublic, setFPublic] = useState(false);
  const [fClient, setFClient] = useState(false);

  const [rows, setRows] = useState<WorkerRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // guard company
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      await refreshCredits();
      await load();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshCredits() {
    const res = await fetch("/api/company/credits");
    const json = await res.json();
    const c = Number(json?.credits ?? 0);
    setCredits(c);
  }

  async function load() {
    setError(null);

    const min = levelMin.trim() ? Number(levelMin.trim()) : null;
    const prov = province.trim() ? province.trim() : null;

    const { data, error } = await supabase.rpc("list_workers_public", {
      p_min_level: min,
      p_province: prov,
    });

    if (error) {
      setRows([]);
      setError(error.message);
      return;
    }

    setRows((data ?? []) as WorkerRow[]);
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (fCleaning && !r.exp_cleaning) return false;
      if (fNight && !r.work_night) return false;
      if (fTeam && !r.work_team) return false;
      if (fPublic && !r.work_public_places) return false;
      if (fClient && !r.work_client_contact) return false;
      return true;
    });
  }, [rows, fCleaning, fNight, fTeam, fPublic, fClient]);

  if (loading) return <div className="card">Caricamento...</div>;

  return (
    <div className="card">
      <h2>Cerca operatori</h2>

      <div className="small" style={{ marginBottom: 10 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      {error ? (
        <div className="small" style={{ marginBottom: 10 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <label>Provincia</label>
          <input
            placeholder="es. MI"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          />
        </div>

        <div>
          <label>Livello minimo</label>
          <input
            placeholder="es. 3"
            value={levelMin}
            onChange={(e) => setLevelMin(e.target.value)}
          />
        </div>

        <div style={{ alignSelf: "flex-end" }}>
          <button onClick={load}>Cerca</button>
        </div>
      </div>

      <div style={{ marginTop: 6 }}>
        <div className="small" style={{ fontWeight: 700, marginBottom: 6 }}>
          Filtri skills
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }} className="small">
          <label><input type="checkbox" checked={fCleaning} onChange={(e) => setFCleaning(e.target.checked)} /> Pulizie</label>
          <label><input type="checkbox" checked={fNight} onChange={(e) => setFNight(e.target.checked)} /> Notturno</label>
          <label><input type="checkbox" checked={fTeam} onChange={(e) => setFTeam(e.target.checked)} /> Team</label>
          <label><input type="checkbox" checked={fPublic} onChange={(e) => setFPublic(e.target.checked)} /> Luoghi pubblici</label>
          <label><input type="checkbox" checked={fClient} onChange={(e) => setFClient(e.target.checked)} /> Contatto clienti</label>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {filtered.length === 0 ? (
          <div className="small">Nessun risultato.</div>
        ) : (
          filtered.map((r) => (
            <div key={r.worker_public_no} className="card" style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Operatore #{r.worker_public_no}</div>
                  <div className="small">
                    Livello: <b>{r.clean_level}</b> · Stato: {r.profile_status} · Zona:{" "}
                    {r.province ?? "—"} {r.res_cap ? `(${r.res_cap})` : ""}
                  </div>
                  <div className="small" style={{ marginTop: 6 }}>
                    Pulizie: {r.exp_cleaning ? "Sì" : "No"} · Notturno:{" "}
                    {r.work_night ? "Sì" : "No"} · Team: {r.work_team ? "Sì" : "No"}
                    <br />
                    Luoghi pubblici: {r.work_public_places ? "Sì" : "No"} · Contatto clienti:{" "}
                    {r.work_client_contact ? "Sì" : "No"}
                  </div>
                </div>

                <button
                  onClick={() => (window.location.href = `/company/workers/${r.worker_public_no}`)}
                >
                  Apri
                </button>
              </div>
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
