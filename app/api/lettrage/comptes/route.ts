import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");

  if (!societe_id) return NextResponse.json({ error: "societe_id requis" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("lignes_ecriture")
    .select("debit, credit, compte:plan_comptable!inner(id, numero, intitule)")
    .eq("lettree", false)
    .eq("ecriture.societe_id", societe_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const grouped: Record<string, { compte: any; total_debit: number; total_credit: number; nb_lignes: number }> = {};
  for (const l of (data || []) as any[]) {
    const key = l.compte.id;
    if (!grouped[key]) grouped[key] = { compte: l.compte, total_debit: 0, total_credit: 0, nb_lignes: 0 };
    grouped[key].total_debit += l.debit;
    grouped[key].total_credit += l.credit;
    grouped[key].nb_lignes++;
  }

  const result = Object.values(grouped)
    .map((g) => ({ ...g, solde: g.total_debit - g.total_credit }))
    .filter((g) => g.solde !== 0)
    .sort((a, b) => a.compte.numero.localeCompare(b.compte.numero));

  return NextResponse.json(result);
}
