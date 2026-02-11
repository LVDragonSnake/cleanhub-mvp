"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AppHeader() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isCompany, setIsCompany] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          if (!cancelled) {
            setIsCompany(false);
            setCredits(null);
          }
          return;
        }

        const { data: prof } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", auth.user.id)
          .single();

        const company = (prof?.user_type ?? "") === "company";
        if (!cancelled) setIsCompany(company);

        if (!company) {
          if (!cancelled) setCredits(null);
          return;
        }

        const res = await fetch("/api/company/credits");
        if (!res.ok) {
          // non forziamo a 0 se fallisce: meglio non mostrare
          if (!cancelled) setCredits(null);
          return;
        }

        const json = await res.json();
        if (!cancelled) setCredits(Number(json.credits ?? 0));
      } catch {
        if (!cancelled) {
          setIsCompany(false);
          setCredits(null);
        }
      }
    }

    load();

    // aggiorna anche dopo login/logout
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        padding: "10px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <a href="/" style={{ fontWeight: 700, textDecoration: "none", color: "inherit" }}>
        Cleanhub
      </a>

      {isCompany ? (
        <div className="small">
          Crediti: <b>{credits === null ? "—" : credits}</b>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}
