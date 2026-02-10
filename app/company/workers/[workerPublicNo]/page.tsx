"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

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

type ContactRow = {
  worker_id: string;
  worker_public_no: number | null;
  email: string | null;
  worker_phone: string | null;
};

type WorkerFull = {
  worker_data: any;
};

export default function CompanyWorkerDetailPage() {
  const params = useParams<{ workerPublicNo: string }>();
  const publicNo = useMemo(() => (params?.workerPublicNo || "").trim(), [params]);

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardRow | null>(null);
  const [contacts, setContacts] = useState<ContactRow | null>(null);
  const [workerData, setWorkerData] = useState<any>(null);
  const [credits, setCredits] = useState<number>(0);
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

      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      // crediti
      const { data: cc } = await supabase
        .from("company_credits")
        .select("credits")
        .eq("company_id", auth.user.id)
        .single();
      setCredits(Number(cc?.credits ?? 0));

      await loadAll();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicNo]);

  async function loadAll() {
    if (!publicNo) return;

    // card (view)
    const { data: c, error: e1 } = await supabase
      .from("company_worker_cards")
      .select("*")
      .eq("worker_public_no", Number(publicNo))
      .single();

    if (e1) {
      setError(e1.message);
      setCard(null);
      return;
    }

    setCard((c as any) ?? null);

    // worker_data (solo per vedere CV: lo leggiamo da profiles MA senza contatti)
    // ⚠️ se vuoi blindare anche questo via RLS, poi facciamo view dedicata.
    const { data: w, error: e2 } = await supabase
      .from("profiles")
      .select("worker_data")
      .eq("id", (c as any).worker_id)
      .single();

    if (e2) {
      setError(e2.message);
      setWorkerData(null);
      return;
    }

    setWorkerData((w as WorkerFull)?.worker_data ?? null);

    // contatti (view protetta: ritorna righe solo se unlocked)
    const { data: con } = await supabase
      .from("company_worker_contacts")
      .select("*")
      .eq("worker_id", (c as any).worker_id)
      .maybeSingle();

    setContacts((con as any) ?? null);
  }

  async function unlock() {
    if (!card) return;
    setUnlocking(true);
    setError(null);

    const { error: e } = await supabase.rpc("unlock_worker_contact", {
      p_worker_id: card.worker_id,
    });

    if (e) {
      setUnlocking(false);
      setError(e.message);
      return;
    }

    // aggiorna crediti e contatti
    const { data: auth } = await supabase.auth.getUser();
    const { data: cc } = await supabase
      .from("company_credits")
      .select("credits")
      .eq("company_id", auth.user!.id)
      .single();
    setCredits(Number(cc?.credits ?? 0));

    await loadAll();
    setUnlocking(false);
  }

  if (loading) return <div>Caricamento...</div>;
  if (!card) return <div className="card">Operatore non trovato. {error ? `(${error})` : ""}</div>;

  const zone = [card.zone_province, card.zone_cap].filter(Boolean).join(" • ") || "Zona non indicata";

  return (
    <div className="card">
      <h2>Operatore #{card.worker_public_no ?? "—"}</h2>

      <div className="small" style={{ marginTop: 6 }}>
        Livello: <b>{card.clean_level ?? 1}</b> • {zone}
      </div>

      <div className="small" style={{ marginTop: 6 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <hr />

      <h3>Contatti</h3>
      {contacts ? (
        <div className="small">
          Email: <b>{contacts.email ?? "—"}</b>
          <br />
          Telefono: <b>{contacts.worker_phone ?? "—"}</b>
        </div>
      ) : (
        <div className="small">
          Contatti bloccati 🔒{" "}
          <button onClick={unlock} disabled={unlocking || credits < 1} style={{ marginLeft: 8 }}>
            {unlocking ? "Sblocco..." : "Sblocca contatti (1 credito)"}
          </button>
          {credits < 1 ? <span style={{ marginLeft: 8 }}>Crediti insufficienti</span> : null}
        </div>
      )}

      <hr />

      <h3>Curriculum (sezioni)</h3>

      <Section title="Lingue">
        <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(workerData?.languages ?? [], null, 2)}
        </pre>
      </Section>

      <Section title="Esperienza / flags">
        <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(
            {
              exp_cleaning: workerData?.exp_cleaning ?? false,
              work_night: workerData?.work_night ?? false,
              work_team: workerData?.work_team ?? false,
              work_public_places: workerData?.work_public_places ?? false,
              work_client_contact: workerData?.work_client_contact ?? false,
              env: workerData?.env ?? {},
            },
            null,
            2
          )}
        </pre>
      </Section>

      <Section title="Formazione">
        <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(workerData?.training ?? {}, null, 2)}
        </pre>
      </Section>

      <Section title="Disponibilità">
        <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(workerData?.availability ?? {}, null, 2)}
        </pre>
      </Section>

      <Section title="Extra">
        <pre className="small" style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(workerData?.extra ?? {}, null, 2)}
        </pre>
      </Section>

      <div style={{ marginTop: 14 }}>
        <button onClick={() => (window.location.href = "/company/workers")}>← Torna alla lista</button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ border: "1px solid #e6e6e6", borderRadius: 12, padding: 12 }}>{children}</div>
    </div>
  );
}
