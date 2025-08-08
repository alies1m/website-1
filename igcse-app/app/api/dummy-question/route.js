import { NextResponse } from "next/server";
import dummy from "@/data/dummy-questions.json" assert { type: "json" };

export async function GET() {
  const items = Array.isArray(dummy) ? dummy : [];
  const pick = items[Math.floor(Math.random() * Math.max(items.length, 1))] || null;
  return NextResponse.json(pick);
}