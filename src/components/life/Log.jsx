/** LifeLog.jsx — generation history log. */

import { useEffect, useRef } from "react";

const MAX_VISIBLE = 100;

export default function LifeLog({ log }) {
  const listRef = useRef(null);

  // Auto-scroll to the latest entry
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [log]);

  const visible = log.length > MAX_VISIBLE ? log.slice(-MAX_VISIBLE) : log;
  const offset  = log.length - visible.length;

  return (
    <div className="bg-[#F7E6C8] rounded-xl border-2 border-[#9A4F16] shadow-inner overflow-hidden flex flex-col h-full">
      {/* Header bar */}
      <div className="w-full h-10 bg-[#8F430F] border-b-2 border-[#4a2511] flex items-center px-4 flex-shrink-0">
        <span className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>receipt_long</span>
          Generation Log
          {log.length > 0 && (
            <span className="text-white/60 font-normal ml-1">({log.length})</span>
          )}
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto history-scroll p-3" ref={listRef}>
        {log.length === 0 ? (
          <p className="text-[#867468] text-sm text-center py-6">
            No generations yet. Press Play or Step to begin.
          </p>
        ) : (
          <>
            {offset > 0 && (
              <p className="text-amber-700 text-xs mb-2 font-semibold">
                Showing last {MAX_VISIBLE} of {log.length} entries
              </p>
            )}
            <div className="space-y-1">
              {visible.map((entry, i) => {
                const isLatest = i === visible.length - 1;
                return (
                  <div
                    key={offset + i}
                    className={`py-1.5 px-3 rounded text-xs font-mono transition-colors ${
                      isLatest
                        ? "bg-[#F0D8B0] border-l-4 border-[#8e4e14] shadow-sm text-[#2e1413]"
                        : "hover:bg-[#F0D8B0] text-[#534439]"
                    }`}
                  >
                    {entry}
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
