import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: immo, error: err } = await supabase.from("immobilisations").select("*").eq("id", id).single();
  if (err || !immo) return NextResponse.json({ error: "Immobilisation introuvable" }, { status: 404 });

  const duree = immo.duree_utilisation;
  if (!duree || duree <= 0) return NextResponse.json({ error: "Durée d'utilisation non définie" }, { status: 400 });

  const taux = immo.taux_amortissement || (100 / duree);
  const base = immo.montant_acquisition - (immo.valeur_residuelle || 0);
  const annuel = base / duree;
  const mois = new Date(immo.date_acquisition).getMonth(); // 0-11
  const anneeAcq = new Date(immo.date_acquisition).getFullYear();
  const moisRestant = 12 - mois; // mois restants dans l'année d'acquisition

  // Récupérer les exercices de la société
  const { data: exercices } = await supabase.from("exercices").select("*").eq("societe_id", immo.societe_id).gte("annee", anneeAcq);
  if (!exercices?.length) return NextResponse.json({ error: "Aucun exercice trouvé" }, { status: 400 });

  const dotations: any[] = [];
  let cumul = immo.amortissement_anterieur || 0;

  for (let i = 0; i < duree; i++) {
    const annee = anneeAcq + i;
    const ex = exercices.find((e) => e.annee === annee);
    if (!ex) continue;

    const dotationAnnuelle = i === 0 ? (annuel * moisRestant / 12) : annuel;
    if (i === duree - 1) {
      // Dernière année: ajuster pour arriver à la valeur résiduelle
      dotationAnnuelle; // déjà correcte
    }
    cumul += dotationAnnuelle;
    const vnc = base - cumul + (immo.valeur_residuelle || 0);

    dotations.push({
      immobilisation_id: id,
      exercice_id: ex.id,
      annee,
      dotation_mensuelle: dotationAnnuelle / 12,
      dotation_annuelle: Math.round(dotationAnnuelle * 100) / 100,
      cumul_amortissement: Math.round(cumul * 100) / 100,
      valeur_nette: Math.round(vnc * 100) / 100,
    });
  }

  // Supprimer les anciennes dotations et insérer les nouvelles
  await supabase.from("dotations_amortissement").delete().eq("immobilisation_id", id);
  const { data, error } = await supabase.from("dotations_amortissement").insert(dotations).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ dotations: data, count: data?.length, taux }, { status: 201 });
}
