import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const supabase = createServerClient();
  const { data: subjects } = await supabase.from("subjects").select("id,name,description").order("name");

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Subjects</h1>
          <p className="text-muted-foreground">Choose a subject to practice chapters or past papers.</p>
        </div>
        <Button asChild><Link href="/analytics">View Reports</Link></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjects?.map((s) => (
          <div key={s.id} className="border rounded-lg p-6 bg-card flex flex-col">
            <h3 className="font-semibold text-xl">{s.name}</h3>
            <p className="text-muted-foreground mb-4">{s.description}</p>
            <div className="mt-auto flex gap-2">
              <Button asChild variant="secondary"><Link href={`/subjects/${s.id}`}>Explore</Link></Button>
              <Button asChild><Link href={`/practice?subject=${s.id}`}>Quick practice</Link></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}