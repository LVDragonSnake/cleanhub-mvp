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

    // Se email confirmation è disabilitata, user di solito c'è subito.
    // Se non c'è, pazienza: lo aggiorneremo al primo login (poi lo sistemiamo meglio).
    if (user) {
      await supabase.from("profiles").update({ user_type: accountType }).eq("id", user.id);

      if (accountType === "company") window.location.href = "/company";
      else window.location.href = "/profile"; // per ora client -> profile (poi faremo /client)
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
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />

        {/* ✅ box radio allineato */}
        <fieldset
          style={{
            marginTop: 14,
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 12,
          }}
        >
          <legend className="small" style={{ padding: "0 8px" }}>
            <b>Tipo account</b>
          </legend>

          <div style={{ display: "grid", gap: 10 }}>
            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="accountType"
                checked={accountType === "worker"}
                onChange={() => setAccountType("worker")}
              />
              <span>Operatore del pulito (cerca lavoro)</span>
            </label>

            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="accountType"
                checked={accountType === "company"}
                onChange={() => setAccountType("company")}
              />
              <span>Impresa di pulizie</span>
            </label>

            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="accountType"
                checked={accountType === "client"}
                onChange={() => setAccountType("client")}
              />
              <span>Cliente finale</span>
            </label>
          </div>
        </fieldset>

        <div style={{ marginTop: 14 }} />

        <button type="submit" disabled={loading}>
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
