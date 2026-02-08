"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type AccountType = "worker" | "company" | "client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("worker");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      return setErr(error.message);
    }

    // Supabase può richiedere conferma email: in quel caso user può essere null
    const user = data.user ?? data.session?.user;

    if (user) {
      // Upsert profilo (così non esplode se la riga esiste già)
      const { error: upErr } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? email,
          user_type: accountType, // worker | company | client
          profile_status: "incomplete",
          onboarding_step: 1,
        },
        { onConflict: "id" }
      );

      if (upErr) {
        setLoading(false);
        return setErr(upErr.message);
      }

      // Redirect in base al tipo
      if (accountType === "company") {
        window.location.href = "/company";
      } else if (accountType === "client") {
        // per ora lo trattiamo come worker, poi faremo /client
        window.location.href = "/profile";
      } else {
        window.location.href = "/profile";
      }
      return;
    }

    // Caso “email confirmation required”
    setLoading(false);
    setOk("Account creato! Controlla la mail per confermare, poi fai login.");
  }

  return (
    <div className="card">
      <h2>Signup</h2>

      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

        <div style={{ marginTop: 12 }}>
          <div className="small" style={{ marginBottom: 6 }}>
            <b>Tipo account</b>
          </div>

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <input
              type="radio"
              name="accountType"
              checked={accountType === "worker"}
              onChange={() => setAccountType("worker")}
            />
            Operatore del pulito (cerca lavoro)
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <input
              type="radio"
              name="accountType"
              checked={accountType === "company"}
              onChange={() => setAccountType("company")}
            />
            Impresa di pulizie
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="radio"
              name="accountType"
              checked={accountType === "client"}
              onChange={() => setAccountType("client")}
            />
            Cliente finale
          </label>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Creazione..." : "Crea account"}
        </button>

        {err && <div className="error">{err}</div>}
        {ok && <div className="ok">{ok}</div>}

        <div className="small" style={{ marginTop: 10 }}>
          Hai già un account? <a href="/login">Vai al login</a>
        </div>
      </form>
    </div>
  );
}
