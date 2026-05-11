import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
export async function GET(req: Request) {
  const supabase = await createServerSupabase();
  const { searchParams } = new URL(req.url);
  const societe_id = searchParams.get("societe_id");
  if (!societe_id) return NextResponse.json({ error: "societe_id requis" }, { status: 400 });
  const { data, error } = await supabase.from("parametrage_comptabilite").select("*").eq("societe_id", societe_id).single();
  if (error && error.code === "PGRST116") return NextResponse.json(null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from("parametrage_comptabilite").upsert(body, { onConflict: "societe_id" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
