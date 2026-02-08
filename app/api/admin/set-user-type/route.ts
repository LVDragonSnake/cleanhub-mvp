import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminEmails() {
  const raw = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").trim();
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const targetUserId = String(body?.targetUserId || "").trim();
    const userType = String(body?.userType || "").trim(); // "worker" | "company"

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
    }
    if (!["worker", "company"].includes(userType)) {
      return NextResponse.json({ error: "Invalid userType" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "Missing auth token" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json({ error: "Server env not configured" }, { status: 500 });
    }

    // 1) Verifica chi sta chiamando (con anon key + token utente)
    const supabaseAuth = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const callerEmail = (userData.user.email || "").toLowerCase();
    const adminEmails = getAdminEmails();

    if (!adminEmails.includes(callerEmail)) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // 2) Aggiorna target user con service role (bypassa RLS in modo controllato)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { error: upErr } = await supabaseAdmin
      .from("profiles")
      .update({ user_type: userType })
      .eq("id", targetUserId);

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
