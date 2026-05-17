import { useState, useEffect } from "react";
import bgImage from "../../assets/bg-landing.png";

// ── Deterministic background particles ────────────────────────────────────
const PARTICLES = Array.from({ length: 80 }, (_, i) => ({
  id:      i,
  size:    4 + (i * 7 + 3) % 16,
  left:    ((i * 43 + 7) % 93) + 3.5,
  bottom:  -((i * 7 + 3) % 16),
  dur:     10 + (i * 3 + 1) % 17,
  delay:   -((i * 2.1) % 16),
  round:   i % 4 === 2,
  color:   i % 5 === 0 ? "#e7c268" : i % 5 === 1 ? "#8cf5e4" : i % 5 === 2 ? "#ffb4ab" : "#8B4513",
  opacity: 0.06 + (i % 7) * 0.012,
}));

function BgParticles() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {PARTICLES.map(p => (
        <div key={p.id} style={{
          position:        "absolute",
          width:            p.size,
          height:           p.round ? p.size : Math.round(p.size * 0.45 + 3),
          left:            `${p.left}%`,
          bottom:           p.bottom,
          backgroundColor:  p.color,
          borderRadius:     p.round ? 9999 : 3,
          opacity:          p.opacity,
          animation:       `lw-particle-float ${p.dur}s ${p.delay}s linear infinite`,
        }}/>
      ))}
    </div>
  );
}


// ── Animated Tower of Hanoi mini-board ───────────────────────────────────
const H_CX   = { A: 55, B: 140, C: 225 }; // rod centre-x in 280px canvas
const H_DW   = { 1: 24, 2: 40,  3: 56  }; // disk widths
const H_COL  = { 1:"#ffb4ab", 2:"#8cf5e4", 3:"#e7c268" };
const H_BASE = 8;   // base bar height from bottom
const H_GAP  = 15;  // vertical gap per stacked disk
const H_LIFT = 98;  // lifted y (bottom px) — above rod tops
const H_MOVES_AC = [["A","C"],["A","B"],["C","B"],["A","C"],["B","A"],["B","C"],["A","C"]];
const H_MOVES_CA = [["C","A"],["C","B"],["A","B"],["C","A"],["B","C"],["B","A"],["C","A"]];

function initPos(tow) {
  const pos = {};
  ["A","B","C"].forEach(rod =>
    tow[rod].forEach((disk, i) => {
      pos[disk] = { x: H_CX[rod] - H_DW[disk]/2, y: H_BASE + i*H_GAP };
    })
  );
  return pos;
}

