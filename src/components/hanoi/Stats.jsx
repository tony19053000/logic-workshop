/** StatsPanel.jsx — move progress and status metrics. */

const STATUS_MAP = {
  ready:     { label: "Ready",     color: "#8e4e14" },
  running:   { label: "Running",   color: "#8e4e14" },
  paused:    { label: "Paused",    color: "#8e4e14" },
  completed: { label: "Done!",     color: "#8e4e14" },
  error:     { label: "Error",     color: "#ba1a1a" },
};

export default function StatsPanel({
  status,
  diskCount,
  totalMoves,
  currentMove,
  latestMove,
}) {
  const { label, color } = STATUS_MAP[status] || STATUS_MAP.ready;
  const progress = totalMoves > 0 ? Math.round((currentMove / totalMoves) * 100) : 0;

  return (
    <div className="rounded-xl wood-texture shadow-lg overflow-hidden flex flex-col flex-1">
      {/* Card header bar */}
      <div className="w-full h-10 bg-[#8F430F] flex items-center px-4 border-b-2 border-[#4a2511]">
        <span className="text-white text-sm font-bold uppercase tracking-wider">Metrics</span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Status + Disks row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FFF1D8] rounded-lg p-3 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Status</span>
            <span className="text-lg font-bold" style={{ color }}>{label}</span>
          </div>
          <div className="bg-[#FFF1D8] rounded-lg p-3 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Disks</span>
            <span className="text-lg font-bold text-[#8e4e14]">{diskCount || "—"}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[#FFF1D8] rounded-lg p-4 border-2 border-[#9A4F16] shadow-inner">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-[#867468] uppercase">Progress</span>
            <span className="text-xl font-extrabold text-[#8e4e14]">
              {currentMove > 0 ? currentMove.toLocaleString() : "—"}
              <span className="text-sm font-normal text-[#867468]">
                {totalMoves > 0 ? ` / ${totalMoves.toLocaleString()}` : " / —"}
              </span>
            </span>
          </div>
          <div className="w-full h-5 rounded-full overflow-hidden" style={{ background: "#E8D0B0", border: "2px solid #9A4F16" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #8e4e14, #f4a261)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3)",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#867468]">0%</span>
            <span className="text-xs font-bold text-[#8e4e14]">{progress}%</span>
            <span className="text-xs text-[#867468]">100%</span>
          </div>
        </div>

        {/* Latest move console — always rendered to prevent layout shift */}
        <div className="bg-[#FFF1D8] rounded-lg p-3 border-2 border-[#9A4F16] shadow-inner font-mono text-sm break-words min-h-[44px]" style={{ color: latestMove ? "#a33d23" : "#c9a880" }}>
          {latestMove ? `> ${latestMove}` : "> waiting for moves..."}
        </div>
      </div>
    </div>
  );
}
