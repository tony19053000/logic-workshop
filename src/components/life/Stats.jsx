/** LifeStats.jsx — generation and cell statistics panel. */

const STATUS_MAP = {
  ready:   { label: "Ready",   color: "#8e4e14" },
  running: { label: "Running", color: "#8e4e14" },
  paused:  { label: "Paused",  color: "#8e4e14" },
  error:   { label: "Error",   color: "#ba1a1a" },
};

const PATTERN_LABELS = {
  glider:                "Glider",
  blinker:               "Blinker",
  toad:                  "Toad",
  beacon:                "Beacon",
  pulsar:                "Pulsar",
  lightweight_spaceship: "LWSS",
  random:                "Random",
  custom:                "Custom",
  gosper_glider_gun:     "Gosper Glider Gun",
  r_pentomino:           "R-Pentomino",
  acorn:                 "Acorn",
  diehard:               "Diehard",
};

export default function LifeStats({
  status,
  generation,
  rows,
  cols,
  stats,
  pattern,
  wrap,
}) {
  const { label, color } = STATUS_MAP[status] || STATUS_MAP.ready;
  const totalCells = rows * cols;
  const deadCells  = totalCells - (stats.alive || 0);

  return (
    <div className="rounded-xl wood-texture shadow-lg overflow-hidden flex flex-col">
      {/* Card header bar */}
      <div className="w-full h-10 bg-[#8F430F] flex items-center px-4 border-b-2 border-[#4a2511]">
        <span className="text-white text-sm font-bold uppercase tracking-wider">Metrics</span>
      </div>

      <div className="p-4 flex flex-col gap-3">

        {/* Status + Generation */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#FFF1D8] rounded-lg p-3 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Status</span>
            <span className="text-base font-bold" style={{ color }}>{label}</span>
          </div>
          <div className="bg-[#FFF1D8] rounded-lg p-3 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Generation</span>
            <span className="text-base font-bold text-[#8e4e14]">{generation}</span>
          </div>
        </div>

        {/* Cell counts */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#FFF1D8] rounded-lg p-2 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Alive</span>
            <span className="text-sm font-bold text-[#006a60]">{stats.alive ?? 0}</span>
          </div>
          <div className="bg-[#FFF1D8] rounded-lg p-2 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Dead</span>
            <span className="text-sm font-bold text-[#534439]">{deadCells}</span>
          </div>
          <div className="bg-[#FFF1D8] rounded-lg p-2 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Total</span>
            <span className="text-sm font-bold text-[#8e4e14]">{totalCells}</span>
          </div>
        </div>

        {/* Change stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#FFF1D8] rounded-lg p-2 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Births</span>
            <span className="text-sm font-bold text-[#006a60]">+{stats.births ?? 0}</span>
          </div>
          <div className="bg-[#FFF1D8] rounded-lg p-2 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Deaths</span>
            <span className="text-sm font-bold text-[#ba1a1a]">−{stats.deaths ?? 0}</span>
          </div>
          <div className="bg-[#FFF1D8] rounded-lg p-2 border-2 border-[#9A4F16] shadow-inner flex flex-col items-center">
            <span className="text-xs font-bold text-[#867468] uppercase mb-1">Survived</span>
            <span className="text-sm font-bold text-[#8e4e14]">{stats.survivors ?? 0}</span>
          </div>
        </div>

        {/* Pattern / grid / wrap info */}
        <div
          className="bg-[#FFF1D8] rounded-lg p-3 border-2 border-[#9A4F16] flex flex-col gap-1.5"
          style={{ boxShadow: "inset 0 2px 4px rgba(74,37,17,0.12)" }}
        >
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[#867468] uppercase">Pattern</span>
            <span className="font-bold text-[#8e4e14]">{PATTERN_LABELS[pattern] ?? pattern}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[#867468] uppercase">Grid</span>
            <span className="font-bold text-[#8e4e14]">{rows} × {cols}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[#867468] uppercase">Wrap Edges</span>
            <span className="font-bold text-[#8e4e14]">{wrap ? "On" : "Off"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[#867468] uppercase">Rules</span>
            <span className="font-mono font-bold text-[#8e4e14]">B3/S23</span>
          </div>
        </div>

      </div>
    </div>
  );
}
