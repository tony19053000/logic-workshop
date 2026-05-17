const CELL_SIZE = 16;
const GAP = 1;

export default function LifeBoard({ grid, onCellClick, isRunning }) {
  const rows = grid?.length ?? 0;
  const cols = grid?.[0]?.length ?? 0;

  return (
    <div
      className="rounded-xl shadow-lg overflow-hidden flex flex-col flex-1"
      style={{
        backgroundColor: "#FAEBD2",
        border: "2px solid #9A4F16",
        backgroundImage: "repeating-linear-gradient(to right,transparent,transparent 10px,rgba(139,69,19,0.02) 10px,rgba(139,69,19,0.02) 20px),repeating-linear-gradient(to bottom,transparent,transparent 15px,rgba(139,69,19,0.015) 15px,rgba(139,69,19,0.015) 30px)",
      }}
    >
      {/* Header */}
      <div className="w-full h-10 bg-[#8F430F] flex items-center justify-between px-4 border-b-2 border-[#4a2511] shrink-0">
        <span className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>grid_on</span>
          Game Board
        </span>
        {rows > 0 && (
          <span className="text-white/60 text-xs font-mono font-bold">
            {rows} × {cols}
          </span>
        )}
      </div>

      {/* Grid + caption: equal flex spacers above and below grid */}
      <div className="flex-1 min-h-0 flex flex-col items-center px-3">
        {/* top spacer — pushes grid to vertical centre */}
        <div className="flex-1" />

        {rows > 0 && cols > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
              gridTemplateRows:    `repeat(${rows}, ${CELL_SIZE}px)`,
              gap: `${GAP}px`,
              backgroundColor: "#D4B896",
              border: "3px solid #9A4F16",
              borderRadius: "6px",
              padding: "1px",
              cursor: isRunning ? "default" : "crosshair",
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  style={{
                    width:           CELL_SIZE,
                    height:          CELL_SIZE,
                    backgroundColor: cell === 1 ? "#8e4e14" : "#F5E8CC",
                    boxShadow:       cell === 1 ? "0 0 3px #f4a261" : "none",
                    transition:      "background-color 0.06s, box-shadow 0.06s",
                  }}
                  onClick={() => !isRunning && onCellClick(r, c)}
                />
              ))
            )}
          </div>
        ) : (
          <span className="text-[#867468] text-sm">Loading grid…</span>
        )}

        {/* bottom spacer — caption sits vertically centred inside it */}
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-[#867468] text-center font-semibold">
            {isRunning ? "Simulation running…" : "Click any cell to toggle it alive or dead"}
          </span>
        </div>
      </div>
    </div>
  );
}
