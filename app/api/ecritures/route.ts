import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id"), journal_id = searchParams.get("journal_id"), mois = searchParams.get("mois");
  let query = supabase.from("ecritures_comptables").select("*, journal:journaux(*), lignes:lignes_ecriture(*)").order("date_ecriture", { ascending: false });
  if (societe_id) query = query.eq("societe_id", societe_id);
  if (journal_id) query = query.eq("journal_id", journal_id);
  if (mois) query = query.eq("mois", parseInt(mois));
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { lignes, ...ecriture } = await req.json();
  const { data, error } = await supabase.from("ecritures_comptables").insert(ecriture).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (lignes?.length) {
    const { error: errLignes } = await supabase.from("lignes_ecriture").insert(lignes.map((l: any) => ({ ...l, ecriture_id: data.id })));
    if (errLignes) return NextResponse.json({ error: errLignes.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}
