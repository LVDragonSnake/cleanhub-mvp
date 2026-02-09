"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Job = {
  id: string;
  title: string;
  city: string | null;
  address: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  hourly_rate: number | null;
  notes: string | null;
  status: string;
  company_id: string;
};

type Application = {
  id: string;
  job_id: string;
  worker_id: string;
  status: string;
};

export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const appliedMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    for (const a of apps) m[a.job_id] = true;
    return m;
  }, [apps]);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }
      setMeId(auth.user.id);

      const { data: jobsData, error: e1 } = await supabase
        .from("jobs")
        .select("id,title,city,address,date,start_time,end_time,hourly_rate,notes,status,company_id")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (e1) {
        setError(e1.message);
        setLoading(false);
        return;
      }

      const { data: appsData, error: e2 } = await supabase
        .from("job_applications")
        .select("id,job_id,worker_id,status");

      if (e2) {
        setError(e2.message);
        setLoading(false);
        return;
      }

      setJobs((jobsData as any) ?? []);
      setApps((appsData as any) ?? []);
      setLoading(false);
    })();
  }, []);

  async function apply(jobId: string) {
    if (!meId) return;
    if (appliedMap[jobId]) return;

    setSavingId(jobId);
    setError(null);

    const { data, error } = await supabase
      .from("job_applications")
      .insert({ job_id: jobId, worker_id: meId })
      .select("id,job_id,worker_id,status")
      .single();

    if (error) {
      setSavingId(null);
      setError(error.message);
      return;
    }

    setApps((prev) => [...prev, data as any]);
    setSavingId(null);
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Opportunità di lavoro</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="small" style={{ marginTop: 10 }}>
          Nessuna opportunità disponibile al momento.
        </div>
      ) : (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {jobs.map((j) => {
            const applied = !!appliedMap[j.id];
            return (
              <div
                key={j.id}
                style={{
                  border: "1px solid #e6e6e6",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <b>{j.title}</b>
                    <div className="small" style={{ marginTop: 6 }}>
                      {j.city ? `📍 ${j.city}` : ""}
                      {j.address ? ` — ${j.address}` : ""}
                    </div>
                    <div className="small" style={{ marginTop: 6 }}>
                      {j.date ? `📅 ${j.date}` : ""}
                      {j.start_time ? ` — ${j.start_time}` : ""}
                      {j.end_time ? ` → ${j.end_time}` : ""}
                    </div>
                    {j.hourly_rate != null && (
                      <div className="small" style={{ marginTop: 6 }}>
                        💶 {j.hourly_rate} €/h
                      </div>
                    )}
                    {j.notes && (
                      <div className="small" style={{ marginTop: 6 }}>
                        {j.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ minWidth: 140, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => apply(j.id)}
                      disabled={applied || savingId === j.id}
                    >
                      {applied ? "Candidatura inviata ✅" : savingId === j.id ? "Invio..." : "Candidati"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/dashboard">Dashboard</a>
        <a href="/profile">Profilo</a>
      </div>
    </div>
  );
}
