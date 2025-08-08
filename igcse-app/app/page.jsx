import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center gap-8">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Ace your IGCSE with AI-marked past paper questions
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Practice by subject, chapter, or full past papers. Get instant, mark-scheme aligned feedback.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/subjects">Start practicing</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
        <FeatureCard title="Past Papers" desc="Solve full papers by year and session with real mark schemes."/>
        <FeatureCard title="Chapter Practice" desc="Select multiple chapters and focus on your weak areas."/>
        <FeatureCard title="Smart Feedback" desc="See color-coded feedback, explanations, and tips to improve."/>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-lg border p-6 text-left bg-card">
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}