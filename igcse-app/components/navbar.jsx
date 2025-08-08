"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  return (
    <header className="border-b bg-background">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="font-semibold">IGCSE Practice</Link>
        <nav className="hidden md:flex gap-6">
          <NavLink href="/subjects" active={pathname?.startsWith("/subjects")}>Subjects</NavLink>
          <NavLink href="/analytics" active={pathname === "/analytics"}>Reports</NavLink>
        </nav>
        <div className="flex gap-2">
          {user ? (
            <Button variant="secondary" onClick={() => supabase.auth.signOut()}>Sign out</Button>
          ) : (
            <>
              <Button asChild variant="ghost"><Link href="/login">Log in</Link></Button>
              <Button asChild><Link href="/login?signup=1">Sign up</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link href={href} className={`text-sm ${active ? "text-primary" : "text-muted-foreground"}`}>{children}</Link>
  );
}