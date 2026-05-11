import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");
  const compte_id = searchParams.get("compte_id");

  if (!societe_id) return NextResponse.json({ error: "societe_id requis" }, { status: 400 });

  const supabase = await createServerSupabase();
  let query = supabase
    .from("lettrage")
    .select("*, compte:plan_comptable(id, numero, intitule), lignes:lettrage_lignes(*)")
    .eq("societe_id", societe_id)
    .order("date_lettrage", { ascending: false });

  if (compte_id) query = query.eq("compte_id", compte_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { societe_id, compte_id, ligne_ids, lettre } = await req.json();

  if (!societe_id || !compte_id || !ligne_ids?.length) {
    return NextResponse.json({ error: "societe_id, compte_id, ligne_ids requis" }, { status: 400 });
  }

  const lettreCode = lettre || `L${Date.now().toString(36).toUpperCase()}`;

  // Créer le lettrage
  const { data: lettrage, error: err } = await supabase.from("lettrage").insert({
    societe_id, compte_id, lettre: lettreCode,
  }).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 400 });

  // Récupérer les montants des lignes
  const { data: lignes } = await supabase.from("lignes_ecriture").select("id, debit, credit").in("id", ligne_ids);
  if (!lignes) return NextResponse.json({ error: "Lignes introuvables" }, { status: 400 });

  // Insérer les lignes de lettrage
  const lignesLettrage = lignes.map((l: any) => ({
    lettrage_id: lettrage.id,
    ligne_ecriture_id: l.id,
    montant_lettre: l.debit > 0 ? l.debit : l.credit,
  }));

  const { error: errLignes } = await supabase.from("lettrage_lignes").insert(lignesLettrage);
  if (errLignes) return NextResponse.json({ error: errLignes.message }, { status: 400 });

  // Marquer les lignes comme lettrées
  const { error: errUpdate } = await supabase.from("lignes_ecriture").update({ lettree: true }).in("id", ligne_ids);
  if (errUpdate) return NextResponse.json({ error: errUpdate.message }, { status: 400 });

  return NextResponse.json({ lettrage, lignes: ligne_ids.length }, { status: 201 });
}
