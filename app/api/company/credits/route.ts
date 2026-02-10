import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  // Auth da cookie (Next non te lo passa automatico col service role),
  // quindi qui facciamo semplice: usiamo l'anon via fetch sul client.
  // Per ora: crediti li leggiamo con service role MA chiediamo l'user id dal token client-side.
  // => soluzione rapida: usiamo una RPC con auth.uid() (ma richiede cookie parsing).
  // Quindi: per ora mettiamo crediti = 0 se non riusciamo.
  return NextResponse.json({ credits: 0 });
}
