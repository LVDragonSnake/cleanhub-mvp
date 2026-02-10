"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type Detail = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string;
  has_car: boolean;
  citizenship: string;
  driving_license: string;
  languages: any[];
  env: any;
  training: any;
  availability: any;
  extra: any;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const workerPublicNo = useMemo(() => Number(params?.workerPublicNo ?? ""), [params]);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(workerPublicNo) || workerPublicNo <= 0) return;

    (async () => {
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

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      const { data, error } = await supabase.rpc("get_worker_public_detail", {
        p_worker_public_no: workerPublicNo,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setRow(((data as any)?.[0] as Detail) ?? null);
      setLoading(false);
    })();
  }, [workerPublicNo]);

  if (!Number.isFinite(workerPublicNo) || workerPublicNo <= 0) {
    return <div>Operatore non valido.</div>;
  }

  if (loading) return <div>Caricamento...</div>;
  if (!row) return <div className="card">Operatore non trovato.</div>;

  return (
    <div className="card">
      <h2>Operatore #{String(row.worker_public_no).padStart(6, "0")}</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{row.clean_level}</b> — Stato: <b>{row.profile_status}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Provincia: <b>{row.res_province || "—"}</b> — Automunito: <b>{row.has_car ? "Sì" : "No"}</b>
      </div>

      <hr />

      <h3>Documenti (safe)</h3>
      <div className="small">Cittadinanza: <b>{row.citizenship || "—"}</b></div>
      <div className="small">Patente: <b>{row.driving_license || "—"}</b></div>

      <hr />

      <h3>Lingue</h3>
      <div className="small">
        {(row.languages || []).length === 0 ? "—" : (row.languages || []).map((l: any, i: number) => (
          <span key={i} style={{ marginRight: 8 }}>
            <b>{l?.name ?? "—"}</b>
          </span>
        ))}
      </div>

      <hr />

      <h3>Esperienza / ambienti</h3>
      <pre style={{ fontSize: 12, background: "#f7f7f7", padding: 10, borderRadius: 10, overflow: "auto" }}>
        {JSON.stringify(row.env ?? {}, null, 2)}
      </pre>

      <h3>Formazione</h3>
      <pre style={{ fontSize: 12, background: "#f7f7f7", padding: 10, borderRadius: 10, overflow: "auto" }}>
        {JSON.stringify(row.training ?? {}, null, 2)}
      </pre>

      <h3>Disponibilità</h3>
      <pre style={{ fontSize: 12, background: "#f7f7f7", padding: 10, borderRadius: 10, overflow: "auto" }}>
        {JSON.stringify(row.availability ?? {}, null, 2)}
      </pre>

      <h3>Extra</h3>
      <pre style={{ fontSize: 12, background: "#f7f7f7", padding: 10, borderRadius: 10, overflow: "auto" }}>
        {JSON.stringify(row.extra ?? {}, null, 2)}
      </pre>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Indietro</button>
      </div>
    </div>
  );
}
