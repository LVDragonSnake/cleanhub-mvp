"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setErr(error.message);

    window.location.href = "/onboarding";
  }

  return (
    <div className="card">
      <h2>Login</h2>

      <form onSubmit={onSubmit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

        <button type="submit">Entra</button>

        {err && <div className="error">{err}</div>}
        <div className="small">
          Non hai un account? <a href="/signup">Crea account</a>
        </div>
      </form>
    </div>
  );
}