function HanoiDeco() {
  const INIT_TOW = { A:[3,2,1], B:[], C:[] };
  const [pos, setPos]         = useState(() => initPos(INIT_TOW));
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let alive = true;
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    async function run() {
      let tow = { A:[3,2,1], B:[], C:[] };
      setPos(initPos(tow));
      setOpacity(1);
      await sleep(700);

      const sequences = [H_MOVES_AC, H_MOVES_CA];
      let seq = 0;

      while (alive) {
        for (const [from, to] of sequences[seq % 2]) {
          if (!alive) return;
          const disk = tow[from][tow[from].length - 1];

          // 1. Lift
          setPos(p => ({ ...p, [disk]: { x: p[disk].x, y: H_LIFT } }));
          await sleep(450);

          // 2. Slide across
          const newTow = { ...tow, [from]: tow[from].slice(0,-1), [to]: [...tow[to], disk] };
          const finalX = H_CX[to] - H_DW[disk]/2;
          setPos(p => ({ ...p, [disk]: { x: finalX, y: H_LIFT } }));
          await sleep(480);

          // 3. Drop
          const finalY = H_BASE + newTow[to].indexOf(disk) * H_GAP;
          setPos(p => ({ ...p, [disk]: { x: finalX, y: finalY } }));
          tow = newTow;
          await sleep(460);
        }

        // Pause between direction changes
        await sleep(1000);
        seq++;
      }
    }

    run();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ display:"flex", justifyContent:"center" }}>
      <div style={{ position:"relative", width:280, height:130, flexShrink:0 }}>

        {/* Base bar */}
        <div style={{
          position:"absolute", bottom:0, left:4, right:4, height:H_BASE,
          backgroundColor:"#8B4513", borderRadius:4,
          boxShadow:"0 3px 8px rgba(139,69,19,0.5)",
        }}/>

        {/* Rods */}
        {(["A","B","C"]).map(rod => (
          <div key={rod} style={{
            position:"absolute", bottom:H_BASE, left:H_CX[rod]-3, width:6, height:80,
            backgroundColor:"#5c2d0e", borderRadius:"3px 3px 0 0",
            boxShadow:"inset -1px 0 3px rgba(0,0,0,0.35)",
          }}/>
        ))}

        {/* Disks */}
        {[3,2,1].map(disk => (
          <div key={disk} style={{
            position:"absolute",
            left: pos[disk]?.x ?? H_CX.A - H_DW[disk]/2,
            bottom: pos[disk]?.y ?? H_BASE,
            width: H_DW[disk],
            height: 13,
            borderRadius: 9999,
            backgroundColor: H_COL[disk],
            border: "1.5px solid rgba(0,0,0,0.12)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.4)",
            opacity,
            transition: "left 0.44s cubic-bezier(0.4,0,0.2,1), bottom 0.42s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease",
            zIndex: disk,
          }}/>
        ))}
      </div>
    </div>
  );
}

// ── Game of Life mini-grid ────────────────────────────────────────────────
const LIFE_COLS = 13, LIFE_ROWS = 7;
const ALIVE = new Set([
  2, 14, 24, 25, 26,
  20, 21, 33, 34,
  42, 43, 44,
  49, 50, 62, 64,
  70, 71, 83, 84,
  8, 9, 10, 22,
]);

function LifeDeco() {
  const CELL=16, GAP=3;
  return (
    <div style={{ display:"flex", justifyContent:"center" }}>
      <div style={{
        display:"grid",
        gridTemplateColumns:`repeat(${LIFE_COLS}, ${CELL}px)`,
        gap:`${GAP}px`,
      }}>
        {Array.from({ length:LIFE_COLS*LIFE_ROWS }, (_,i) => {
          const a = ALIVE.has(i);
          return (
            <div key={i} style={{
              width:CELL, height:CELL, borderRadius:3,
              backgroundColor: a ? "#8e4e14" : "#e2cdb6",
              boxShadow:       a ? "0 0 6px rgba(244,162,97,0.6)" : "none",
              animation:`lw-cell-pulse ${1.5+(i%5)*0.38}s ease-in-out infinite`,
              animationDelay:`${(i%13)*0.09}s`,
              animationDirection: i%2===0 ? "alternate" : "alternate-reverse",
            }}/>
          );
        })}
      </div>
    </div>
  );
}

