import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("societes").select("*, banques_societe(*), responsables_societe(*)").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from("societes").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createServerSupabase();
  const { error } = await supabase.from("societes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}
