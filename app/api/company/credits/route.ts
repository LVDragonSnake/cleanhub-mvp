// app/api/company/credits/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ credits: 0 }, { status: 401 });
  }

  // verifica user_type = company
  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profErr || (prof?.user_type ?? "") !== "company") {
    return NextResponse.json({ credits: 0 }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("company_credits")
    .select("credits")
    .eq("company_id", user.id)
    .single();

  if (error) {
    // se non c’è riga ancora, per UX ritorniamo 0
    return NextResponse.json({ credits: 0 });
  }

  return NextResponse.json({ credits: Number(data?.credits ?? 0) });
}
