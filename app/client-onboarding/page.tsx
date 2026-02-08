"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ClientOnboardingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("id,user_type")
        .eq("id", data.user.id)
        .single();

      if ((prof?.user_type ?? null) !== "client") {
        window.location.href = "/profile";
        return;
      }

      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Onboarding Cliente</h2>
      <div className="small" style={{ marginTop: 10 }}>
        Qui mettiamo i dati cliente (indirizzo, preferenze, ecc). Per ora MVP: pagina placeholder.
      </div>
      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Profilo</a>
      </div>
    </div>
  );
}
