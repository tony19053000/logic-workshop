import { useState, useEffect } from "react";

const BASIC_PATTERNS = [
  { value: "glider",                label: "Glider" },
  { value: "toad",                  label: "Toad" },
  { value: "lightweight_spaceship", label: "Lightweight Spaceship" },
  { value: "pulsar",                label: "Pulsar" },
  { value: "random",                label: "Random" },
  { value: "custom",                label: "Custom" },
];

const ADVANCED_PATTERNS = [
  { value: "gosper_glider_gun", label: "Gosper Glider Gun" },
  { value: "r_pentomino",       label: "R-Pentomino" },
  { value: "acorn",             label: "Acorn" },
  { value: "diehard",           label: "Diehard" },
  { value: "random",            label: "Random" },
  { value: "custom",            label: "Custom" },
];

export default function LifeControls({
  status,
  rows,
  cols,
  speed,
  pattern,
  wrap,
  onPlay,
  onPause,
  onResume,
  onStep,
  onReset,
  onClear,
  onRandomize,
  onPatternChange,
  onApplySize,
  onSpeedChange,
  onWrapChange,
}) {
  const [localRows, setLocalRows] = useState(rows);
  const [localCols, setLocalCols] = useState(cols);
  const [mode, setMode] = useState("simple");

  useEffect(() => setLocalRows(rows), [rows]);
  useEffect(() => setLocalCols(cols), [cols]);

  const isRunning = status === "running";
  const isPaused  = status === "paused";

  const SPEED_STEPS  = [1000, 700, 400, 150, 50];
  const SPEED_LABELS = ["Very Slow", "Slow", "Normal", "Fast", "Very Fast"];
  const stepIndex = SPEED_STEPS.reduce((best, val, i) =>
    Math.abs(val - speed) < Math.abs(SPEED_STEPS[best] - speed) ? i : best, 0);
  const speedLabel = SPEED_LABELS[stepIndex];

  function applySize() {
    const r = Math.max(5, Math.min(100, localRows || 25));
    const c = Math.max(5, Math.min(150, localCols || 40));
    onApplySize(r, c);
  }

  const patterns = mode === "simple" ? BASIC_PATTERNS : ADVANCED_PATTERNS;

  function handleModeSwitch(newMode) {
    if (isRunning) return;
    setMode(newMode);
    const list = newMode === "simple" ? BASIC_PATTERNS : ADVANCED_PATTERNS;
    const exists = list.some((p) => p.value === pattern);
    if (!exists) onPatternChange(list[0].value);
  }

  const currentIdx = patterns.findIndex((p) => p.value === pattern);
  const displayLabel = patterns[currentIdx]?.label
    ?? [...BASIC_PATTERNS, ...ADVANCED_PATTERNS].find((p) => p.value === pattern)?.label
    ?? pattern;

  return (
    <div className="rounded-xl wood-texture shadow-lg overflow-hidden">
      {/* Header */}
      <div className="w-full h-10 bg-[#8F430F] flex items-center px-4 border-b-2 border-[#4a2511]">
        <span className="text-white text-sm font-bold uppercase tracking-wider">Controls</span>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Pattern section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-base font-bold text-[#2e1413]">Pattern</label>
            {/* Classic / Complex sliding pill toggle */}
            <div
              className="relative flex rounded-full p-0.5"
              style={{ backgroundColor: "#E8D0B0", border: "2px solid #9A4F16", boxShadow: "0 2px 0 0 #4a2511" }}
            >
              {/* Sliding background pill */}
              <div
                style={{
                  position: "absolute",
                  top: 2, bottom: 2,
                  left: mode === "simple" ? 2 : "50%",
                  width: "calc(50% - 2px)",
                  borderRadius: 9999,
                  backgroundColor: "#8F430F",
                  boxShadow: "0 1px 0 0 #4a2511",
                  transition: "left 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
                  pointerEvents: "none",
                }}
              />
              {["simple", "complex"].map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeSwitch(m)}
                  disabled={isRunning}
                  className="relative px-3 py-1 rounded-full text-xs font-bold transition-colors duration-200"
                  style={{
                    width: "4.5rem",
                    color: mode === m ? "#fff" : "#8F430F",
                    zIndex: 1,
                    background: "transparent",
                  }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Pattern arrow selector */}
          <div className="flex items-center gap-3 bg-[#FFF1D8] p-2 rounded-lg border-2 border-[#9A4F16] shadow-inner">
            <button
              className="w-10 h-10 rounded bg-[#E8D0B0] text-[#4a2511] flex items-center justify-center chunky-btn"
              onClick={() => {
                if (isRunning) return;
                const idx  = patterns.findIndex((p) => p.value === pattern);
                const base = idx === -1 ? 0 : idx;
                const prev = patterns[(base - 1 + patterns.length) % patterns.length];
                onPatternChange(prev.value);
              }}
              disabled={isRunning}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="text-lg font-extrabold text-[#8e4e14] flex-1 text-center">
              {displayLabel}
            </span>
            <button
              className="w-10 h-10 rounded bg-[#E8D0B0] text-[#4a2511] flex items-center justify-center chunky-btn"
              onClick={() => {
                if (isRunning) return;
                const idx  = patterns.findIndex((p) => p.value === pattern);
                const base = idx === -1 ? 0 : idx;
                const next = patterns[(base + 1) % patterns.length];
                onPatternChange(next.value);
              }}
              disabled={isRunning}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Playback buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="bg-[#8cf5e4] text-[#005048] rounded-lg py-2.5 font-bold chunky-btn flex items-center justify-center gap-1.5 text-sm"
            onClick={onPlay}
            disabled={isRunning}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            Play
          </button>
          <button
            className="bg-[#e7c268] text-[#5a4400] rounded-lg py-2.5 font-bold chunky-btn flex items-center justify-center gap-1.5 text-sm"
            onClick={onPause}
            disabled={!isRunning}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
            Pause
          </button>
          <button
            className="bg-[#f4a261] text-[#6f3800] rounded-lg py-2.5 font-bold chunky-btn flex items-center justify-center gap-1.5 text-sm"
            onClick={onStep}
            disabled={isRunning}
          >
            <span className="material-symbols-outlined text-lg">skip_next</span>
            Step
          </button>
          <button
            className="bg-[#ffb4ab] text-[#690005] rounded-lg py-2.5 font-bold chunky-btn flex items-center justify-center gap-1.5 text-sm"
            onClick={onReset}
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
            Reset
          </button>
          <button
            className="col-span-2 bg-[#c8b6ff] text-[#3d0066] rounded-lg py-2.5 font-bold chunky-btn flex items-center justify-center gap-1.5 text-sm"
            onClick={onResume}
            disabled={!isPaused}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            Resume
          </button>
          <button
            className="bg-[#b8e8ff] text-[#00344d] rounded-lg py-2.5 font-bold chunky-btn flex items-center justify-center gap-1.5 text-sm"
            onClick={onRandomize}
            disabled={isRunning}
          >
            <span className="material-symbols-outlined text-lg">shuffle</span>
            Randomize
          </button>
          <button
            className="bg-[#ffe0b2] text-[#4a2511] rounded-lg py-2.5 font-bold chunky-btn flex items-center justify-center gap-1.5 text-sm"
            onClick={onClear}
            disabled={isRunning}
          >
            <span className="material-symbols-outlined text-lg">delete_sweep</span>
            Clear
          </button>
        </div>

        {/* Speed slider */}
        <div>
          <label className="text-sm font-bold text-[#2e1413] flex justify-between mb-2">
            <span>Animation Speed</span>
            <span className="text-[#8e4e14]">{speedLabel}</span>
          </label>
          <input
            type="range" min="0" max="4" step="1"
            value={stepIndex}
            onChange={(e) => onSpeedChange(SPEED_STEPS[Number(e.target.value)])}
            className="w-full vial-groove"
          />
          <div className="flex justify-between text-xs text-[#867468] mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Wrap edges toggle */}
        <div
          className="flex items-center justify-between bg-[#FFF1D8] rounded-lg px-4 py-3 border-2 border-[#9A4F16]"
          style={{ boxShadow: "inset 0 2px 4px rgba(74,37,17,0.12)" }}
        >
          <span className="text-sm font-bold text-[#2e1413]">Wrap Edges</span>
          <button
            onClick={() => !isRunning && onWrapChange(!wrap)}
            disabled={isRunning}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{
              backgroundColor: wrap ? "#8e4e14" : "#E8D0B0",
              border: `2px solid ${wrap ? "#4a2511" : "#9A4F16"}`,
              boxShadow: wrap ? "0 2px 0 0 #4a2511" : "0 2px 0 0 #9A4F16",
            }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
              style={{ left: wrap ? "calc(100% - 1.15rem)" : "0.15rem" }}
            />
          </button>
        </div>

      </div>
    </div>
  );
}
