import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const chapters = (searchParams.get("chapters") || "").split(",").filter(Boolean);
  let query = supabase.from("questions").select("*").limit(1);
  if (subject) query = query.eq("subject_id", subject);
  if (chapters.length) query = query.in("chapter_id", chapters);
  query = query.order("random");
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] || null);
}