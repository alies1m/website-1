"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import PracticePage from "@/app/practice/page";

export default function PaperPracticeWrapper() {
  const params = useParams();
  const supabase = createBrowserClient();
  const [paper, setPaper] = useState(null);
  const [questionIds, setQuestionIds] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from("papers").select("*", { count: "exact" }).eq("id", params.paperId).single();
      setPaper(p);
      const { data: qs } = await supabase.from("questions").select("id").eq("paper_id", params.paperId).order("order_index");
      setQuestionIds(qs?.map(q => q.id) || []);
    }
    load();
  }, [params.paperId]);

  if (!paper) return <div className="text-muted-foreground">Loading paper...</div>;

  // Reuse practice page by passing subject and chapters via URL is harder; for simplicity, show the same practice flow filtered via paper using RPC
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{paper.session} {paper.year} • Paper {paper.paper_number}</h1>
        <div className="text-sm text-muted-foreground">Question {idx + 1} of {questionIds.length}</div>
      </div>
      <PaperQuestion paperId={paper.id} idx={idx} setIdx={setIdx} total={questionIds.length} />
    </div>
  );
}

function PaperQuestion({ paperId, idx, setIdx, total }) {
  const supabase = createBrowserClient();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.rpc("get_nth_paper_question", { p_paper_id: paperId, p_index_one_based: idx + 1 });
      setQuestion(data);
      setAnswer("");
      setResult(null);
    }
    load();
  }, [paperId, idx]);

  async function onSubmit(e) {
    e.preventDefault();
    setGrading(true);
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
      const data = await res.json();
      setResult(data);
    } finally { setGrading(false); }
  }

  return (
    <div className="space-y-3">
      {!question ? <div className="text-muted-foreground">Loading question...</div> : (
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground mb-1">Marks: {question.total_marks}</div>
          <div className="font-medium mb-2">{question.display_number || "Question"}</div>
          <p className="whitespace-pre-wrap">{question.text}</p>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-2">
        <textarea value={answer} onChange={e=>setAnswer(e.target.value)} className="w-full min-h-[140px] border rounded-md p-3" required />
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md bg-primary text-white" disabled={grading}>{grading?"Grading...":"Submit"}</button>
          {idx < total - 1 && result ? <button type="button" className="px-4 py-2 rounded-md border" onClick={()=>setIdx(idx+1)}>Next</button> : null}
        </div>
      </form>
      {result ? <div className="text-sm text-muted-foreground">{result.overall_feedback}</div> : null}
    </div>
  );
}