/**
 * MoveHistory.jsx — scrollable move log, capped at MAX_VISIBLE entries.
 */

import { useEffect, useRef } from "react";

const MAX_VISIBLE = 500;

export default function MoveHistory({ moveHistory }) {
  const listRef = useRef(null);

  // Auto-scroll to latest move
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const visible =
    moveHistory.length > MAX_VISIBLE
      ? moveHistory.slice(-MAX_VISIBLE)
      : moveHistory;
  const offset = moveHistory.length - visible.length;

  return (
    <div className="bg-[#F7E6C8] rounded-xl border-2 border-[#9A4F16] shadow-inner overflow-hidden flex flex-col flex-1 min-h-0">
      {/* Header bar */}
      <div className="w-full h-10 bg-[#8F430F] border-b-2 border-[#4a2511] flex items-center px-4 flex-shrink-0 z-10">
        <span className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>receipt_long</span>
          Move Log
          {moveHistory.length > 0 && (
            <span className="text-white/60 font-normal ml-1">({moveHistory.length})</span>
          )}
        </span>
      </div>

      {/* Scrollable list */}
      <div
        className="flex-1 overflow-y-auto history-scroll p-3"
        ref={listRef}
      >
        {moveHistory.length === 0 ? (
          <p className="text-[#867468] text-sm text-center py-6">
            No moves yet. Press Start to begin.
          </p>
        ) : (
          <>
            {offset > 0 && (
              <p className="text-amber-700 text-xs mb-2 font-semibold">
                Showing last {MAX_VISIBLE} of {moveHistory.length} moves
              </p>
            )}
            <div className="space-y-1">
              {visible.map((entry, i) => {
                const isLatest = i === visible.length - 1;
                return (
                  <div
                    key={offset + i}
                    className={`flex items-center gap-3 py-2 px-3 rounded text-sm transition-colors ${
                      isLatest
                        ? "bg-[#F0D8B0] border-l-4 border-[#8e4e14] shadow-sm"
                        : "hover:bg-[#F0D8B0]"
                    } text-[#2e1413]`}
                  >
                    <span className="text-[#8e4e14] w-8 text-right font-bold flex-shrink-0">
                      #{offset + i + 1}
                    </span>
                    <span>{entry}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
