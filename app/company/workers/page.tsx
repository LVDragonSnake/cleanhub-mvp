"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type WorkerCard = {
  worker_public_no: number;
  clean_level: number | null;
  province: string | null;

  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;
};

function boolToSiNo(v: boolean) {
  return v ? "Sì" : "No";
}

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);

  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);
  const [minLevel, setMinLevel] = useState<string>("");
  const [province, setProvince] = useState<string>("");

  const [rows, setRows] = useState<WorkerCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const qTrim = useMemo(() => q.trim(), [q]);
  const provinceTrim = useMemo(() => province.trim(), [province]);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // blocco se non company
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if (profErr) {
        setError(profErr.message);
        setLoading(false);
        return;
      }

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      await refreshCredits();
      await loadWorkers();

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshCredits() {
    // RLS: la company vede solo i propri credits
    const { data, error } = await supabase
      .from("company_credits")
      .select("credits")
      .maybeSingle();

    if (error) {
      // se non esiste ancora la riga, credits=0
      setCredits(0);
      return;
    }

    setCredits(Number(data?.credits ?? 0));
  }

  async function loadWorkers() {
    setError(null);

    // Filtri base:
    // - p_min_level lo usiamo dalla RPC list_workers_public
    // - p_province lo usiamo dalla RPC list_workers_public
    // - ricerca qTrim: se è numerico, filtriamo lato client per public_no
    //   (per ora semplice e robusto)
    const min = minLevel.trim() ? Number(minLevel.trim()) : null;
    const prov = provinceTrim ? provinceTrim : null;

    const { data, error } = await supabase.rpc("list_workers_public", {
      p_min_level: min,
      p_province: prov,
    });

    if (error) {
      setError(error.message);
      setRows([]);
      return;
    }

    let list = (data ?? []) as WorkerCard[];

    // solo completi: per ora lo gestiamo lato client con un trucco:
    // se vuoi farlo bene al 100% lato DB, aggiorniamo la RPC.
    // Nel frattempo: mostriamo tutto ma “Solo completi” lo applichiamo
    // leggendo profile_status richiederebbe un campo in RPC.
    // Quindi: per non mentire, qui lo disattiviamo “di fatto” e lo mostriamo come filtro UI.
    // (Se preferisci, lo tolgo dalla UI.)
    if (onlyComplete) {
      // NON possiamo filtrare senza profile_status. Per evitare bug, NON filtriamo.
      // Ti lascio comunque la spunta visiva.
    }

    // ricerca: se q è un numero, filtro per worker_public_no
    if (qTrim) {
      const num = Number(qTrim);
      if (!Number.isNaN(num) && Number.isFinite(num)) {
        list = list.filter((r) => Number(r.worker_public_no) === num);
      } else {
        // altrimenti provo su provincia (semplice)
        const qUp = qTrim.toUpperCase();
        list = list.filter((r) => (r.province ?? "").toUpperCase().includes(qUp));
      }
    }

    setRows(list);
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Cerca operatori</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <input
          placeholder="Cerca (ID pubblico / provincia)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={loadWorkers} style={{ marginTop: 8 }}>
          Cerca
        </button>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <label className="small">
          <input
            type="checkbox"
            checked={onlyComplete}
            onChange={(e) => setOnlyComplete(e.target.checked)}
          />{" "}
          Solo completi (work in progress)
        </label>

        <div className="small">
          <div>Livello minimo</div>
          <input
            style={{ width: 90 }}
            placeholder="es. 3"
            value={minLevel}
            onChange={(e) => setMinLevel(e.target.value)}
          />
        </div>

        <div className="small">
          <div>Provincia</div>
          <input
            style={{ width: 110 }}
            placeholder="es. MI"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.length === 0 ? (
          <div className="small">Nessun risultato.</div>
        ) : (
          rows.map((r) => (
            <div
              key={r.worker_public_no}
              style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <b>Operatore #{r.worker_public_no}</b>
                  <div className="small" style={{ marginTop: 6 }}>
                    Livello: <b>{r.clean_level ?? 1}</b> · Zona: <b>{r.province ?? "—"}</b>
                  </div>

                  <div className="small" style={{ marginTop: 6 }}>
                    Pulizie: {boolToSiNo(r.exp_cleaning)} · Notturno: {boolToSiNo(r.work_night)} · Team:{" "}
                    {boolToSiNo(r.work_team)}
                  </div>
                  <div className="small">
                    Luoghi pubblici: {boolToSiNo(r.work_public_places)} · Contatto clienti:{" "}
                    {boolToSiNo(r.work_client_contact)}
                  </div>
                </div>

                <button onClick={() => (window.location.href = `/company/workers/${r.worker_public_no}`)}>
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
