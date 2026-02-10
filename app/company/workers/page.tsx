"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type CardRow = {
  worker_id: string;
  worker_public_no: number | null;
  clean_level: number | null;
  profile_status: string | null;
  zone_province: string | null;
  zone_cap: string | null;
  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;
  unlocked: boolean;
};

export default function CompanyWorkersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CardRow[]>([]);
  const [q, setQ] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);

  useEffect(() => {
    (async () => {
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

      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);

    // VIEW sicura: no email/nome
    let query = supabase.from("company_worker_cards").select("*");

    if (onlyComplete) query = query.eq("profile_status", "complete");

    // filtro “q” semplice: cerca per public_no o provincia o cap
    const qq = q.trim();
    if (qq) {
      if (/^\d+$/.test(qq)) {
        query = query.eq("worker_public_no", Number(qq));
      } else {
        // non abbiamo full-text in view: facciamo filtro lato client con memo
      }
    }

    const { data, error } = await query.limit(200);

    if (error) {
      alert(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as any) ?? []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    if (/^\d+$/.test(qq)) return rows; // già filtrato sopra
    return rows.filter((r) => {
      const a = `${r.zone_province ?? ""} ${r.zone_cap ?? ""}`.toLowerCase();
      return a.includes(qq);
    });
  }, [rows, q]);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Operatori</h2>

      <div className="small" style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <input
          placeholder="Cerca per codice (es. 123456) o zona (provincia/cap)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load}>Cerca</button>
      </div>

      <label className="small" style={{ display: "block", marginTop: 10 }}>
        <input
          type="checkbox"
          checked={onlyComplete}
          onChange={(e) => setOnlyComplete(e.target.checked)}
        />{" "}
        Solo profili completi
      </label>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div className="small">Nessun operatore trovato.</div>
        ) : (
          filtered.map((r) => (
            <WorkerCard
              key={r.worker_id}
              row={r}
              onOpen={() =>
                (window.location.href = `/company/workers/${encodeURIComponent(
                  String(r.worker_public_no ?? "")
                )}`)
              }
            />
          ))
        )}
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/company">Dashboard</a>
        <a href="/profile">Profilo</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}

function WorkerCard({ row, onOpen }: { row: CardRow; onOpen: () => void }) {
  const zone = [row.zone_province, row.zone_cap].filter(Boolean).join(" • ") || "Zona non indicata";

  const badges: string[] = [];
  if (row.exp_cleaning) badges.push("Pulizie");
  if (row.work_night) badges.push("Notte");
  if (row.work_team) badges.push("Team");
  if (row.work_public_places) badges.push("Luoghi pubblici");
  if (row.work_client_contact) badges.push("Contatto clienti");

  return (
    <div style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800 }}>
            Operatore #{row.worker_public_no ?? "—"}{" "}
            {row.unlocked ? <span style={{ fontWeight: 600 }}>🔓</span> : <span>🔒</span>}
          </div>
          <div className="small" style={{ marginTop: 4 }}>
            Livello: <b>{row.clean_level ?? 1}</b> • {zone}
          </div>

          {badges.length > 0 && (
            <div className="small" style={{ marginTop: 6, opacity: 0.85 }}>
              {badges.join(" • ")}
            </div>
          )}
        </div>

        <div>
          <button onClick={onOpen}>Apri CV</button>
        </div>
      </div>
    </div>
  );
}
