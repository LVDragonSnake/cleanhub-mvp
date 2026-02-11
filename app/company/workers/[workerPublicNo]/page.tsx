"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type WorkerDetail = {
  worker_public_no: number;
  clean_level: number | null;
  province: string | null;

  exp_cleaning: boolean;
  work_night: boolean;
  work_team: boolean;
  work_public_places: boolean;
  work_client_contact: boolean;

  languages: any; // jsonb
  availability: any; // jsonb
  env: any; // jsonb

  contact_unlocked: boolean;
  email: string | null;
  phone: string | null;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const publicNo = useMemo(() => Number(params?.workerPublicNo || ""), [params]);

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [row, setRow] = useState<WorkerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // blocco se non company
      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      if (!publicNo || Number.isNaN(publicNo)) {
        setError("ID operatore non valido.");
        setLoading(false);
        return;
      }

      await refreshCredits();
      await loadDetail();

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicNo]);

  async function refreshCredits() {
    const { data } = await supabase.from("company_credits").select("credits").maybeSingle();
    setCredits(Number(data?.credits ?? 0));
  }

  async function loadDetail() {
    setError(null);

    const { data, error } = await supabase.rpc("get_worker_public", {
      p_public_no: publicNo,
    });

    if (error) {
      setError(error.message);
      setRow(null);
      return;
    }

    const first = Array.isArray(data) ? (data[0] as WorkerDetail | undefined) : undefined;
    if (!first) {
      setRow(null);
      return;
    }

    setRow(first);
  }

  async function unlock() {
    if (!row) return;
    setUnlocking(true);
    setError(null);

    const { error } = await supabase.rpc("unlock_worker_contact_by_public_no", {
      p_public_no: publicNo,
    });

    if (error) {
      // esempio: NOT_ENOUGH_CREDITS
      setError(error.message);
      setUnlocking(false);
      return;
    }

    await refreshCredits();
    await loadDetail();
    setUnlocking(false);
  }

  if (loading) return <div>Caricamento...</div>;

  if (!row) {
    return (
      <div className="card">
        <h2>Operatore</h2>
        <div className="small">Operatore non trovato.</div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => (window.location.href = "/company/workers")}>← Torna alla lista</button>
        </div>
      </div>
    );
  }

  const langs = Array.isArray(row.languages) ? row.languages : [];
  const av = row.availability || {};
  const env = row.env || {};

  return (
    <div className="card">
      <h2>Operatore #{row.worker_public_no}</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="small" style={{ marginTop: 10 }}>
        Livello: <b>{row.clean_level ?? 1}</b> · Zona: <b>{row.province ?? "—"}</b>
      </div>

      <hr style={{ margin: "14px 0" }} />

      <h3>Contatti</h3>
      {row.contact_unlocked ? (
        <div className="small" style={{ marginTop: 6 }}>
          Email: <b>{row.email ?? "—"}</b>
          <br />
          Telefono: <b>{row.phone ?? "—"}</b>
        </div>
      ) : (
        <>
          <div className="small" style={{ marginTop: 6 }}>
            Contatti bloccati. Per vedere email/telefono devi sbloccare.
          </div>
          <div style={{ marginTop: 10 }}>
            <button onClick={unlock} disabled={unlocking}>
              {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
            </button>
          </div>
        </>
      )}

      <hr style={{ margin: "14px 0" }} />

      <h3>CV (dati strutturati)</h3>

      <div className="small" style={{ marginTop: 10 }}>
        <b>Lingue</b>
        <div>{langs.length ? langs.map((l: any) => l?.name).filter(Boolean).join(", ") : "—"}</div>
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        <b>Disponibilità</b>
        <div>
          Trasferte: {String(av?.trips ?? "—")} · Raggio km: {String(av?.radius_km ?? "—")} · Richiesta oraria:{" "}
          {String(av?.hourly_request ?? "—")}
        </div>
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        <b>Esperienza / Skills</b>
        <div>
          Pulizie: {row.exp_cleaning ? "Sì" : "No"} · Notturno: {row.work_night ? "Sì" : "No"} · Team:{" "}
          {row.work_team ? "Sì" : "No"} · Luoghi pubblici: {row.work_public_places ? "Sì" : "No"} · Contatto clienti:{" "}
          {row.work_client_contact ? "Sì" : "No"}
        </div>
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        <b>Ambienti</b>
        <div>
          Hotel: {env?.hotel ? "Sì" : "No"} · Case di cura: {env?.care ? "Sì" : "No"} · Case private:{" "}
          {env?.private_homes ? "Sì" : "No"} · Centri commerciali: {env?.shopping ? "Sì" : "No"} · Uffici:{" "}
          {env?.offices ? "Sì" : "No"} · Ospedali: {env?.hospital ? "Sì" : "No"} · Ristoranti:{" "}
          {env?.restaurants ? "Sì" : "No"} · Altro: {env?.other ? "Sì" : "No"}{" "}
          {env?.other_text ? `(${env.other_text})` : ""}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Torna alla lista</button>
      </div>
    </div>
  );
}
