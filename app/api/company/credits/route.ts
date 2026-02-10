import { NextResponse } from "next/server";

export async function GET() {
  // FIX TEMPORANEO: evita crash build/deploy.
  // Step successivo: lo colleghiamo davvero a Supabase con auth corretta.
  return NextResponse.json({ credits: 0 });
}
