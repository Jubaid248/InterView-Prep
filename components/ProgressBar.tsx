interface ProgressBarProps {
  current: number;
  total: number;
  awaitingFollowUp?: boolean;
}

export default function ProgressBar({
  current,
  total,
  awaitingFollowUp = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.round(((current + 1) / total) * 100));

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
          Progress Status
        </span>
        <div className="flex items-center gap-2 font-mono">
          <span className="text-zinc-200 font-bold">
            {Math.min(current + 1, total)} of {total}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-indigo-400 font-extrabold">{percentage}%</span>
          {awaitingFollowUp && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-sans uppercase font-bold tracking-wider">
              Follow-up Active
            </span>
          )}
        </div>
      </div>

      {/* Track Bar with Neon Glow Tip */}
      <div className="w-full h-2.5 bg-zinc-900/90 rounded-full border border-white/10 p-0.5 relative overflow-hidden backdrop-blur-md">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700 ease-out relative shadow-sm shadow-indigo-500/50"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/80 rounded-full blur-[2px] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
