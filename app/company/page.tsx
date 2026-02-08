"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CompanyPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setEmail(data.user.email ?? null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Area Azienda</h2>
      <div className="small">Loggato come: <b>{email}</b></div>
      <div style={{ marginTop: 12 }} className="small">
        Qui metteremo la dashboard azienda (ricerca profili, richieste, ecc).
      </div>
      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/profile">Profilo</a>
      </div>
    </div>
  );
}
