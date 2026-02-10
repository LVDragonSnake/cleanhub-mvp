"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import WorkerHeader from "./WorkerHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Non mostrare header in pagine pubbliche
  const hideHeader =
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup");

  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          setUserType(null);
          setLoading(false);
          return;
        }

        const { data: prof } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", auth.user.id)
          .single();

        setUserType((prof?.user_type ?? null) as any);
        setLoading(false);
      } catch {
        setUserType(null);
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {!hideHeader && !loading && userType === "worker" ? <WorkerHeader /> : null}
      {children}
    </>
  );
}
