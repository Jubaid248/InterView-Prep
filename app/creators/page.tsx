"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface Creator {
  name: string;
  role: string;
  image: string;
  description: string;
  tag: string;
}

const CREATORS: Creator[] = [
  {
    name: "Farhan Ashraf Muhaimin",
    role: "Product Designing",
    image: "/creators/farhan.jpg",
    description:
      "Crafting user-centric UI/UX design systems, modern visual ergonomics, and 3D interactive user experiences for TotaPakhi.",
    tag: "Design Lead",
  },
  {
    name: "Raiyan Razi Rahman",
    role: "Data Analyst",
    image: "/creators/raiyan.jpg",
    description:
      "Engineered prompt-by-prompt speech metrics, filler word analytics, and quantitative IELTS criteria evaluation models.",
    tag: "Data Lead",
  },
  {
    name: "Md. Jubaid Hasan",
    role: "Full Stack Developer",
    image: "/creators/jubaid.jpg",
    description:
      "Architected the full-stack Next.js engine, speech recognition pipelines, real-time LLM integrations, and session storage.",
    tag: "Engineering Lead",
  },
];

export default function CreatorsPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors glass-card px-4 py-2 rounded-xl border border-white/10"
        >
          ← Back to TotaPakhi Studio
        </button>
        <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">
          MEET THE TEAM // CREATORS
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-mono font-extrabold uppercase tracking-[0.3em] text-amber-400">
          THE BRAINS BEHIND TOTAPAKHI
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white font-jakarta tracking-tight">
          Meet the Creators
        </h1>
        <p className="text-base text-zinc-300 leading-relaxed font-normal">
          The team combining product design, data intelligence, and full-stack engineering to build the TotaPakhi AI Voice Studio.
        </p>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CREATORS.map((creator, idx) => (
          <div
            key={creator.name}
            className="boon-card-interactive rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group"
          >
            {/* Image Box */}
            <div className="relative w-full h-80 sm:h-96 overflow-hidden bg-zinc-950">
              <Image
                src={creator.image}
                alt={creator.name}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />
              
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                  0{idx + 1} // {creator.tag}
                </span>
              </div>
            </div>

            {/* Creator Info */}
            <div className="p-6 sm:p-8 space-y-3 bg-[#0a0a0a]">
              <div>
                <h3 className="text-xl font-bold text-white font-jakarta group-hover:text-amber-400 transition-colors">
                  {creator.name}
                </h3>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mt-0.5">
                  {creator.role}
                </p>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                {creator.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
