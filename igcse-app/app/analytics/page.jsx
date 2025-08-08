import { createServerClient } from "@/lib/supabase/server";
import { SubjectPerformanceChart } from "@/components/subject-performance-chart";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Reports</h1>
        <p className="text-muted-foreground">Sign in to view your performance analytics.</p>
      </div>
    );
  }
  const { data } = await supabase.rpc("get_subject_performance", { p_user_id: user.id });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <SubjectPerformanceChart data={data || []} />
    </div>
  );
}