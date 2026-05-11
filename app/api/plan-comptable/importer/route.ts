import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { societe_id } = await req.json();
  if (!societe_id) return NextResponse.json({ error: "societe_id requis" }, { status: 400 });

  const supabase = await createServerSupabase();

  const { count } = await supabase.from("plan_comptable").select("*", { count: "exact", head: true }).eq("societe_id", societe_id);
  if (count && count > 0) return NextResponse.json({ error: "Plan comptable déjà importé pour cette société" }, { status: 409 });

  const [classesRes, postesRes, rubriquesRes] = await Promise.all([
    supabase.from("classes_comptables").select("id, code, nom"),
    supabase.from("postes_comptables").select("id, classe_id, code, nom"),
    supabase.from("rubriques_comptables").select("id, poste_id, code, nom"),
  ]);

  if (classesRes.error) return NextResponse.json({ error: "Erreur chargement classes" }, { status: 500 });
  if (postesRes.error) return NextResponse.json({ error: "Erreur chargement postes" }, { status: 500 });
  if (rubriquesRes.error) return NextResponse.json({ error: "Erreur chargement rubriques" }, { status: 500 });

  // Map classe_id → classe_code
  const classeMap: Record<string, string> = {};
  for (const c of classesRes.data) classeMap[c.id] = c.code;

  // Map poste_id → poste_code & poste_id → classe_code
  const posteClasseMap: Record<string, string> = {};
  for (const p of postesRes.data) posteClasseMap[p.id] = classeMap[p.classe_id];

  const inserted: Record<string, string> = {};

  // Insert classes (niveau 0)
  for (const c of classesRes.data) {
    const { data, error } = await supabase.from("plan_comptable").insert({
      societe_id, numero: c.code, intitule: c.nom, niveau: 0,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    inserted[c.code] = data.id;
  }

  // Insert postes (niveau 1, parent = classe)
  for (const p of postesRes.data) {
    const classeCode = classeMap[p.classe_id];
    if (!classeCode || !inserted[classeCode]) continue;
    const { data, error } = await supabase.from("plan_comptable").insert({
      societe_id, numero: p.code, intitule: p.nom, niveau: 1, parent_id: inserted[classeCode],
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    inserted[p.code] = data.id;
  }

  // Insert rubriques (niveau 2, parent = poste)
  for (const r of rubriquesRes.data) {
    const poste = postesRes.data.find((p) => p.id === r.poste_id);
    if (!poste || !inserted[poste.code]) continue;
    const { data, error } = await supabase.from("plan_comptable").insert({
      societe_id, numero: r.code, intitule: r.nom, niveau: 2, parent_id: inserted[poste.code],
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    inserted[r.code] = data.id;
  }

  return NextResponse.json({ inserted: Object.keys(inserted).length }, { status: 201 });
}
