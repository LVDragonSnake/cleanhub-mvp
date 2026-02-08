"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMsg(error.message);
        return;
      }
      if (!data.user) {
        setMsg("Login non riuscito.");
        return;
      }

      // dopo login manda sempre a /profile (da lì fai redirect a /company se serve)
      window.location.href = "/profile";
    } catch (e: any) {
      setMsg(e?.message || "Errore login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>

      {msg && (
        <div className="small" style={{ marginTop: 10 }}>
          {msg}
        </div>
      )}

      <label>Email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ marginTop: 14 }} />
      <button onClick={onLogin} disabled={loading}>
        {loading ? "Accesso..." : "Accedi"}
      </button>

      <div className="nav" style={{ marginTop: 14 }}>
        <a href="/signup">Crea account</a>
      </div>
    </div>
  );
}
