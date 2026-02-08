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

    const user = data.user || data.session?.user;
    if (user) {
      // aggiorna/crea profilo
      const { error: upErr } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: (user.email || email).toLowerCase(),
          user_type: accountType,
        },
        { onConflict: "id" }
      );

      if (upErr) {
        setLoading(false);
        return setErr(upErr.message);
      }

      // redirect
      if (accountType === "company") window.location.href = "/company";
      else window.location.href = "/profile"; // per ora "client" va su /profile
      return;
    }

    setLoading(false);
    setOk("Account creato! Ora fai login.");
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
          autoComplete="email"
        />

        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          autoComplete="new-password"
        />

        {/* BOX radio (allineato, testo dentro al box) */}
        <div
          style={{
            marginTop: 14,
            padding: 12,
            border: "1px solid #eee",
            borderRadius: 12,
          }}
        >
          <div className="small" style={{ marginBottom: 10 }}>
            <b>Tipo account</b>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              marginBottom: 10,
            }}
          >
            <input
              type="radio"
              name="accountType"
              checked={accountType === "worker"}
              onChange={() => setAccountType("worker")}
              style={{ marginTop: 2 }}
            />
            <span style={{ lineHeight: 1.25 }}>
              Operatore del pulito <span className="small">(cerca lavoro)</span>
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
              marginBottom: 10,
            }}
          >
            <input
              type="radio"
              name="accountType"
              checked={accountType === "company"}
              onChange={() => setAccountType("company")}
              style={{ marginTop: 2 }}
            />
            <span style={{ lineHeight: 1.25 }}>Impresa di pulizie</span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="accountType"
              checked={accountType === "client"}
              onChange={() => setAccountType("client")}
              style={{ marginTop: 2 }}
            />
            <span style={{ lineHeight: 1.25 }}>Cliente finale</span>
          </label>
        </div>

        <div style={{ marginTop: 14 }}>
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
