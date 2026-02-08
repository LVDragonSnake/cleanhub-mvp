"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_status: string | null;
  onboarding_step: number | null;
  cv_url: string | null;
  user_type: string;
  created_at?: string | null;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const adminEmails = useMemo(() => {
    const raw = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").trim();
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setMe(data.user);

      const myEmail = (data.user.email || "").toLowerCase();
      if (!adminEmails.includes(myEmail)) {
        window.location.href = "/profile";
        return;
      }

      const { data: profs, error: e } = await supabase
        .from("profiles")
        .select("id,email,first_name,last_name,profile_status,onboarding_step,cv_url,user_type,created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (e) setError(e.message);
      setRows((profs as any) ?? []);
      setLoading(false);
    })();
  }, [adminEmails]);

  async function openCv(row: ProfileRow) {
    setError(null);
    if (!row.cv_url) return;

    const { data, error } = await supabase.storage
      .from("cvs")
      .createSignedUrl(row.cv_url, 60 * 5); // 5 minuti

    if (error) return setError(error.message);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Admin</h2>
      <div className="small">
        Loggato come: <b>{me?.email}</b>
      </div>

      {error && <div className="small" style={{ marginTop: 10 }}>{error}</div>}

      <div style={{ marginTop: 14 }} />

      <div className="small" style={{ marginBottom: 8 }}>
        Profili: <b>{rows.length}</b> (max 200)
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="small" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>Nome</th>
              <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>Email</th>
              <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>Tipo</th>
              <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>Status</th>
              <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>CV</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>
                  {(r.first_name || "") + " " + (r.last_name || "")}
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>{r.email}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>{r.user_type}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>
                  {r.profile_status} (step {r.onboarding_step ?? "-"})
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>
                  {r.cv_url ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        openCv(r);
                      }}
                    >
                      Apri CV (link 5 min)
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Torna al profilo</a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
        >
          Logout
        </a>
      </div>
    </div>
  );
}
