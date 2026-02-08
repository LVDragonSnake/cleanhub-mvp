import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetUserId = body?.targetUserId as string | undefined;
    const userType = body?.userType as "worker" | "company" | undefined;

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
    }
    if (userType !== "worker" && userType !== "company") {
      return NextResponse.json({ error: "Invalid userType" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) {
      return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
    }

    const sb = createClient(url, serviceKey);

    const { error } = await sb.from("profiles").update({ user_type: userType }).eq("id", targetUserId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
