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

    const user = data.user ?? data.session?.user ?? null;

    // Email confirmation ON: non ho user subito => salvo scelta in locale
    if (!user) {
      localStorage.setItem("pending_user_type", accountType);
      setLoading(false);
      return setOk("Account creato! Controlla l’email (se richiesta) e poi fai login.");
    }

    const { error: updErr } = await supabase.from("profiles").update({ user_type: accountType }).eq("id", user.id);

    if (updErr) {
      setLoading(false);
      return setErr(updErr.message);
    }

    setLoading(false);
    if (accountType === "company") window.location.href = "/company-onboarding";
    else if (accountType === "client") window.location.href = "/client-onboarding";
    else window.location.href = "/onboarding";
  }

  const radioRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    lineHeight: 1.2,
  };

  // IMPORTANT: se hai input globali width:100%, questo evita che le radio “esplodano”
  const radioStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    margin: 0,
    flexShrink: 0,
  };

  return (
    <div className="card">
      <h2>Signup</h2>

      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

        <div style={{ marginTop: 14, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
          <div className="small" style={{ marginBottom: 10 }}>
            <b>Tipo account</b>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={radioRowStyle}>
              <input
                style={radioStyle}
                type="radio"
                name="accountType"
                checked={accountType === "worker"}
                onChange={() => setAccountType("worker")}
              />
              <span>Operatore del pulito (cerca lavoro)</span>
            </label>

            <label style={radioRowStyle}>
              <input
                style={radioStyle}
                type="radio"
                name="accountType"
                checked={accountType === "company"}
                onChange={() => setAccountType("company")}
              />
              <span>Impresa di pulizie</span>
            </label>

            <label style={radioRowStyle}>
              <input
                style={radioStyle}
                type="radio"
                name="accountType"
                checked={accountType === "client"}
                onChange={() => setAccountType("client")}
              />
              <span>Cliente finale</span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Creo account..." : "Crea account"}
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
