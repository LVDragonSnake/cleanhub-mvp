import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const sb = createClient(url, serviceKey);

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const onlyComplete = searchParams.get("complete") === "1";
  const onlyWithCv = searchParams.get("cv") === "1";

  let query = sb
    .from("profiles")
    .select("id,email,first_name,last_name,profile_status,cv_url")
    .eq("user_type", "worker");

  if (onlyComplete) query = query.eq("profile_status", "complete");
  if (onlyWithCv) query = query.not("cv_url", "is", null);

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filtered = (data || []).filter((r) => {
    if (!q) return true;
    const full = `${r.first_name ?? ""} ${r.last_name ?? ""} ${r.email ?? ""}`.toLowerCase();
    return full.includes(q);
  });

  return NextResponse.json({ rows: filtered });
}
