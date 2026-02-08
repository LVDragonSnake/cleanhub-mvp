"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Header() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsAuthed(!!data.user);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="header">
      <div className="brand">CLEANHUB</div>

      <nav className="topnav">
        {!isAuthed ? (
          <>
            <a href="/login">Login</a>
            <a href="/signup">Signup</a>
          </>
        ) : (
          <>
            <a href="/profile">Profilo</a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
            >
              Logout
            </a>
          </>
        )}
      </nav>
    </header>
  );
}
