import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");
  let query = supabase.from("immobilisations").select("*, dotations:dotations_amortissement(*)").order("designation");
  if (societe_id) query = query.eq("societe_id", societe_id);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from("immobilisations").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
