"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function CompanyPage() {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      // ✅ blocco se non company
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
      const res = await fetch("/api/company/credits");
      const json = await res.json();
      setCredits(Number(json.credits ?? 0));

      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Dashboard Azienda</h2>

      <div className="small" style={{ marginTop: 8 }}>
        Crediti disponibili: <b>{credits}</b>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => (window.location.href = "/company/workers")}>
          Cerca operatori
        </button>

        <button onClick={() => alert("In Fase 1: ricarica crediti sarà gestita manualmente / Stripe dopo.")}>
          Ricarica crediti
        </button>
      </div>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Profilo</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}
