import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "IGCSE Practice",
  description: "Practice IGCSE past paper questions with AI grading",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen container py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}