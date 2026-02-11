"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // adattalo se il path è diverso

export default function AppHeader() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isCompany, setIsCompany] = useState(false);

  async function refreshCredits() {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setIsCompany(false);
        setCredits(null);
        return;
      }

      const { data: prof, error: eProf } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if (eProf) {
        setIsCompany(false);
        setCredits(null);
        return;
      }

      const company = (prof?.user_type ?? "") === "company";
      setIsCompany(company);

      if (!company) {
        setCredits(null);
        return;
      }

      const res = await fetch("/api/company/credits");
      if (!res.ok) {
        setCredits(0); // niente "—": se fallisce, mostra 0 (o potresti nascondere)
        return;
      }

      const json = await res.json();
      setCredits(Number(json?.credits ?? 0));
    } catch {
      setCredits(0);
    }
  }

  useEffect(() => {
    refreshCredits();

    const onUpdate = () => refreshCredits();
    window.addEventListener("credits:update", onUpdate);
    return () => window.removeEventListener("credits:update", onUpdate);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "14px 18px",
        borderBottom: "1px solid #eee",
        alignItems: "center",
      }}
    >
      <div style={{ fontWeight: 700 }}>Cleanhub</div>

      <div style={{ fontSize: 14, opacity: 0.8 }}>
        {isCompany ? (
          <>
            Crediti: <b>{credits ?? 0}</b>
          </>
        ) : null}
      </div>
    </div>
  );
}
