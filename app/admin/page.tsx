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
  user_type: string | null;
  created_at?: string | null;
};

function csvEscape(value: any) {
  const s = String(value ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [onlyWithCv, setOnlyWithCv] = useState(false);
  const [onlyComplete, setOnlyComplete] = useState(false);

  const adminEmails = useMemo(() => {
    const raw = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").trim().toLowerCase();
    return raw
      .split(",")
      .map((s) => s.trim())
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

      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminEmails]);

  async function refresh() {
    setError(null);
    setLoading(true);

    const { data: profs, error: e } = await supabase
      .from("profiles")
      .select(
        "id,email,first_name,last_name,profile_status,onboarding_step,cv_url,user_type,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (e) setError(e.message);
    setRows((profs as any) ?? []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (onlyWithCv && !r.cv_url) return false;
      if (onlyComplete && r.profile_status !== "complete") return false;

      if (!qq) return true;
      const fullName = `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim().toLowerCase();
      const em = (r.email ?? "").toLowerCase();
      return fullName.includes(qq) || em.includes(qq);
    });
  }, [rows, q, onlyWithCv, onlyComplete]);

  async function openCv(row: ProfileRow) {
    setError(null);
    if (!row.cv_url) return;

    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(row.cv_url, 60 * 5);
    if (error) return setError(error.message);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  async function setUserType(targetUserId: string, userType: "worker" | "company" | "client") {
    setError(null);

    try {
      const res = await fetch("/api/admin/set-user-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, userType }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || `HTTP ${res.status}`);
        return;
      }

      await refresh();
    } catch (e: any) {
      setError(e?.message || "Errore chiamando API");
    }
  }

  function exportCsv() {
    setError(null);

    const header = [
      "id",
      "email",
      "first_name",
      "last_name",
      "user_type",
      "profile_status",
      "onboarding_step",
      "has_cv",
      "created_at",
    ];

    const lines = [
      header.join(","),
      ...filtered.map((r) =>
        [
          csvEscape(r.id),
          csvEscape(r.email),
          csvEscape(r.first_name),
          csvEscape(r.last_name),
          csvEscape(r.user_type),
          csvEscape(r.profile_status),
          csvEscape(r.onboarding_step),
          csvEscape(r.cv_url ? "yes" : "no"),
          csvEscape(r.created_at),
        ].join(",")
      ),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `cleanhub_profiles_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
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

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 14 }} />

      <div
        className="small"
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca nome o email..."
          style={{ minWidth: 260 }}
        />

        <label
          style={{
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
            whiteSpace: "nowrap",
            lineHeight: "18px",
          }}
        >
          <input
            type="checkbox"
            checked={onlyComplete}
            onChange={(e) => setOnlyComplete(e.target.checked)}
          />
          Solo completi
        </label>

        <label
          style={{
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
            whiteSpace: "nowrap",
            lineHeight: "18px",
          }}
        >
          <input
            type="checkbox"
            checked={onlyWithCv}
            onChange={(e) => setOnlyWithCv(e.target.checked)}
          />
          Solo con CV
        </label>

        <button onClick={refresh}>Aggiorna</button>
        <button onClick={exportCsv}>Esporta CSV</button>
      </div>

      <div className="small" style={{ marginTop: 10, marginBottom: 8 }}>
        Profili mostrati: <b>{filtered.length}</b> (totali: {rows.length})
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
              <th style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>Azioni</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>
                  {`${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "—"}
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>{r.email ?? "—"}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>{r.user_type ?? "—"}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>
                  {r.profile_status ?? "—"} (step {r.onboarding_step ?? "-"})
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
                      Apri CV (5 min)
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ padding: 6, borderBottom: "1px solid #f2f2f2" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => setUserType(r.id, "company")}>Rendi azienda</button>
                    <button onClick={() => setUserType(r.id, "worker")}>Rendi worker</button>
                    <button onClick={() => setUserType(r.id, "client")}>Rendi cliente</button>
                  </div>
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
