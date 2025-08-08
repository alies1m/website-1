"use client";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }) {
  const [supabase] = useState(() => createBrowserClient());
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}