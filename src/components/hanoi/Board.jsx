/**
 * HanoiBoard.jsx — visual towers and disks.
 * towers.A/B/C: index 0 = bottom disk; flex-col-reverse handles visual order.
 */

const DISK_COLORS = [
  { bg: "#ffb4ab", text: "#690005" },
  { bg: "#8cf5e4", text: "#005048" },
  { bg: "#ffdf96", text: "#5a4400" },
  { bg: "#ffdcc4", text: "#4a2511" },
  { bg: "#f4a261", text: "#4a2511" },
  { bg: "#c8b6ff", text: "#3d0066" },
  { bg: "#adf7b6", text: "#1a4423" },
  { bg: "#ffc6ff", text: "#6b006b" },
  { bg: "#fdffb6", text: "#5a4400" },
  { bg: "#caffbf", text: "#1a4423" },
];

function diskColor(diskNum) {
  return DISK_COLORS[(diskNum - 1) % DISK_COLORS.length];
}

function diskWidthPct(diskNum, totalDisks) {
  if (totalDisks <= 1) return 80;
  const min = 22, max = 88;
  return min + ((diskNum - 1) / (totalDisks - 1)) * (max - min);
}

function getDiskHeight(totalDisks) {
  if (totalDisks <= 8)  return 36;
  if (totalDisks <= 10) return 28;
  if (totalDisks <= 13) return 22;
  if (totalDisks <= 16) return 16;
  return 12;
}

function Disk({ diskNum, totalDisks, compact }) {
  const { bg, text } = diskColor(diskNum);
  const width = diskWidthPct(diskNum, totalDisks);
  const height = compact ? 12 : getDiskHeight(totalDisks);
  const fontSize = height >= 30 ? "15px" : height >= 22 ? "11px" : height >= 16 ? "9px" : "0px";

  return (
    <div
      className="disk-3d rounded-full flex items-center justify-center font-extrabold select-none flex-shrink-0"
      style={{
        width: `${width}%`,
        height: `${height}px`,
        backgroundColor: bg,
        color: text,
        fontSize,
        letterSpacing: "-0.02em",
      }}
      title={`Disk ${diskNum}`}
    >
      {fontSize !== "0px" && diskNum}
    </div>
  );
}

function Tower({ label, disks, totalDisks, compact }) {
  const gap = 3;

  return (
    <div className="relative flex flex-col flex-1 items-center">
      {/* Peg */}
      <div
        className="absolute top-0 bottom-0 w-4 bg-[#8F430F] rounded-t-full border-x-2 border-[#4a2511]"
        style={{ zIndex: 0, left: "50%", transform: "translateX(-50%)", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.35)" }}
      />

      {/* Disk stack */}
      <div
        className="absolute bottom-0 left-0 right-0 flex flex-col-reverse items-center"
        style={{ gap: `${gap}px`, zIndex: 2, paddingBottom: "2px" }}
      >
        {disks.map((diskNum) => (
          <Disk
            key={diskNum}
            diskNum={diskNum}
            totalDisks={totalDisks}
            compact={compact}
          />
        ))}
      </div>

      {/* Tower label — below the tower area */}
      <span
        className="absolute text-3xl font-extrabold text-[#4a2511] select-none"
        style={{ opacity: 0.55, bottom: "-2.25rem" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function HanoiBoard({ towers, diskCount, latestMove }) {
  const totalDisks = diskCount || 3;
  const compact = totalDisks > 16;

  return (
    <div className="rounded-xl shadow-2xl overflow-hidden flex flex-col flex-1" style={{ backgroundColor:"#FAEBD2", border:"2px solid #9A4F16", backgroundImage:"repeating-linear-gradient(to right,transparent,transparent 10px,rgba(139,69,19,0.02) 10px,rgba(139,69,19,0.02) 20px),repeating-linear-gradient(to bottom,transparent,transparent 15px,rgba(139,69,19,0.015) 15px,rgba(139,69,19,0.015) 30px)" }}>
      {compact && (
        <p className="text-amber-700 text-xs px-5 pt-3 font-semibold">
          Compact view ({totalDisks} disks) — numbers hidden.
        </p>
      )}

      {/* Tower area */}
      <div className="flex-1 flex px-8 pt-6" style={{ paddingBottom: "2.75rem" }}>
        {["A", "B", "C"].map((label) => (
          <Tower
            key={label}
            label={label}
            disks={towers[label]}
            totalDisks={totalDisks}
            compact={compact}
          />
        ))}
      </div>

      {/* Wooden base */}
      <div className="w-full h-12 bg-[#8F430F] border-t-2 border-[#4a2511] flex items-center justify-center flex-shrink-0">
        <div className="w-11/12 h-2 bg-[#4a2511] rounded-full opacity-25" />
      </div>
    </div>
  );
}
