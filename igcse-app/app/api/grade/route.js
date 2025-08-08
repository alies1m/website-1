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
    const { question, parts, markScheme, studentAnswer, meta } = body;

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

    // store attempt
    const attemptPayload = {
      user_id: user?.id || null,
      question_id: meta?.question_id || null,
      subject_id: meta?.subject_id || null,
      awarded_marks: graded.awarded_marks ?? 0,
      total_marks: graded.total_marks ?? 0,
      ratio: graded.total_marks ? (graded.awarded_marks || 0) / graded.total_marks : 0,
      answer_text: studentAnswer,
      feedback: graded,
    };
    await supabase.from("attempts").insert(attemptPayload);

    let teacher = null;
    if ((graded.status === "none") && meta?.subject_id) {
      const { data: t } = await supabase
        .from("teachers_view")
        .select("name,bio,booking_url,image_url,subject_name")
        .eq("subject_id", meta.subject_id)
        .limit(1)
        .maybeSingle();
      teacher = t || null;
    }

    return NextResponse.json({ ...graded, teacher });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}