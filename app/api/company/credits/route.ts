import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "NOT_AUTH" }, { status: 401 });

  // RLS: può vedere solo la sua riga
  const { data, error } = await supabase
    .from("company_credits")
    .select("credits")
    .eq("company_id", auth.user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ credits: data?.credits ?? 0 });
}
