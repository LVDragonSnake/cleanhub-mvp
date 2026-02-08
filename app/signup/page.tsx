"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setErr(error.message);

    setOk("Account creato! Ora fai login.");
  }

  return (
    <div className="card">
      <h2>Signup</h2>

      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

        <button type="submit">Crea account</button>

        {err && <div className="error">{err}</div>}
        {ok && <div className="ok">{ok}</div>}

        <div className="small">
          Hai già un account? <a href="/login">Vai al login</a>
        </div>
      </form>
    </div>
  );
}
