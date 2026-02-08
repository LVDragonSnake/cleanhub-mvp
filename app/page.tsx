"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [loading, setLoading] = useState(true);

  const adminEmails = useMemo(() => {
    const raw = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").trim();
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        return;
      }

      const em = (data.user.email || "").toLowerCase();
      if (adminEmails.includes(em)) {
        window.location.href = "/admin";
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type,profile_status")
        .eq("id", data.user.id)
        .single();

      if (prof?.user_type === "company") {
        window.location.href = "/company";
        return;
      }

      // worker default
      if (prof?.profile_status !== "complete") {
        window.location.href = "/onboarding";
        return;
      }

      window.location.href = "/profile";
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminEmails]);

  if (loading) return <div style={{ padding: 20 }}>Caricamento...</div>;

  return (
    <div className="card">
      <h2>CLEANHUB · MVP</h2>
      <div className="small">
        Base Fase 1: autenticazione, profilo, onboarding, upload CV.
      </div>

      <div style={{ marginTop: 10 }} className="nav">
        <a href="/login">Login</a>
        <a href="/signup">Signup</a>
      </div>
    </div>
  );
}