// ── Game card ─────────────────────────────────────────────────────────────
function GameCard({ game, onClick, enterDelay, animate }) {
  const [hov, setHov] = useState(false);
  const isH = game === "hanoi";
  const ACCBTN = isH ? "#e7c268" : "#8cf5e4";
  const ADKBTN = isH ? "#5a4400" : "#005048";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 400,
        cursor: "default",
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F7E6C8",
        backgroundImage: [
          "repeating-linear-gradient(to right,transparent,transparent 10px,rgba(139,69,19,0.022) 10px,rgba(139,69,19,0.022) 20px)",
          "repeating-linear-gradient(to bottom,transparent,transparent 15px,rgba(139,69,19,0.014) 15px,rgba(139,69,19,0.014) 30px)",
        ].join(","),
        border: `2px solid ${hov ? "#5A2A1D" : "#9A4F16"}`,
        transform: hov ? "translateY(-14px) scale(1.025)" : "translateY(0) scale(1)",
        transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.25s ease",
        boxShadow: hov
          ? "0 28px 52px rgba(74,36,28,0.38), 0 8px 18px rgba(74,36,28,0.18), 0 0 0 3px rgba(154,79,22,0.35), inset 0 1px 0 rgba(255,248,235,0.5)"
          : "0 8px 28px rgba(74,36,28,0.22), 0 2px 8px rgba(74,36,28,0.1), inset 0 1px 0 rgba(255,248,235,0.4)",
        animation: animate ? `lw-card-enter 0.7s ease-out ${enterDelay} both` : "none",
      }}
    >
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 20px", height:52,
        backgroundColor: "#4A241C",
        borderBottom: "2px solid #34120a",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span className="material-symbols-outlined"
            style={{ fontSize:18, color:"#f4a261", fontVariationSettings:"'FILL' 1" }}>
            {isH ? "layers" : "grid_on"}
          </span>
          <span style={{ fontSize:15, fontWeight:800, color:"#ffffff",
            textTransform:"uppercase", letterSpacing:1.2 }}>
            {isH ? "Tower of Hanoi" : "Game of Life"}
          </span>
        </div>
      </div>

      <div style={{
        display:"flex", alignItems:"center", justifyContent:"center",
        backgroundColor:"#FAEBD2",
        backgroundImage:[
          "linear-gradient(rgba(139,69,19,0.028) 1px, transparent 1px)",
          "linear-gradient(90deg, rgba(139,69,19,0.028) 1px, transparent 1px)",
        ].join(","),
        backgroundSize:"24px 24px",
        height:192, padding:"20px 16px",
        borderBottom:"2px solid #C9A87A",
      }}>
        {isH ? <HanoiDeco/> : <LifeDeco/>}
      </div>

      <div style={{ padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:16, flex:1 }}>
        <p style={{ fontSize:15, lineHeight:1.65, color:"#4a3426", margin:0 }}>
          {isH
            ? "Move disks between rods using recursion, breaking the puzzle into smaller subproblems until the base case is reached."
            : "Simulate cell patterns across generations using iteration, where each cell updates based on simple neighbour-based survival rules."}
        </p>

        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginTop:"auto" }}>
          <span style={{ fontSize:12, fontWeight:800, color:"#8e6e58",
            textTransform:"uppercase", letterSpacing:1.5 }}>Concept</span>
          {isH ? (
            <>
              <span style={{
                fontSize:13, fontWeight:700, padding:"4px 12px", borderRadius:6,
                backgroundColor:"#FFF1D8", color:"#6b3010",
                border:"1px solid rgba(154,79,22,0.3)",
              }}>Recursion</span>
              <span style={{
                fontSize:13, fontWeight:700, padding:"4px 12px", borderRadius:6,
                backgroundColor:"#FFF1D8", color:"#6b3010",
                border:"1px solid rgba(154,79,22,0.3)",
              }}>Divide & Conquer</span>
            </>
          ) : (
            <>
              <span style={{
                fontSize:13, fontWeight:700, padding:"4px 12px", borderRadius:6,
                backgroundColor:"#FFF1D8", color:"#6b3010",
                border:"1px solid rgba(154,79,22,0.3)",
              }}>Iteration</span>
              <span style={{
                fontSize:13, fontWeight:700, padding:"4px 12px", borderRadius:6,
                backgroundColor:"#FFF1D8", color:"#6b3010",
                border:"1px solid rgba(154,79,22,0.3)",
              }}>Cellular Automaton</span>
            </>
          )}
        </div>

        <button
          className="chunky-btn"
          onClick={onClick}
          style={{
            width:"100%", padding:"14px 0", borderRadius:13,
            backgroundColor: ACCBTN, color: ADKBTN,
            fontSize:15, fontWeight:800,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}
        >
          <span className="material-symbols-outlined"
            style={{ fontSize:20, fontVariationSettings:"'FILL' 1" }}>
            play_circle
          </span>
          Launch Visualizer
        </button>
      </div>
    </div>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────
let _landingAnimated = false;

export default function LandingPage({ onSelectGame }) {
  const firstVisit = !_landingAnimated;
  const [tick, setTick] = useState(false);
  useEffect(() => {
    if (!firstVisit) return;
    const id = setTimeout(() => { setTick(true); _landingAnimated = true; }, 60);
    return () => clearTimeout(id);
  }, []);

  return (
    <div style={{
      height:"100vh", width:"100vw", overflow:"hidden",
      position:"relative", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      backgroundImage:`url(${bgImage})`,
      backgroundSize:"cover",
      backgroundPosition:"center top",
    }}>

      {/* Warm translucent overlay — keeps bg visible, softens glare */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        background:"linear-gradient(180deg, rgba(244,218,168,0.38) 0%, rgba(230,200,148,0.44) 100%)",
      }}/>

      <BgParticles/>

      {/* ── TITLE ──────────────────────────────────────────────────────── */}
      <div style={{
        textAlign:"center", marginBottom:48, zIndex:1, position:"relative",
        animation: (firstVisit && tick) ? "lw-fade-up 0.65s ease-out both" : "none",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, marginBottom:10 }}>
          <div style={{ width:52, height:1.5, background:"linear-gradient(to right,transparent,rgba(143,67,15,0.55))" }}/>
          <span style={{ fontSize:11, fontWeight:800, letterSpacing:"0.35em",
            color:"#8F430F", opacity:0.62, textTransform:"uppercase" }}>
            Algorithm Demos
          </span>
          <div style={{ width:52, height:1.5, background:"linear-gradient(to left,transparent,rgba(143,67,15,0.55))" }}/>
        </div>

        <h1 style={{
          margin:0, fontWeight:900, textTransform:"uppercase",
          fontSize:"clamp(3rem,6.5vw,5.5rem)",
          letterSpacing:"-0.04em", lineHeight:1,
          color:"#8F430F",
          textShadow:"0 3px 14px rgba(143,67,15,0.28), 0 1px 0 rgba(255,248,235,0.7)",
        }}>
          Logic Workshop
        </h1>

        <p style={{
          margin:"14px 0 0", fontSize:18, fontWeight:400,
          color:"#7a4a26", letterSpacing:"0.02em", opacity:0.70,
          fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",
        }}>
          Explore classic algorithms through interactive visualizations
        </p>
      </div>

      {/* ── CARDS ──────────────────────────────────────────────────────── */}
      <div style={{
        display:"flex", flexDirection:"row", gap:36,
        zIndex:1, position:"relative", padding:"0 24px",
        animation: (firstVisit && tick) ? "lw-fade-up 0.65s ease-out 0.12s both" : "none",
      }}>
        <GameCard game="hanoi" onClick={() => onSelectGame("hanoi")} enterDelay="0s"   animate={firstVisit && tick}/>
        <GameCard game="life"  onClick={() => onSelectGame("life")}  enterDelay="0.1s" animate={firstVisit && tick}/>
      </div>

      {/* ── FOOTER LINKS ───────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 28, justifyContent: "center", alignItems: "center",
        position: "absolute", bottom: 18, left: 0, right: 0, zIndex: 2,
        animation: (firstVisit && tick) ? "lw-fade-up 0.65s ease-out 0.2s both" : "none",
      }}>
        {[
          {
            href: "https://github.com/tony19053000",
            title: "GitHub",
            svg: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            ),
          },
          {
            href: "https://www.linkedin.com/in/aayush-kumar-446294305/",
            title: "LinkedIn",
            svg: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            ),
          },
          {
            href: "https://github.com/tony19053000/logic-workshop",
            title: "Source Code",
            svg: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            ),
          },
        ].map(({ href, title, svg }) => (
          <a
            key={title}
            href={href}
            title={title}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#4a2511",
              opacity: 0.85,
              transition: "opacity 0.18s, transform 0.18s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "0.65"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {svg}
          </a>
        ))}
      </div>

    </div>
  );
}
