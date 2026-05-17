import { useState, useEffect } from "react";
import bgImage from "../../assets/bg-landing.png";

export default function LoadingScreen({ game, onDone }) {
  const [progress, setProgress] = useState(0);
  const DURATION = 2000;

  useEffect(() => {
    const start = performance.now();
    let raf;
    function tick(now) {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { onDone(); }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const isHanoi = game === "hanoi";
  const title    = isHanoi ? "Preparing the Tower"                       : "Preparing the Grid";
  const subtitle = isHanoi ? "Arranging disks, rods, and recursive moves..." : "Seeding cells, patterns, and generations...";
  const icon     = isHanoi ? "layers"                                    : "grid_on";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center top" }}/>
      <div style={{ position: "absolute", inset: 0, background: "rgba(245,228,200,0.50)" }}/>

      {/* Content group */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        width: "min(480px, 85vw)",
      }}>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#8F430F", fontSize: 22, fontVariationSettings: "'FILL' 1" }}
          >{icon}</span>
          <span style={{
            fontSize: 22, fontWeight: 800, color: "#8F430F",
            letterSpacing: "-0.01em",
            textShadow: "0 1px 0 rgba(255,248,235,0.65)",
          }}>{title}</span>
        </div>

        {/* Loading bar — unchanged */}
        <div style={{
          width: "100%",
          filter: "drop-shadow(0 6px 18px rgba(62,39,35,0.22))",
        }}>
          <div style={{
            width: "100%", height: 26, borderRadius: 9999,
            background: "linear-gradient(to bottom, #5c3220, #3e2018, #5c3220)",
            padding: "4px 5px", boxSizing: "border-box",
            boxShadow:
              "inset 0 2px 3px rgba(255,255,255,0.08), " +
              "inset 0 -2px 4px rgba(0,0,0,0.35), " +
              "inset 2px 0 3px rgba(0,0,0,0.2), " +
              "inset -2px 0 3px rgba(0,0,0,0.2)",
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: 9999,
              backgroundColor: "#E8D5B0",
              boxShadow: "inset 0 2px 5px rgba(62,39,35,0.25)",
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${progress}%`, borderRadius: 9999,
                background: "linear-gradient(to bottom, #a04c14, #8B4010, #7a3608)",
                boxShadow: "inset 0 1px 3px rgba(255,200,150,0.15), inset 0 -2px 4px rgba(0,0,0,0.3)",
                transition: "width 0.07s linear", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: [
                    "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px, transparent 4px, transparent 7px, rgba(255,255,255,0.04) 7px, rgba(255,255,255,0.04) 8px)",
                    "linear-gradient(to bottom, rgba(255,180,100,0.12) 0%, transparent 40%, rgba(0,0,0,0.12) 100%)",
                  ].join(","),
                }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p style={{
          margin: "14px 0 0", fontSize: 13, fontWeight: 500,
          color: "#8e6e58", opacity: 0.8,
          textAlign: "center", letterSpacing: "0.01em",
        }}>{subtitle}</p>

        {/* Pulsing dots */}
        <div style={{ display: "flex", gap: 7, marginTop: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%",
              backgroundColor: "#9A4F16",
              animation: `ls-dot-pulse 1.3s ease-in-out ${i * 0.22}s infinite`,
            }}/>
          ))}
        </div>

      </div>
    </div>
  );
}
