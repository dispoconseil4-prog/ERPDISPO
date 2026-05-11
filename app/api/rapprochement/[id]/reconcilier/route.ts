import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { ligne_ids } = await req.json();

  if (!ligne_ids?.length) return NextResponse.json({ error: "ligne_ids requis" }, { status: 400 });

  const now = new Date().toISOString().split("T")[0];
  const { error } = await supabase
    .from("lignes_ecriture")
    .update({ rapprochee: true, date_rapprochement: now })
    .in("id", ligne_ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rapprochees: ligne_ids.length });
}
