"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
export const dynamic = "force-dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@/lib/supabase/client";
import { GradeBadge } from "@/components/ui/grade-badge";
import { TeacherAd } from "@/components/teacher-ad";

export default function PracticePage() {
  return (
    <Suspense>
      <PracticeInner />
    </Suspense>
  );
}

function PracticeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const supabase = createBrowserClient();
  const subjectId = params.get("subject");
  const chapters = params.get("chapters")?.split(",").filter(Boolean) ?? [];

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);
  const [authRequired, setAuthRequired] = useState(false);

  async function loadQuestion() {
    const { data, error } = await supabase.rpc("get_random_question", { p_subject_id: subjectId, p_chapter_ids: chapters });
    if (error) console.error(error);
    setQuestion(data);
    setAnswer("");
    setResult(null);
  }

  useEffect(() => { loadQuestion(); }, [subjectId, params.toString()]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!question) return;
    setGrading(true);
    setAuthRequired(false);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.text,
          parts: question.parts,
          markScheme: { text: question.mark_scheme, total_marks: question.total_marks },
          studentAnswer: answer,
          meta: { subject_id: question.subject_id, question_id: question.id },
        }),
      });
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      const data = await res.json();
      setResult(data);
    } finally {
      setGrading(false);
    }
  }

  function goLogin() { router.push("/login"); }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Practice</h1>
      {!question ? (
        <div className="text-muted-foreground">Loading question...</div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">
              {question.paper_label ? `${question.paper_label} • ` : ""}Marks: {question.total_marks}
            </div>
            <h2 className="font-medium text-lg mb-2">{question.display_number ? `${question.display_number}. ` : ""}{question.title || "Question"}</h2>
            <p className="whitespace-pre-wrap leading-relaxed">{question.text}</p>
            {question.parts?.length ? (
              <ul className="list-disc pl-6 mt-3 space-y-1">
                {question.parts.map(p => (
                  <li key={p.label}><span className="font-medium">{p.label} ({p.total_marks})</span>: {p.text}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <form onSubmit={onSubmit} className="space-y-3">
            <textarea value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type your answer here..." className="w-full min-h-[160px] border rounded-md p-3" required />
            <div className="flex gap-2">
              <Button type="submit" disabled={grading}>{grading ? "Grading..." : "Submit answer"}</Button>
              <Button type="button" variant="secondary" onClick={loadQuestion}>Skip</Button>
            </div>
          </form>

          {authRequired ? (
            <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="font-medium mb-1">Sign in to continue</div>
              <p className="text-sm text-muted-foreground mb-2">Create a free account to keep practicing and track your progress.</p>
              <Button onClick={goLogin}>Sign in</Button>
            </div>
          ) : null}

          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <GradeBadge status={result.status} score={result.awarded_marks} total={result.total_marks} />
                <div className="text-sm text-muted-foreground">{result.overall_feedback}</div>
              </div>
              {result.part_feedback?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.part_feedback.map((pf, idx) => (
                    <div key={idx} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{pf.part_label}</div>
                        <GradeBadge status={pf.status} score={pf.awarded_marks} total={pf.max_marks} small />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{pf.feedback}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {result?.teacher ? (
                <TeacherAd teacher={result.teacher} />
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}