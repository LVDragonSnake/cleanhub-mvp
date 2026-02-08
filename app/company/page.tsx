"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Row = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_status: string | null;
  cv_url: string | null;
};

export default function CompanyPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);
  const [onlyWithCv, setOnlyWithCv] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      load();
    })();
  }, []);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (onlyComplete) params.set("complete", "1");
    if (onlyWithCv) params.set("cv", "1");

    const res = await fetch(`/api/company/search-workers?${params.toString()}`);
    const json = await res.json();
    setRows(json.rows || []);
    setLoading(false);
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Area Azienda</h2>

      <div className="small" style={{ marginBottom: 10 }}>
        <input
          placeholder="Cerca nome o email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load}>Cerca</button>
      </div>

      <label>
        <input
          type="checkbox"
          checked={onlyComplete}
          onChange={(e) => setOnlyComplete(e.target.checked)}
        />{" "}
        Solo completi
      </label>

      <label style={{ marginLeft: 10 }}>
        <input
          type="checkbox"
          checked={onlyWithCv}
          onChange={(e) => setOnlyWithCv(e.target.checked)}
        />{" "}
        Solo con CV
      </label>

      <table className="small" style={{ width: "100%", marginTop: 14 }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Status</th>
            <th>CV</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{`${r.first_name ?? ""} ${r.last_name ?? ""}`}</td>
              <td>{r.email}</td>
              <td>{r.profile_status}</td>
              <td>{r.cv_url ? "✅" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Profilo</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}
