import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOTAPAKHI — Master Voice Communication & Exam Performance",
  description:
    "A reasoning & voice studio built around real-time AI feedback for job interviews, communication frameworks, and IELTS Speaking exams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased bg-[#050505] text-zinc-100 min-h-screen relative selection:bg-amber-500/30 selection:text-amber-200">
        {/* Subtle Background Matrix Overlay */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-15">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.25) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* Minimal Editorial Header (BOON Style) */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <a href="/" className="flex items-center gap-3 group">
              <span className="text-xl sm:text-2xl font-black tracking-[0.25em] text-white group-hover:text-amber-400 transition-colors font-jakarta uppercase">
                TOTAPAKHI
              </span>
            </a>

            {/* Navigation Pills */}
            <div className="flex items-center gap-4">
              <a
                href="/creators"
                className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10"
              >
                Creators
              </a>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 border border-white/10 text-xs font-mono text-zinc-300 backdrop-blur-md shadow-xl">
                <span className="font-bold text-white uppercase tracking-wider">STUDIO</span>
                <span className="text-amber-500 font-bold">:::</span>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
          {children}
        </main>
      </body>
    </html>
  );
}
