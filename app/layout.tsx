import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Parrot — AI Interview Prep",
  description:
    "Ace your next job interview with real-time AI feedback on your spoken answers and body language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased text-ink bg-cream min-h-screen relative selection:bg-moss/20 selection:text-moss-deep">
        {/* Floating Nav */}
        <SiteNav />

        {/* Main Content */}
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
