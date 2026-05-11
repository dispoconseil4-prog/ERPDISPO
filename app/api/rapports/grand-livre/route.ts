import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");
  const exercice_id = searchParams.get("exercice_id");
  const compte_id = searchParams.get("compte_id");

  if (!societe_id || !exercice_id) return NextResponse.json({ error: "societe_id et exercice_id requis" }, { status: 400 });

  const supabase = await createServerSupabase();
  let query = supabase
    .from("lignes_ecriture")
    .select("id, debit, credit, libelle, ligne, ecriture:ecritures_comptables!inner(id, date_ecriture, numero_piece, libelle, journal:journaux(code, intitule)), compte:plan_comptable!inner(id, numero, intitule)")
    .eq("ecriture.societe_id", societe_id)
    .eq("ecriture.exercice_id", exercice_id)
    .order("ecriture.date_ecriture", { ascending: true });

  if (compte_id) query = query.eq("compte_id", compte_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Grouper par compte et calculer solde cumulé
  const grouped: Record<string, { compte: any; lignes: any[]; total_debit: number; total_credit: number }> = {};
  for (const ligne of (data || []) as any[]) {
    const key = ligne.compte.id;
    if (!grouped[key]) grouped[key] = { compte: ligne.compte, lignes: [], total_debit: 0, total_credit: 0 };
    grouped[key].lignes.push({ ...ligne, solde: 0 });
    grouped[key].total_debit += ligne.debit;
    grouped[key].total_credit += ligne.credit;
  }

  // Calculer solde cumulé pour chaque ligne
  const result = Object.entries(grouped).map(([compteId, g]) => {
    let cumul = 0;
    const lignes = g.lignes.map((l: any) => {
      cumul += l.debit - l.credit;
      return { ...l, solde: cumul };
    });
    return { compte_id: compteId, compte: g.compte, lignes, total_debit: g.total_debit, total_credit: g.total_credit, solde: cumul };
  });

  return NextResponse.json({ comptes: result, total: result.length });
}
