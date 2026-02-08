"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const adminEmails = useMemo(() => {
    const raw = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").trim();
    return raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  useEffect(() => {
    // Se già loggato, instrada
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) await routeAfterAuth(data.user.id, data.user.email ?? "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminEmails]);

  async function routeAfterAuth(userId: string, userEmail: string) {
    const em = (userEmail || "").toLowerCase();
    if (adminEmails.includes(em)) {
      window.location.href = "/admin";
      return;
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("user_type,profile_status,onboarding_step")
      .eq("id", userId)
      .single();

    const userType = prof?.user_type ?? null;

    if (userType === "company") {
      window.location.href = "/company";
      return;
    }

    // worker (default)
    // se non completo, onboarding; altrimenti profile
    if (prof?.profile_status !== "complete") {
      window.location.href = "/onboarding";
      return;
    }
    window.location.href = "/profile";
  }

  async function doLogin() {
    setMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) return setMsg(error.message);
    if (!data.user) return setMsg("Login non riuscito.");

    await rou
