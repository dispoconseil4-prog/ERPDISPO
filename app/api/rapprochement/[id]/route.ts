import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: rapp, error } = await supabase
    .from("rapprochements_bancaires")
    .select("*, banque:banques_societe(nom, rib), exercice:exercices(annee)")
    .eq("id", id).single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rapp) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Récupérer les journaux de type Banque pour cette société
  const { data: journaux } = await supabase
    .from("journaux")
    .select("id, code")
    .eq("societe_id", rapp.societe_id);

  const journalIds = (journaux || []).map((j) => j.id);

  // Récupérer les lignes des écritures des journaux Banque pour ce mois/exercice
  const { data: lignes } = await supabase
    .from("lignes_ecriture")
    .select("id, debit, credit, libelle, rapprochee, date_rapprochement, ecriture:ecritures_comptables!inner(id, date_ecriture, numero_piece, libelle, journal_id)")
    .in("ecriture.journal_id", journalIds)
    .eq("ecriture.exercice_id", rapp.exercice_id);

  // Filtrer par mois
  const lignesFiltrees = (lignes || []).filter((l: any) => {
    const date = new Date(l.ecriture.date_ecriture);
    return date.getMonth() + 1 <= rapp.mois; // jusqu'au mois du rapprochement
  });

  const nonRapprochees = lignesFiltrees.filter((l: any) => !l.rapprochee);
  const rapprochees = lignesFiltrees.filter((l: any) => l.rapprochee);

  const solde = nonRapprochees.reduce((s: number, l: any) => s + l.debit - l.credit, 0);

  return NextResponse.json({ rapprochement: rapp, non_rapprochees: nonRapprochees, rapprochees, solde });
}
