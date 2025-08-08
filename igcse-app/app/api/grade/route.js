import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { gradeAnswer } from "@/lib/ai/grader";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { question, parts, markScheme, studentAnswer } = body;

    const cookieStore = cookies();
    const freeUsed = cookieStore.get("guest_attempts")?.value || "0";

    if (!user) {
      const attempts = parseInt(freeUsed, 10) || 0;
      if (attempts >= 1) {
        return NextResponse.json({ error: "Sign in required after the first attempt." }, { status: 401 });
      }
      cookieStore.set("guest_attempts", String(attempts + 1), { httpOnly: false, path: "/" });
    }

    const graded = await gradeAnswer({ question, parts, markScheme, studentAnswer });
    return NextResponse.json(graded);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}