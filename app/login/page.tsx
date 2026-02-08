"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    setMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setMsg(error?.message || "Login non riuscito");
      setLoading(false);
      return;
    }

    // 🔽 QUI decidiamo dove mandarlo
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type, onboarding_step")
      .eq("id", data.user.id)
      .single();

    if (profile?.user_type === "company") {
      window.location.href = "/company";
      return;
    }

    if (profile?.user_type === "client") {
      window.location.href = "/client";
      return;
    }

    // worker
    if (!profile?.onboarding_step || profile.onboarding_step < 3) {
      window.location.href = "/profile"; // dashboard operatore
    } else {
      window.location.href = "/profile"; // profilo completo
    }

    setLoading(false);
  }

  return (
    <div className="card">
      <h2>Login</h2>

      {msg && <div className="small">{msg}</div>}

      <label>Email</label>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={onLogin} disabled={loading}>
        {loading ? "Accesso..." : "Accedi"}
      </button>

      <div className="nav">
        <a href="/signup">Crea account</a>
      </div>
    </div>
  );
}
