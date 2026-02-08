import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    // 1) Leggo bearer token dal client
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    // 2) Validazione body
    const body = await req.json().catch(() => ({}));
    const targetUserId = body?.targetUserId as string | undefined;
    const userType = body?.userType as "worker" | "company" | undefined;

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
    }
    if (userType !== "worker" && userType !== "company") {
      return NextResponse.json({ error: "Invalid userType" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json(
        { error: "Missing Supabase env vars" },
        { status: 500 }
      );
    }

    // 3) Verifico chi sta chiamando l’API (via token Supabase)
    const sbAuth = createClient(url, anonKey);
    const { data: userData, error: userErr } = await sbAuth.auth.getUser(token);

    if (userErr || !userData?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmails = getAdminEmails();
    const callerEmail = userData.user.email.toLowerCase();
    if (!adminEmails.includes(callerEmail)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4) Aggiorno profilo col service role
    const sb = createClient(url, serviceKey);
    const { error: updErr } = await sb
      .from("profiles")
      .update({ user_type: userType })
      .eq("id", targetUserId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
