import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { createHash } from "crypto";

export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");
  let query = supabase.from("utilisateurs").select("*, droits_acces(*)").order("nom");
  if (societe_id) query = query.eq("societe_id", societe_id);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { mot_de_passe, ...body } = await req.json();
  const hash = createHash("sha256").update(mot_de_passe || "").digest("hex");
  const { data, error } = await supabase.from("utilisateurs").insert({ ...body, mot_de_passe: hash }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: Request) {
  const supabase = await createServerSupabase();
  const { id, mot_de_passe, ...body } = await req.json();
  const updates: any = { ...body };
  if (mot_de_passe) updates.mot_de_passe = createHash("sha256").update(mot_de_passe).digest("hex");
  const { data, error } = await supabase.from("utilisateurs").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
