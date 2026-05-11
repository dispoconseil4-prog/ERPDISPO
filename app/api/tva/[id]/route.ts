import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const [decRes, dedRes, encRes] = await Promise.all([
    supabase.from("declarations_tva").select("*").eq("id", id).single(),
    supabase.from("tva_factures_deductions").select("*").eq("declaration_id", id).order("date_facture", { ascending: false }),
    supabase.from("tva_factures_encaissements").select("*").eq("declaration_id", id).order("date_facture", { ascending: false }),
  ]);
  if (decRes.error) return NextResponse.json({ error: decRes.error.message }, { status: 500 });
  return NextResponse.json({ declaration: decRes.data, deductions: dedRes.data || [], encaissements: encRes.data || [] });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from("declarations_tva").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
