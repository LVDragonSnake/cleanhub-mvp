"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type WorkerDetail = {
  worker_public_no: number;
  clean_level: number;
  profile_status: string;
  res_province: string | null;
  res_cap: string | null;
  worker_data: any;
  unlocked: boolean;
  contact_email: string | null;
  contact_phone: string | null;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const publicNo = useMemo(() => Number(params?.workerPublicNo || 0), [params]);

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    (async () => {
      if (!publicNo) return;

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
  }, [publicNo]);

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.rpc("company_get_worker", {
      p_worker_public_no: publicNo,
    });

    if (error) {
      setError(error.message);
      setRow(null);
      setLoading(false);
      return;
    }

    const first = Array.isArray(data) ? data[0] : null;
    setRow(first ?? null);
    setLoading(false);
  }

  async function unlock() {
    if (!publicNo) return;
    setUnlocking(true);
    setError(null);

    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: publicNo,
    });

    if (error) {
      setError(error.message);
      setUnlocking(false);
      return;
    }

    await load();
    setUnlocking(false);
  }

  if (!publicNo) return <div>Caricamento...</div>;
  if (loading) return <div>Caricamento...</div>;
  if (!row) return <div>Operatore non trovato.</div>;

  const wd = row.worker_data || {};
  const languages = Array.isArray(wd.languages) ? wd.languages : [];
  const availability = wd.availability || {};
  const env = wd.env || {};
  const training = wd.training || {};
  const extra = wd.extra || {};

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{row.clean_level}</b> · Stato: <b>{row.profile_status}</b> · Zona:{" "}
        <b>{(row.res_province || "—").toString().toUpperCase()}</b>{" "}
        {row.res_cap ? `(${row.res_cap})` : ""}
      </div>

      <hr />

      <h3>Contatti</h3>
      {row.unlocked ? (
        <div className="small">
          Email: <b>{row.contact_email || "—"}</b>
          <br />
          Telefono: <b>{row.contact_phone || "—"}</b>
        </div>
      ) : (
        <>
          <div className="small">Contatti bloccati. Per vedere email/telefono devi sbloccare.</div>
          <div style={{ marginTop: 10 }}>
            <button onClick={unlock} disabled={unlocking}>
              {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
            </button>
          </div>
        </>
      )}

      <hr />

      <h3>CV (dati strutturati)</h3>

      <div style={{ marginTop: 10 }}>
        <b>Lingue</b>
        <div className="small" style={{ marginTop: 6 }}>
          {languages.length ? languages.map((l: any) => l?.name).filter(Boolean).join(", ") : "—"}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Disponibilità</b>
        <div className="small" style={{ marginTop: 6 }}>
          Trasferte: <b>{availability.trips || "—"}</b> · Raggio km:{" "}
          <b>{availability.radius_km || "—"}</b> · Richiesta oraria:{" "}
          <b>{availability.hourly_request || "—"}</b>
        </div>
        {availability.notes ? (
          <div className="small" style={{ marginTop: 6 }}>
            Note: {availability.notes}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Esperienza / Skills</b>
        <div className="small" style={{ marginTop: 6 }}>
          Pulizie: <b>{wd.exp_cleaning ? "Sì" : "No"}</b> · Notturno:{" "}
          <b>{wd.work_night ? "Sì" : "No"}</b> · Team: <b>{wd.work_team ? "Sì" : "No"}</b> ·
          Luoghi pubblici: <b>{wd.work_public_places ? "Sì" : "No"}</b> · Contatto clienti:{" "}
          <b>{wd.work_client_contact ? "Sì" : "No"}</b>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Ambienti</b>
        <div className="small" style={{ marginTop: 6 }}>
          Hotel: <b>{env.hotel ? "Sì" : "No"}</b> · Case di cura: <b>{env.care ? "Sì" : "No"}</b> ·
          Case private: <b>{env.private_homes ? "Sì" : "No"}</b> · Centri commerciali:{" "}
          <b>{env.shopping ? "Sì" : "No"}</b> · Uffici: <b>{env.offices ? "Sì" : "No"}</b> ·
          Ospedali: <b>{env.hospital ? "Sì" : "No"}</b> · Ristoranti:{" "}
          <b>{env.restaurants ? "Sì" : "No"}</b>
          {env.other ? <> · Altro: <b>{env.other_text || "Sì"}</b></> : null}
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Formazione</b>
        <div className="small" style={{ marginTop: 6 }}>
          Fine scuola: <b>{training.school_year_end || "—"}</b> · Corso:{" "}
          <b>{training.school_course || "—"}</b> · Scuola: <b>{training.school_name || "—"}</b>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Extra</b>
        <div className="small" style={{ marginTop: 6 }}>
          Hobbies: <b>{extra.hobbies || "—"}</b> · Tratti: <b>{extra.traits || "—"}</b>
        </div>
        {extra.more_info ? (
          <div className="small" style={{ marginTop: 6 }}>
            Note: {extra.more_info}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 14 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Torna alla lista</button>
      </div>
    </div>
  );
}
