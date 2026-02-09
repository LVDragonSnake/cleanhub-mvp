"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Job = {
  id: string;
  title: string;
  city: string | null;
  date: string | null;
  status: string;
};

export default function CompanyJobsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data: prof, error: e0 } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if (e0) {
        setError(e0.message);
        setLoading(false);
        return;
      }

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select("id,title,city,date,status")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setJobs((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Jobs (Azienda)</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <button onClick={() => (window.location.href = "/company/jobs/new")} style={{ marginTop: 10 }}>
        + Crea nuovo job
      </button>

      <div style={{ marginTop: 14 }}>
        {jobs.length === 0 ? (
          <div className="small">Nessun job creato.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jobs.map((j) => (
              <div key={j.id} style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
                <b>{j.title}</b>
                <div className="small" style={{ marginTop: 6 }}>
                  {j.city ? `📍 ${j.city}` : ""} {j.date ? `— 📅 ${j.date}` : ""}
                </div>
                <div className="small" style={{ marginTop: 6 }}>
                  Stato: <b>{j.status}</b>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                  <button onClick={() => (window.location.href = `/company/jobs/${j.id}`)}>
                    Vedi candidature
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/company">Company</a>
      </div>
    </div>
  );
}
