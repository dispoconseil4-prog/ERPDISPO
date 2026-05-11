import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const utilisateur_id = searchParams.get("utilisateur_id");

  if (!utilisateur_id) return NextResponse.json({ error: "utilisateur_id requis" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("droits_acces").select("*").eq("utilisateur_id", utilisateur_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  // upsert: insert or update
  const { data, error } = await supabase.from("droits_acces").upsert(body, { onConflict: "utilisateur_id,fenetre_id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
