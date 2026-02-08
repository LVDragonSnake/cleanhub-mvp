"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();

      // Non loggato: resta sulla home
      if (!data.user) {
        setLoading(false);
        return;
      }

      // Loggato: controlla profilo
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("profile_status")
        .eq("id", data.user.id)
        .single();

      // Se per qualche motivo il profilo non c'è ancora, manda a onboarding
      if (error || !prof) {
        window.location.href = "/onboarding";
        return;
      }

      // Redirect in base allo stato
      if (prof.profile_status === "complete") {
        window.location.href = "/profile";
      } else {
        window.location.href = "/onboarding";
      }
    })();
  }, []);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="card">
      <h2>CLEANHUB • MVP</h2>
      <p className="small">
        Base Fase 1: autenticazione, profilo, onboarding, upload CV.
      </p>

      <div className="nav">
        <a href="/login">Login</a>
        <a href="/signup">Signup</a>
      </div>
    </div>
  );
}
