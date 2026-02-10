// app/api/company/credits/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseWithAuth(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "NO_TOKEN" }, { status: 401 });
    }

    const supabase = getSupabaseWithAuth(token);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "NOT_AUTH" }, { status: 401 });
    }

    const uid = userData.user.id;

    // (opzionale ma consigliato) verifica user_type=company
    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", uid)
      .single();

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 400 });
    }
    if ((prof?.user_type ?? "") !== "company") {
      return NextResponse.json({ error: "NOT_COMPANY" }, { status: 403 });
    }

    // leggi crediti (RLS: company_id = auth.uid())
    const { data: row, error: selErr } = await supabase
      .from("company_credits")
      .select("credits")
      .eq("company_id", uid)
      .single();

    // se non esiste riga, creala a 0
    if (selErr && (selErr as any).code === "PGRST116") {
      const { error: insErr } = await supabase
        .from("company_credits")
        .insert({ company_id: uid, credits: 0 });

      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 400 });
      }
      return NextResponse.json({ credits: 0 });
    }

    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 400 });
    }

    return NextResponse.json({ credits: row?.credits ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "SERVER_ERROR" }, { status: 500 });
  }
}
