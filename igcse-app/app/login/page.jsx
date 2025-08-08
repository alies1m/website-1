"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const supabase = createBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data?.user) router.replace("/"); });
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/` } });
  }

  async function signInWithEmail(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/` } });
    if (error) alert(error.message); else alert("Check your email for a magic link!");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <Button onClick={signInWithGoogle} className="w-full">Continue with Google</Button>
      <form onSubmit={signInWithEmail} className="space-y-3">
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" className="w-full border rounded-md px-3 py-2" required />
        <Button type="submit" className="w-full">Send magic link</Button>
      </form>
    </div>
  );
}