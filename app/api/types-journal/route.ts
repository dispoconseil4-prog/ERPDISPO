import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("types_journal").select("*").order("code");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
