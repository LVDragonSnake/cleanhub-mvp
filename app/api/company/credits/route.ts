import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json({ error: "NO_TOKEN", credits: 0 }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Client server-side, ma con Authorization header del client: RLS + auth.uid() funzionano
    const sb = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data, error } = await sb
      .from("company_credits")
      .select("credits")
      .single();

    // se non esiste la riga, credits = 0
    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message, credits: 0 }, { status: 200 });
    }

    return NextResponse.json({ credits: Number(data?.credits ?? 0) }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "UNKNOWN", credits: 0 }, { status: 200 });
  }
}
