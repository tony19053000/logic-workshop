/** ControlPanel.jsx — disk input, playback buttons, and speed slider. */

export default function ControlPanel({
  diskCount,
  setDiskCount,
  status,
  speed,
  setSpeed,
  onStart,
  onPause,
  onResume,
  onReset,
  onStepForward,
  warning,
}) {
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isCompleted = status === "completed";
  const isReady = status === "ready";

  const SPEED_STEPS  = [1000, 700, 400, 150, 50];
  const SPEED_LABELS = ["Very Slow", "Slow", "Normal", "Fast", "Very Fast"];
  const stepIndex = SPEED_STEPS.reduce((best, val, i) =>
    Math.abs(val - speed) < Math.abs(SPEED_STEPS[best] - speed) ? i : best, 0);
  const speedLabel = SPEED_LABELS[stepIndex];

  return (
    <div className="rounded-xl wood-texture shadow-lg relative overflow-hidden">
      {/* Card header bar */}
      <div className="w-full h-10 bg-[#8F430F] flex items-center px-4 border-b-2 border-[#4a2511]">
        <span className="text-white text-sm font-bold uppercase tracking-wider">Controls</span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Disk count stepper */}
        <div>
          <label className="text-sm font-bold text-[#2e1413] block mb-2">Number of Disks</label>
          <div className="flex items-center gap-3 bg-[#FFF1D8] p-2 rounded-lg border-2 border-[#9A4F16] shadow-inner">
            <button
              className="w-10 h-10 rounded bg-[#E8D0B0] text-[#4a2511] flex items-center justify-center chunky-btn"
              onClick={() => !isRunning && diskCount > 1 && setDiskCount(diskCount - 1)}
              disabled={isRunning}
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="text-2xl font-extrabold text-[#8e4e14] flex-1 text-center">{diskCount}</span>
            <button
              className="w-10 h-10 rounded bg-[#E8D0B0] text-[#4a2511] flex items-center justify-center chunky-btn"
              onClick={() => !isRunning && setDiskCount(diskCount + 1)}
              disabled={isRunning}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          {diskCount > 8 && (
            <p className="text-amber-700 text-xs mt-2 font-semibold">⚠ Large disk count — may take long to animate.</p>
          )}
        </div>

        {/* Playback buttons — 2-col grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="bg-[#8cf5e4] text-[#005048] rounded-lg py-3 font-bold chunky-btn flex items-center justify-center gap-2 text-sm"
            onClick={onStart}
            disabled={isRunning}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            Start
          </button>

          <button
            className="bg-[#e7c268] text-[#5a4400] rounded-lg py-3 font-bold chunky-btn flex items-center justify-center gap-2 text-sm"
            onClick={onPause}
            disabled={!isRunning}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
            Pause
          </button>

          <button
            className="bg-[#f4a261] text-[#6f3800] rounded-lg py-3 font-bold chunky-btn flex items-center justify-center gap-2 text-sm"
            onClick={onStepForward}
            disabled={isRunning || isCompleted}
          >
            <span className="material-symbols-outlined">skip_next</span>
            Step
          </button>

          <button
            className="bg-[#ffb4ab] text-[#690005] rounded-lg py-3 font-bold chunky-btn flex items-center justify-center gap-2 text-sm"
            onClick={onReset}
            disabled={isReady}
          >
            <span className="material-symbols-outlined">restart_alt</span>
            Reset
          </button>

          {/* Resume — full width */}
          <button
            className="col-span-2 bg-[#c8b6ff] text-[#3d0066] rounded-lg py-3 font-bold chunky-btn flex items-center justify-center gap-2 text-sm"
            onClick={onResume}
            disabled={!isPaused}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            Resume
          </button>
        </div>

        {/* Speed slider */}
        <div>
          <label className="text-sm font-bold text-[#2e1413] flex justify-between mb-2">
            <span>Animation Speed</span>
            <span className="text-[#8e4e14]">{speedLabel}</span>
          </label>
          <input
            type="range"
            min="0"
            max="4"
            step="1"
            value={stepIndex}
            onChange={(e) => setSpeed(SPEED_STEPS[Number(e.target.value)])}
            className="w-full vial-groove"
          />
          <div className="flex justify-between text-xs text-[#867468] mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
