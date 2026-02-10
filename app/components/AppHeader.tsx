"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import WorkerHeader from "./WorkerHeader";

type ProfileTypeRow = {
  user_type: string | null;
} | null;

export default function AppHeader() {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        setUserType("");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      setUserType(((data as ProfileTypeRow)?.user_type ?? "worker") as string);
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  // ✅ SOLO WORKER vede header gamification
  if (userType !== "worker") return null;

  return <WorkerHeader />;
}
