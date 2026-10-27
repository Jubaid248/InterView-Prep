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
      <body className="antialiased text-slate-900 min-h-screen relative selection:bg-blue-500/20 selection:text-blue-900 bg-gradient-to-b from-[#92b8e3] via-[#b4d1ef] to-[#d8e7f8]">
        {/* Soft Dreamy Cloud Ambiance */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-10 left-10 w-[500px] h-[300px] bg-white/40 rounded-full blur-[90px]" />
          <div className="absolute top-40 right-10 w-[600px] h-[400px] bg-white/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-1/3 w-[700px] h-[350px] bg-white/60 rounded-full blur-[120px]" />
        </div>

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
