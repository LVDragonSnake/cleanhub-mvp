"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type DetailRow = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  worker_data: any;
  res_province: string | null;
  res_cap: string | null;
  unlocked: boolean;
  contact_email: string | null;
  contact_phone: string | null;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const publicNo = useMemo(() => Number(params?.workerPublicNo ?? 0), [params]);

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [row, setRow] = useState<DetailRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

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

      await loadCredits();
      await loadDetail();

      setLoading(false);
    })();
  }, [publicNo]);

  async function loadCredits() {
    const { data } = await supabase.from("company_credits").select("credits").single();
    setCredits(Number((data as any)?.credits ?? 0));
  }

  async function loadDetail() {
    setError(null);

    if (!publicNo) {
      setError("ID operatore non valido.");
      setRow(null);
      return;
    }

    const { data, error } = await supabase.rpc("company_get_worker", {
      p_worker_public_no: publicNo,
    });

    if (error) {
      setError(error.message);
      setRow(null);
      return;
    }

    const first = Array.isArray(data) ? data[0] : null;
    setRow((first as any) ?? null);
  }

  async function unlock() {
    if (!row) return;

    setUnlocking(true);
    setError(null);

    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: row.worker_public_no,
    });

    if (error) {
      // NOT_ENOUGH_CREDITS / NOT_COMPANY ecc.
      setError(error.message);
      setUnlocking(false);
      return;
    }

    await loadCredits();
    await loadDetail();

    setUnlocking(false);
  }

  if (loading) return <div>Caricamento...</div>;
  if (!row) return <div className="card">Operatore non trovato. <a href="/company/workers">← Indietro</a></div>;

  const wd = row.worker_data ?? {};
  const langs = Array.isArray(wd.languages) ? wd.languages : [];
  const av = wd.availability ?? {};
  const env = wd.env ?? {};
  const tr = wd.training ?? {};

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{row.clean_level ?? 1}</b> • Stato: <b>{row.profile_status}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Zona: <b>{row.res_province ?? "—"}</b> • CAP: <b>{row.res_cap ?? "—"}</b>
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      <hr style={{ marginTop: 14, marginBottom: 14 }} />

      {/* CONTATTI */}
      <h3>Contatti</h3>
      {row.unlocked ? (
        <div className="small" style={{ marginTop: 8 }}>
          Email: <b>{row.contact_email ?? "—"}</b>
          <br />
          Telefono: <b>{row.contact_phone ?? "—"}</b>
        </div>
      ) : (
        <div className="small" style={{ marginTop: 8 }}>
          Contatti bloccati. Puoi sbloccarli spendendo <b>1 credito</b>.
          <div style={{ marginTop: 10 }}>
            <button onClick={unlock} disabled={unlocking}>
              {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <hr style={{ marginTop: 14, marginBottom: 14 }} />

      {/* CV (SAFE) */}
      <h3>CV (dati non sensibili)</h3>

      <div style={{ marginTop: 10 }}>
        <b>Lingue</b>
        <div className="small" style={{ marginTop: 6 }}>
          {langs.length ? langs.map((l: any, i: number) => <div key={i}>• {l?.name}</div>) : "—"}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <b>Esperienza</b>
        <div className="small" style={{ marginTop: 6 }}>
          • Esperienza pulizie: <b>{wd.exp_cleaning ? "Sì" : "No"}</b><br />
          • Notturno: <b>{wd.work_night ? "Sì" : "No"}</b><br />
          • Team: <b>{wd.work_team ? "Sì" : "No"}</b><br />
          • Luoghi pubblici: <b>{wd.work_public_places ? "Sì" : "No"}</b><br />
          • Contatto clienti: <b>{wd.work_client_contact ? "Sì" : "No"}</b>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <b>Ambienti</b>
        <div className="small" style={{ marginTop: 6 }}>
          • Hotel: <b>{env.hotel ? "Sì" : "No"}</b><br />
          • Case di cura: <b>{env.care ? "Sì" : "No"}</b><br />
          • Case private: <b>{env.private_homes ? "Sì" : "No"}</b><br />
          • Centri commerciali: <b>{env.shopping ? "Sì" : "No"}</b><br />
          • Uffici: <b>{env.offices ? "Sì" : "No"}</b><br />
          • Ospedali/Cliniche: <b>{env.hospital ? "Sì" : "No"}</b><br />
          • Ristoranti/Bar: <b>{env.restaurants ? "Sì" : "No"}</b><br />
          • Altro: <b>{env.other ? "Sì" : "No"}</b> {env.other_text ? `(${env.other_text})` : ""}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <b>Disponibilità</b>
        <div className="small" style={{ marginTop: 6 }}>
          • Trasferte: <b>{av.trips || "—"}</b><br />
          • Raggio km: <b>{av.radius_km || "—"}</b><br />
          • Preferenze contratti: <b>{av.contract_prefs || "—"}</b><br />
          • Note: <b>{av.notes || "—"}</b><br />
          • Attualmente assunto: <b>{av.currently_employed || "—"}</b><br />
          • Richiesta oraria: <b>{av.hourly_request || "—"}</b>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <b>Formazione</b>
        <div className="small" style={{ marginTop: 6 }}>
          • Anno fine: <b>{tr.school_year_end || "—"}</b><br />
          • Corso: <b>{tr.school_course || "—"}</b><br />
          • Scuola: <b>{tr.school_name || "—"}</b><br />
          • Corsi: <b>{tr.courses || "—"}</b>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Indietro</button>
        <button onClick={() => (window.location.href = "/company")}>Dashboard</button>
      </div>
    </div>
  );
}
