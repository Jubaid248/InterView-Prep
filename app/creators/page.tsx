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
    name: "Md. Jubaid Hasan",
    role: "CEO & Full Stack Developer",
    image: "/creators/jubaid.jpg",
    description:
      "Architected the full-stack Next.js engine, speech recognition pipelines, real-time LLM integrations, and session storage.",
    tag: "Founder & CEO",
  },
];

export default function CreatorsPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-10 px-4 sm:px-6 py-6 pb-20 text-slate-900">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cloudkit-card px-4 py-2 rounded-full"
        >
          ← Back to Parrot
        </button>
        <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
          Creator
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-jakarta tracking-tight">
          Meet the Creator
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-normal">
          Full-stack engineering, speech pipelines, and real-time AI intelligence behind Parrot.
        </p>
      </div>

      {/* Creator Card */}
      <div className="max-w-sm mx-auto w-full">
        {CREATORS.map((creator) => (
          <div
            key={creator.name}
            className="cloudkit-card rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
          >
            {/* Image Box */}
            <div className="relative w-full h-80 overflow-hidden bg-slate-100">
              <Image
                src={creator.image}
                alt={creator.name}
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-slate-800 shadow-sm border border-slate-200/60 backdrop-blur-md">
                  {creator.tag}
                </span>
              </div>
            </div>

            {/* Creator Info */}
            <div className="p-6 space-y-2 bg-white">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-jakarta">
                  {creator.name}
                </h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">
                  {creator.role}
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {creator.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
