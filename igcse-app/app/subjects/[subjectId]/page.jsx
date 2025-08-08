import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SubjectDetail({ params, searchParams }) {
  const supabase = createServerClient();
  const subjectId = params.subjectId;
  const { data: subject } = await supabase.from("subjects").select("*").eq("id", subjectId).single();
  const { data: chapters } = await supabase.from("chapters").select("id,name,index").eq("subject_id", subjectId).order("index");
  const { data: papers } = await supabase.from("papers").select("id,year,session,paper_number,description").eq("subject_id", subjectId).order("year", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{subject?.name}</h1>
          <p className="text-muted-foreground">{subject?.description}</p>
        </div>
        <Button asChild><Link href={`/practice?subject=${subjectId}`}>Start practice</Link></Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Chapters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters?.map(ch => (
            <label key={ch.id} className="border rounded-md p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Chapter {ch.index}</div>
                <div className="font-medium">{ch.name}</div>
              </div>
              <Button asChild variant="secondary"><Link href={`/practice?subject=${subjectId}&chapters=${ch.id}`}>Practice</Link></Button>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Past Papers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers?.map(p => (
            <div key={p.id} className="border rounded-md p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">{p.session} {p.year}</div>
                <div className="font-medium">Paper {p.paper_number}</div>
              </div>
              <Button asChild><Link href={`/papers/${p.id}`}>Solve</Link></Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}