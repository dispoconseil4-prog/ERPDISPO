import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");
  const exercice_id = searchParams.get("exercice_id");

  if (!societe_id || !exercice_id) return NextResponse.json({ error: "societe_id et exercice_id requis" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("lignes_ecriture")
    .select("debit, credit, compte:plan_comptable!inner(id, numero, intitule, niveau)")
    .eq("ecriture.societe_id", societe_id)
    .eq("ecriture.exercice_id", exercice_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const grouped: Record<string, { compte: any; total_debit: number; total_credit: number }> = {};
  for (const ligne of (data || []) as any[]) {
    const key = ligne.compte.id;
    if (!grouped[key]) grouped[key] = { compte: ligne.compte, total_debit: 0, total_credit: 0 };
    grouped[key].total_debit += ligne.debit;
    grouped[key].total_credit += ligne.credit;
  }

  const result = Object.values(grouped).map((g) => ({
    ...g,
    solde: g.total_debit - g.total_credit,
  })).sort((a, b) => a.compte.numero.localeCompare(b.compte.numero));

  const totalD = result.reduce((s: number, r) => s + r.total_debit, 0);
  const totalC = result.reduce((s: number, r) => s + r.total_credit, 0);

  return NextResponse.json({ comptes: result, total_debit: totalD, total_credit: totalC, total_solde: totalD - totalC });
}
