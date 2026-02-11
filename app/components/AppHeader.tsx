// app/components/AppHeader.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // se il tuo path è diverso, cambialo QUI

export default function AppHeader() {
  const [showCredits, setShowCredits] = useState(false);
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!alive) return;

      if (!auth.user) {
        setShowCredits(false);
        setCredits(0);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      const isCompany = (prof?.user_type ?? "") === "company";
      setShowCredits(isCompany);

      if (!isCompany) {
        setCredits(0);
        return;
      }

      try {
        const res = await fetch("/api/company/credits", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        setCredits(Number(json?.credits ?? 0));
      } catch {
        if (!alive) return;
        setCredits(0);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <div
      style={{
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #eee",
      }}
    >
      <div style={{ fontWeight: 700 }}>Cleanhub</div>

      {showCredits ? (
        <div className="small">
          Crediti: <b>{credits}</b>
        </div>
      ) : null}
    </div>
  );
}
