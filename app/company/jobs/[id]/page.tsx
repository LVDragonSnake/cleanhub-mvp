"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type AppRow = {
  id: string;
  status: string;
  worker_id: string;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
};

export default function CompanyJobAppsPage() {
  const params = useParams<{ id: string }>();
  const jobId = useMemo(() => params?.id ?? "", [params]);

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AppRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    // se l'id non è pronto, non chiamare nulla
    if (!jobId) return;

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

      const { data, error } = await supabase
        .from("job_applications")
        .select("id,status,worker_id,created_at,profiles(first_name,last_name,email)")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, [jobId]);

  async function setStatus(appId: string, status: "accepted" | "rejected") {
    setSavingId(appId);
    setError(null);

    const { error } = await supabase
      .from("job_applications")
      .update({ status })
      .eq("id", appId);

    if (error) {
      setSavingId(null);
      setError(error.message);
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === appId ? { ...r, status } : r)));
    setSavingId(null);
  }

  if (!jobId) return <div>Caricamento...</div>;
  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Candidature job</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <button onClick={() => (window.location.href = "/company/jobs")}>← Indietro</button>
      </div>

      <div style={{ marginTop: 14 }}>
        {rows.length === 0 ? (
          <div className="small">Nessuna candidatura.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => {
              const name =
                `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.trim() ||
                "Operatore";

              return (
                <div
                  key={r.id}
                  style={{
                    border: "1px solid #e6e6e6",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <b>{name}</b>

                  <div className="small" style={{ marginTop: 6 }}>
                    {r.profiles?.email ?? ""}
                  </div>

                  <div className="small" style={{ marginTop: 6 }}>
                    Stato: <b>{r.status}</b>
                  </div>

                  <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                    <button onClick={() => setStatus(r.id, "accepted")} disabled={savingId === r.id}>
                      Accetta
                    </button>
                    <button onClick={() => setStatus(r.id, "rejected")} disabled={savingId === r.id}>
                      Rifiuta
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
