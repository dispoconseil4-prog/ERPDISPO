import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");
  const compte_id = searchParams.get("compte_id");

  if (!societe_id || !compte_id) {
    return NextResponse.json({ error: "societe_id et compte_id requis" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("lignes_ecriture")
    .select("id, debit, credit, libelle, lettree, ecriture:ecritures_comptables!inner(date_ecriture, numero_piece, libelle)")
    .eq("compte_id", compte_id)
    .eq("lettree", false)
    .eq("ecriture.societe_id", societe_id)
    .order("ecriture.date_ecriture", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const solde = (data || []).reduce((s, l: any) => s + l.debit - l.credit, 0);

  return NextResponse.json({ lignes: data || [], solde });
}
