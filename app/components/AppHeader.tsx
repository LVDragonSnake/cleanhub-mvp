"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AppHeader() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isCompany, setIsCompany] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setIsCompany(false);
        setCredits(null);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      const company = (prof?.user_type ?? "") === "company";
      setIsCompany(company);

      if (!company) {
        setCredits(null);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setCredits(0);
        return;
      }

      const res = await fetch("/api/company/credits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setCredits(Number(json.credits ?? 0));
    })();
  }, []);

  return (
    <div style={{ padding: 16, display: "flex", justifyContent: "space-between" }}>
      <div style={{ fontWeight: 700 }}>
        <Link href="/">Cleanhub</Link>
      </div>

      {isCompany ? (
        <div style={{ fontSize: 14 }}>
          Crediti: <b>{credits === null ? "…" : credits}</b>
        </div>
      ) : null}
    </div>
  );
}
