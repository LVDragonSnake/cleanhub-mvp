"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [accountType, setAccountType] = useState<"worker" | "company" | "client">("worker");

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      const user = data.user || data.session?.user;
      if (!user) {
        setOk("Account creato! Ora fai login.");
        setLoading(false);
        return;
      }

      // Salva il tipo account su profiles (upsert per evitare casino se la riga non esiste ancora)
      const { error: profErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? email,
            user_type: accountType,
          },
          { onConflict: "id" }
        );

      if (profErr) {
        setErr(profErr.message);
        setLoading(false);
        return;
      }

      // Redirect
      if (accountType === "company") window.location.href = "/company";
      else window.location.href = "/profile"; // "client" per ora va su /profile

    } catch (e: any) {
      setErr(e?.message || "Errore signup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Signup</h2>

      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />

        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        <div className="small" style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 6 }}>
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

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Creazione..." : "Crea account"}
          </button>
        </div>

        {err && <div className="error">{err}</div>}
        {ok && <div className="ok">{ok}</div>}

        <div className="small" style={{ marginTop: 10 }}>
          Hai già un account? <a href="/login">Vai al login</a>
        </div>
      </form>
    </div>
  );
}
