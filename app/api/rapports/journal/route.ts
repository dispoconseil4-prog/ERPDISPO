import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");
  const exercice_id = searchParams.get("exercice_id");
  const journal_id = searchParams.get("journal_id");

  if (!societe_id || !exercice_id) return NextResponse.json({ error: "societe_id et exercice_id requis" }, { status: 400 });

  const supabase = await createServerSupabase();
  let query = supabase
    .from("ecritures_comptables")
    .select("id, date_ecriture, numero_piece, libelle, mois, validee, journal:journaux(code, intitule), lignes:lignes_ecriture(id, debit, credit, compte:plan_comptable(numero, intitule))")
    .eq("societe_id", societe_id)
    .eq("exercice_id", exercice_id)
    .order("date_ecriture", { ascending: true })
    .order("numero_piece", { ascending: true });

  if (journal_id) query = query.eq("journal_id", journal_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const totalDebit = (data || []).reduce((s, e) => s + e.lignes.reduce((sl: number, l: any) => sl + l.debit, 0), 0);
  const totalCredit = (data || []).reduce((s, e) => s + e.lignes.reduce((sl: number, l: any) => sl + l.credit, 0), 0);

  return NextResponse.json({ ecritures: data, total_debit: totalDebit, total_credit: totalCredit });
}
