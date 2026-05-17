import { useRef, useState } from "react";

export default function HelpModal({ game, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  function handleClose() {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }
  // Hanoi refs
  const overviewRef = useRef(null);
  const logicRef    = useRef(null);
  const codeRef     = useRef(null);
  const complexRef  = useRef(null);
  const demoRef     = useRef(null);
  // Life refs
  const lifeOverviewRef = useRef(null);
  const lifeRulesRef    = useRef(null);
  const lifeAlgoRef     = useRef(null);
  const lifeComplexRef  = useRef(null);
  const lifePatternsRef = useRef(null);
  const lifeDemoRef     = useRef(null);

  const bodyRef = useRef(null);

  const NAV = game === "hanoi" ? [
    { label: "Overview",    ref: overviewRef     },
    { label: "Logic",       ref: logicRef        },
    { label: "Code",        ref: codeRef         },
    { label: "Complexity",  ref: complexRef      },
    { label: "Demo",        ref: demoRef         },
  ] : game === "life" ? [
    { label: "Overview",    ref: lifeOverviewRef  },
    { label: "Rules",       ref: lifeRulesRef     },
    { label: "Algorithm",   ref: lifeAlgoRef      },
    { label: "Complexity",  ref: lifeComplexRef   },
    { label: "Patterns",    ref: lifePatternsRef  },
    { label: "Demo",        ref: lifeDemoRef      },
  ] : [];

  function scrollTo(ref) {
    if (!ref.current || !bodyRef.current) return;
    const top = ref.current.getBoundingClientRect().top
              - bodyRef.current.getBoundingClientRect().top
              + bodyRef.current.scrollTop - 8;
    bodyRef.current.scrollTo({ top, behavior: "smooth" });
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        backgroundColor: "rgba(30,14,6,0.62)",
        backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
        animation: isClosing ? "lw-fade-down 0.3s ease both" : "lw-fade-up 0.3s ease both",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: "flex", flexDirection: "column",
          width: "min(880px, 100%)",
          maxHeight: "92vh",
          backgroundColor: "#F7E6C8",
          backgroundImage: [
            "repeating-linear-gradient(to right,transparent,transparent 10px,rgba(139,69,19,0.025) 10px,rgba(139,69,19,0.025) 20px)",
            "repeating-linear-gradient(to bottom,transparent,transparent 15px,rgba(139,69,19,0.015) 15px,rgba(139,69,19,0.015) 30px)",
          ].join(","),
          border: "3px solid #9A4F16",
          borderRadius: 20,
          boxShadow: "0 28px 72px rgba(30,10,4,0.55), 0 0 0 1px rgba(244,162,97,0.12)",
          overflow: "hidden",
        }}
      >
        {/* ── Fixed header ── */}
        <div style={{ flexShrink: 0, backgroundColor: "#3e2723", borderBottom: "3px solid #2a1406" }}>
          <div style={{ padding: "15px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="material-symbols-outlined"
                style={{ color: "#f4a261", fontSize: 22, fontVariationSettings: "'FILL' 1" }}>
                {game === "life" ? "grid_on" : "layers"}
              </span>
              <span style={{ color: "#f4a261", fontWeight: 800, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {game === "hanoi" ? "Tower of Hanoi — Algorithm Guide" : "Conway's Game of Life — Algorithm Guide"}
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "50%", width: 34, height: 34,
                cursor: "pointer", color: "#f4a261",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17,
              }}
            >✕</button>
          </div>

          {NAV.length > 0 && (
            <div style={{ display: "flex", gap: 6, padding: "0 22px 12px", overflowX: "auto" }}>
              {NAV.map(({ label, ref }) => (
                <button
                  key={label}
                  onClick={() => scrollTo(ref)}
                  style={{
                    background: "rgba(244,162,97,0.1)",
                    border: "1px solid rgba(244,162,97,0.28)",
                    borderRadius: 999, padding: "4px 16px",
                    color: "#f4a261",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >{label}</button>
              ))}
            </div>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div
          ref={bodyRef}
          className="main-scroll"
          style={{ flex: 1, overflowY: "auto", padding: "24px 24px 36px" }}
        >
          {game === "hanoi" && (
            <HanoiGuide
              overviewRef={overviewRef}
              logicRef={logicRef}
              codeRef={codeRef}
              complexRef={complexRef}
              demoRef={demoRef}
            />
          )}
          {game === "life" && (
            <LifeGuide
              overviewRef={lifeOverviewRef}
              rulesRef={lifeRulesRef}
              algoRef={lifeAlgoRef}
              complexRef={lifeComplexRef}
              patternsRef={lifePatternsRef}
              demoRef={lifeDemoRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Hanoi Guide
// ════════════════════════════════════════════════════════════

function HanoiGuide({ overviewRef, logicRef, codeRef, complexRef, demoRef }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* 1 ── Hero */}
      <div ref={overviewRef} style={{
        display: "flex", gap: 20, alignItems: "flex-start",
        backgroundColor: "#FFF1D8", border: "2px solid #9A4F16",
        borderRadius: 14, padding: "20px 22px",
        boxShadow: "0 4px 16px rgba(42,20,8,0.08)",
      }}>
        <MiniTowerSVG />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#3a1c0e", marginBottom: 8 }}>
            Recursive Puzzle Strategy
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#534439", marginBottom: 14 }}>
            Tower of Hanoi is a classic puzzle where disks are moved between three rods while
            following a simple rule: a larger disk can never be placed on a smaller one. The
            solution breaks the puzzle into smaller moves until only one disk needs to be moved.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { t: "Recursion",         bg: "rgba(140,245,228,0.28)", bo: "#5abfb0", c: "#005048" },
              { t: "Divide & Conquer",  bg: "rgba(231,194,104,0.32)", bo: "#c8960c", c: "#5a4400" },
              { t: "Exponential Moves", bg: "rgba(255,180,171,0.32)", bo: "#e87060", c: "#690005" },
            ].map(({ t, bg, bo, c }) => (
              <span key={t} style={{
                backgroundColor: bg, border: `1.5px solid ${bo}`,
                borderRadius: 999, padding: "3px 12px",
                fontSize: 11.5, fontWeight: 800, color: c, letterSpacing: "0.04em",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 2 ── Goal */}
      <GuideSection title="Goal" icon="flag">
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[
            <span>Move all disks from rod <b>A</b> to rod <b>C</b> using rod <b>B</b> as the auxiliary.</span>,
            <span>Only <b>one disk</b> can be moved at a time — always the top disk of a rod.</span>,
            <span>A <b>larger disk</b> can never be placed on top of a <b>smaller disk</b>.</span>,
            <span>Rod B acts as the <b>auxiliary rod</b>, temporarily holding disks during the solution.</span>,
          ].map((el, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                backgroundColor: "#f4a261", color: "#3a1c0e",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900, marginTop: 3,
              }}>{i + 1}</span>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#2e1413", margin: 0 }}>{el}</p>
            </div>
          ))}
        </div>
      </GuideSection>

      {/* 3 ── Core Recursive Idea */}
      <div ref={logicRef}>
        <GuideSection title="Core Recursive Idea" icon="autorenew">
          <p style={{ fontSize: 13, color: "#3a1c0e", marginBottom: 14, lineHeight: 1.6 }}>
            To move <strong style={{ color: "#8e4e14" }}>n</strong> disks from source to target, always apply three steps in order:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { num: 1, accent: "#8cf5e4", label: "Clear the path",    text: <span>Move <b>n − 1</b> disks from <b>source → auxiliary</b>. This frees up the largest disk at the bottom.</span> },
              { num: 2, accent: "#e7c268", label: "Place the anchor",  text: <span>Move the <b>largest disk</b> directly from <b>source → target</b>. This is the pivotal step of each recursion.</span> },
              { num: 3, accent: "#f4a261", label: "Rebuild the stack", text: <span>Move <b>n − 1</b> disks from <b>auxiliary → target</b>, placing them on top of the anchor disk.</span> },
            ].map(({ num, accent, label, text }) => (
              <div key={num} style={{
                display: "flex", gap: 14, alignItems: "flex-start",
                backgroundColor: "rgba(255,255,255,0.55)",
                border: "1.5px solid rgba(154,79,22,0.18)",
                borderLeft: `4px solid ${accent}`,
                borderRadius: 10, padding: "12px 16px",
              }}>
                <div style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                  backgroundColor: accent, color: "#3a1c0e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 13,
                }}>{num}</div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#3a1c0e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "#2e1413" }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 14, backgroundColor: "rgba(231,194,104,0.2)",
            border: "1.5px solid rgba(200,150,12,0.35)",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 13, lineHeight: 1.65, color: "#2e1413",
          }}>
            <strong style={{ color: "#8e4e14" }}>Base case:</strong> When n = 1, move the single disk directly — no recursion needed. This terminates the chain.
          </div>
        </GuideSection>
      </div>

      {/* 4 ── Pseudocode */}
      <div ref={codeRef}>
        <GuideSection title="Pseudocode" icon="code">
          <pre style={{
            backgroundColor: "#1e0d04", color: "#f4c87a",
            borderRadius: 10, padding: "16px 18px",
            fontSize: 15, lineHeight: 2,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            overflowX: "auto", margin: "0 0 14px",
            border: "2px solid #4a1e08",
          }}>{`hanoi(n, source, target, aux):
    if n == 1:
        move disk 1  from  source  →  target
        return

    hanoi(n − 1,  source,  aux,    target)   # 1. clear
    move disk n   from     source  →  target  # 2. anchor
    hanoi(n − 1,  aux,     target, source)   # 3. rebuild`}</pre>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.5)", border: "1px solid rgba(154,79,22,0.2)",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 14, lineHeight: 1.7, color: "#3a1c0e",
          }}>
            The <strong style={{ color: "#8e4e14" }}>first recursive call</strong> clears the top n−1 disks,
            the <strong style={{ color: "#8e4e14" }}>middle move</strong> places the largest disk in its final position,
            and the <strong style={{ color: "#8e4e14" }}>final recursive call</strong> rebuilds the full stack on top of it.
          </div>
        </GuideSection>
      </div>

      {/* 5 ── Rules */}
      <GuideSection title="Rules" icon="rule">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "touch_app",    text: <span>Only the <b>top disk</b> of a rod may be moved.</span> },
            { icon: "layers",       text: <span>A disk can only land on an <b>empty rod</b> or a <b>larger disk</b>.</span> },
            { icon: "filter_1",     text: <span>Exactly <b>one disk</b> moves per step — no shortcuts.</span> },
            { icon: "emoji_events", text: <span>Puzzle is solved when all disks are on <b>rod C</b>.</span> },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1.5px solid rgba(154,79,22,0.18)",
              borderRadius: 8, padding: "10px 12px",
            }}>
              <span className="material-symbols-outlined"
                style={{ color: "#f4a261", fontSize: 18, flexShrink: 0, marginTop: 1, fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.65, color: "#534439" }}>{text}</span>
            </div>
          ))}
        </div>
      </GuideSection>

      {/* 6 ── Complexity */}
      <div ref={complexRef}>
        <GuideSection title="Complexity" icon="speed">
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1.5px solid rgba(154,79,22,0.2)", marginBottom: 14 }}>
            {[
              { label: "Minimum moves",            value: <span>2<sup>n</sup> − 1</span>,                   hi: true  },
              { label: "Time complexity",           value: <span>O(2<sup>n</sup>)</span>,                    hi: false },
              { label: "Space complexity",          value: "O(n)  —  recursive stack", hi: false },
              { label: "3 disks",                   value: "7 moves",                  hi: false },
              { label: "10 disks",                  value: "1,023 moves",              hi: false },
              { label: "64 disks  @  1 move / sec", value: "≈ 585 billion years",      hi: false },
            ].map(({ label, value, hi }, i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 16px",
                backgroundColor: hi ? "rgba(231,194,104,0.22)" : (i % 2 === 0 ? "rgba(255,255,255,0.35)" : "transparent"),
                borderBottom: i < arr.length - 1 ? "1px solid rgba(154,79,22,0.1)" : "none",
              }}>
                <span style={{ fontSize: 14, color: "#3a1c0e", fontWeight: hi ? 700 : 500 }}>{label}</span>
                <span style={{
                  fontSize: 14, fontWeight: 900, color: "#8e4e14", fontFamily: "monospace",
                  backgroundColor: hi ? "rgba(231,194,104,0.35)" : "transparent",
                  padding: hi ? "2px 8px" : 0, borderRadius: hi ? 6 : 0,
                }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{
            backgroundColor: "rgba(255,180,171,0.18)", border: "1px solid rgba(232,112,96,0.28)",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 14, lineHeight: 1.7, color: "#3a1c0e",
          }}>
            Each extra disk <strong style={{ color: "#8e4e14" }}>nearly doubles</strong> the total moves — a defining trait of exponential time complexity.
          </div>
        </GuideSection>
      </div>

      {/* 7 ── Example: 3 Disks */}
      <GuideSection title="Example: 3 Disks" icon="format_list_numbered">
        <div style={{
          backgroundColor: "rgba(231,194,104,0.2)", border: "1.5px solid rgba(200,150,12,0.3)",
          borderRadius: 8, padding: "10px 16px", marginBottom: 14,
          fontSize: 14, fontWeight: 700, color: "#534439",
        }}>
          Minimum moves = 2<sup>3</sup> − 1 = <span style={{ color: "#8e4e14", fontFamily: "monospace", fontSize: 16 }}>7</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { step: 1, disk: 1, from: "A", to: "C", col: "#ffb4ab" },
            { step: 2, disk: 2, from: "A", to: "B", col: "#f4a261" },
            { step: 3, disk: 1, from: "C", to: "B", col: "#ffb4ab" },
            { step: 4, disk: 3, from: "A", to: "C", col: "#e7c268" },
            { step: 5, disk: 1, from: "B", to: "A", col: "#ffb4ab" },
            { step: 6, disk: 2, from: "B", to: "C", col: "#f4a261" },
            { step: 7, disk: 1, from: "A", to: "C", col: "#ffb4ab" },
          ].map(({ step, disk, from, to, col }) => (
            <div key={step} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 14px",
              backgroundColor: "rgba(255,255,255,0.45)",
              border: "1.5px solid rgba(154,79,22,0.12)",
              borderRadius: 8,
            }}>
              <span style={{
                width: 26, height: 26, borderRadius: "50%",
                backgroundColor: "#8e4e14", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 12, flexShrink: 0,
              }}>{step}</span>
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                backgroundColor: col, border: "1.5px solid rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}/>
              <span style={{ fontSize: 13, color: "#867468", fontWeight: 600, minWidth: 44 }}>Disk {disk}</span>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                <RodBadge>{from}</RodBadge>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#9A4F16" }}>arrow_forward</span>
                <RodBadge>{to}</RodBadge>
              </div>
            </div>
          ))}
        </div>
      </GuideSection>

      {/* 8 ── Implementation Notes */}
      <div ref={demoRef}>
        <GuideSection title="How This Demo Works" icon="terminal">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "functions",  text: <span>The recursive function generates the <b>complete move sequence</b> server-side before any animation begins.</span> },
              { icon: "storage",    text: <span>Each move is stored as <code style={{ backgroundColor: "rgba(58,28,14,0.1)", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 12 }}>{"{ disk, from, to }"}</code> — disk size, source rod, and target rod.</span> },
              { icon: "play_arrow", text: <span>The animation engine <b>replays moves one by one</b>, updating the board state after each step.</span> },
              { icon: "tune",       text: <span>Step, Pause, Resume, and Reset controls all operate on the <b>pre-generated move list</b>.</span> },
              { icon: "bar_chart",  text: <span>Move count, progress bar, and history are derived from the move list <b>in real time</b>.</span> },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "10px 14px",
                backgroundColor: "rgba(255,255,255,0.45)",
                border: "1.5px solid rgba(154,79,22,0.15)",
                borderRadius: 8,
              }}>
                <div style={{
                  flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
                  backgroundColor: "rgba(244,162,97,0.18)", border: "1.5px solid rgba(244,162,97,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined"
                    style={{ fontSize: 16, color: "#f4a261", fontVariationSettings: "'FILL' 1" }}>
                    {icon}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#534439", margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </GuideSection>
      </div>

      {/* 9 ── Takeaway */}
      <div style={{
        display: "flex", gap: 14, alignItems: "flex-start",
        background: "linear-gradient(135deg, rgba(231,194,104,0.35) 0%, rgba(244,162,97,0.22) 100%)",
        border: "2px solid rgba(200,150,12,0.45)",
        borderRadius: 12, padding: "16px 20px",
      }}>
        <span className="material-symbols-outlined"
          style={{ color: "#c8960c", fontSize: 24, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>
          lightbulb
        </span>
        <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#3a1c0e", margin: 0 }}>
          <strong>Key Takeaway:</strong> Tower of Hanoi demonstrates recursion by solving a large puzzle
          through repeated smaller versions of the same problem — each recursive call places exactly
          one disk in its correct final position.
        </p>
      </div>

    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Life Guide
// ════════════════════════════════════════════════════════════

function LifeGuide({ overviewRef, rulesRef, algoRef, complexRef, patternsRef, demoRef }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* 1 ── Hero */}
      <div ref={overviewRef} style={{
        display: "flex", gap: 20, alignItems: "flex-start",
        backgroundColor: "#FFF1D8", border: "2px solid #9A4F16",
        borderRadius: 14, padding: "20px 22px",
        boxShadow: "0 4px 16px rgba(42,20,8,0.08)",
      }}>
        <GliderSVG />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: "#3a1c0e", marginBottom: 8 }}>
            Cellular Automaton Simulation
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#534439", marginBottom: 14 }}>
            Conway's Game of Life is a zero-player cellular automaton: after the initial pattern
            is chosen, each generation is produced by applying the same rules to every cell at once.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { t: "Iteration",          bg: "rgba(244,162,97,0.28)",  bo: "#c87240", c: "#6f3800" },
              { t: "Cellular Automaton", bg: "rgba(200,182,255,0.28)", bo: "#9c7fcc", c: "#3d0066" },
              { t: "B3 / S23",           bg: "rgba(231,194,104,0.32)", bo: "#c8960c", c: "#5a4400" },
              { t: "Emergent Patterns",  bg: "rgba(255,180,171,0.28)", bo: "#e87060", c: "#690005" },
            ].map(({ t, bg, bo, c }) => (
              <span key={t} style={{
                backgroundColor: bg, border: `1.5px solid ${bo}`,
                borderRadius: 999, padding: "3px 12px",
                fontSize: 11.5, fontWeight: 800, color: c, letterSpacing: "0.04em",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 2 ── Goal */}
      <GuideSection title="Goal" icon="flag">
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[
            <span>The board is a <b>grid of cells</b>, each of which is either alive or dead.</span>,
            <span>Every generation, each cell checks up to <b>8 neighbouring cells</b> around it.</span>,
            <span>The <b>next board state</b> is computed from the current board using four fixed rules.</span>,
            <span>All cells update <b>simultaneously</b> — no cell's new state affects another in the same generation.</span>,
            <span>The goal is to observe how <b>simple local rules</b> produce complex global patterns.</span>,
          ].map((el, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                backgroundColor: "#f4a261", color: "#3a1c0e",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900, marginTop: 3,
              }}>{i + 1}</span>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#2e1413", margin: 0 }}>{el}</p>
            </div>
          ))}
        </div>
      </GuideSection>

      {/* 3 ── Neighbourhood */}
      <GuideSection title="Cell Neighbourhood" icon="hub">
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <NeighbourGrid />
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#534439", margin: 0 }}>
              Each cell has up to <strong style={{ color: "#8e4e14" }}>8 neighbours</strong> — the cells directly touching it horizontally, vertically, and diagonally.
            </p>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#534439", margin: 0 }}>
              The <strong style={{ color: "#8e4e14" }}>live neighbour count</strong> determines whether the cell survives, dies, or is born in the next generation.
            </p>
            <div style={{
              backgroundColor: "rgba(244,162,97,0.12)", border: "1.5px solid rgba(154,79,22,0.3)",
              borderRadius: 8, padding: "8px 12px",
              fontSize: 13, color: "#534439", lineHeight: 1.6,
            }}>
              Edge behaviour: Fixed edges treat out-of-bounds cells as dead. <b>Wrap edges</b> connect opposite sides of the grid, making it toroidal.
            </div>
          </div>
        </div>
      </GuideSection>

      {/* 4 ── Rules */}
      <div ref={rulesRef}>
        <GuideSection title="Rules: B3 / S23" icon="rule">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[
              { icon: "group_remove",  name: "Underpopulation",  cond: "Live cell with < 2 live neighbours",       out: "Cell dies",            bg: "rgba(255,180,171,0.22)", bo: "rgba(232,112,96,0.4)",  ic: "#ba1a1a", ac: "#ffb4ab" },
              { icon: "favorite",      name: "Survival",          cond: "Live cell with 2 or 3 live neighbours",    out: "Cell stays alive",     bg: "rgba(231,194,104,0.22)", bo: "rgba(200,150,12,0.4)",  ic: "#5a4400", ac: "#e7c268" },
              { icon: "crisis_alert",  name: "Overpopulation",   cond: "Live cell with > 3 live neighbours",       out: "Cell dies",            bg: "rgba(244,162,97,0.22)", bo: "rgba(180,100,30,0.45)", ic: "#8e4e14", ac: "#f4a261" },
              { icon: "auto_awesome",  name: "Reproduction",     cond: "Dead cell with exactly 3 live neighbours", out: "Cell becomes alive",   bg: "rgba(200,182,255,0.22)", bo: "rgba(156,127,204,0.4)", ic: "#3d0066", ac: "#c8b6ff" },
            ].map(({ icon, name, cond, out, bg, bo, ic, ac }) => (
              <div key={name} style={{
                backgroundColor: bg, border: `2px solid ${bo}`,
                borderRadius: 10, padding: "14px 16px",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="material-symbols-outlined"
                    style={{ color: ic, fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                    {icon}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 12.5, color: "#3a1c0e", textTransform: "uppercase", letterSpacing: "0.06em" }}>{name}</span>
                </div>
                <p style={{ fontSize: 13, color: "#534439", lineHeight: 1.55, margin: 0 }}>{cond}</p>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "5px 10px",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: ic }}>arrow_forward</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: ic }}>{out}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            backgroundColor: "rgba(231,194,104,0.2)", border: "1.5px solid rgba(200,150,12,0.35)",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 13.5, lineHeight: 1.65, color: "#534439",
          }}>
            <strong style={{ color: "#8e4e14" }}>B3 / S23</strong> means a dead cell is <b>Born</b> with exactly 3 neighbours, and a live cell <b>Survives</b> with 2 or 3 neighbours.
          </div>
        </GuideSection>
      </div>

      {/* 5 ── Pseudocode */}
      <div ref={algoRef}>
        <GuideSection title="Pseudocode" icon="code">
          <pre style={{
            backgroundColor: "#1e0d04", color: "#f4c87a",
            borderRadius: 10, padding: "16px 18px",
            fontSize: 13.5, lineHeight: 1.9,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            overflowX: "auto", margin: "0 0 14px",
            border: "2px solid #4a1e08",
          }}>{`for each generation:
    next = empty grid

    for each cell (row, col):
        n = count_live_neighbours(row, col)

        if cell is alive:
            if n == 2 or n == 3:  next[row][col] = alive
            else:                 next[row][col] = dead

        if cell is dead:
            if n == 3:            next[row][col] = alive
            else:                 next[row][col] = dead

    grid = next`}</pre>
          <div style={{
            backgroundColor: "rgba(255,255,255,0.5)", border: "1px solid rgba(154,79,22,0.2)",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 14, lineHeight: 1.7, color: "#3a1c0e",
          }}>
            The next generation is written into a <strong style={{ color: "#8e4e14" }}>separate grid</strong> so all cells update simultaneously. This prevents earlier updates from affecting later cells in the same generation.
          </div>
        </GuideSection>
      </div>

      {/* 6 ── Iteration Flow */}
      <GuideSection title="Iteration Flow" icon="loop">
        <p style={{ fontSize: 13, color: "#867468", marginBottom: 14, lineHeight: 1.6 }}>
          Each generation follows the same six steps, repeated while the simulation is running:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { num: 1, accent: "#8cf5e4", label: "Read",     text: "Read the current grid — every cell's alive/dead state." },
            { num: 2, accent: "#e7c268", label: "Count",    text: "For every cell, count how many of its up to 8 neighbours are currently alive." },
            { num: 3, accent: "#f4a261", label: "Apply",    text: "Apply the B3 / S23 rules to each cell based on its neighbour count." },
            { num: 4, accent: "#c8b6ff", label: "Write",    text: "Store each cell's new state in a fresh empty grid — never modify the current one." },
            { num: 5, accent: "#8cf5e4", label: "Replace",  text: "Swap the current grid with the new grid to complete the generation." },
            { num: 6, accent: "#e7c268", label: "Repeat",   text: "Continue from step 1 while the simulation is running." },
          ].map(({ num, accent, label, text }) => (
            <div key={num} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              backgroundColor: "rgba(255,255,255,0.55)",
              border: "1.5px solid rgba(154,79,22,0.18)",
              borderLeft: `4px solid ${accent}`,
              borderRadius: 10, padding: "12px 16px",
            }}>
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                backgroundColor: accent, color: "#3a1c0e",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 13,
              }}>{num}</div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#3a1c0e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.65, color: "#534439" }}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      </GuideSection>

      {/* 7 ── Complexity */}
      <div ref={complexRef}>
        <GuideSection title="Complexity" icon="speed">
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1.5px solid rgba(154,79,22,0.2)", marginBottom: 14 }}>
            {[
              { label: "Cells per generation",          value: "R × C",         hi: true  },
              { label: "Neighbour checks per cell",      value: "up to 8",       hi: false },
              { label: "Time complexity / generation",   value: "O(R × C)",      hi: false },
              { label: "Space complexity",               value: "O(R × C)",      hi: false },
              { label: "Why two grids?",                 value: "simultaneous update", hi: false },
            ].map(({ label, value, hi }, i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 16px",
                backgroundColor: hi ? "rgba(231,194,104,0.22)" : (i % 2 === 0 ? "rgba(255,255,255,0.35)" : "transparent"),
                borderBottom: i < arr.length - 1 ? "1px solid rgba(154,79,22,0.1)" : "none",
              }}>
                <span style={{ fontSize: 14, color: "#3a1c0e", fontWeight: hi ? 700 : 500 }}>{label}</span>
                <span style={{
                  fontSize: 14, fontWeight: 900, color: "#8e4e14", fontFamily: "monospace",
                  backgroundColor: hi ? "rgba(231,194,104,0.35)" : "transparent",
                  padding: hi ? "2px 8px" : 0, borderRadius: hi ? 6 : 0,
                }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{
            backgroundColor: "rgba(255,180,171,0.18)", border: "1px solid rgba(232,112,96,0.28)",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 14, lineHeight: 1.7, color: "#3a1c0e",
          }}>
            Even though each cell checks only a small neighbourhood, <strong style={{ color: "#8e4e14" }}>every cell must be processed once per generation</strong> — so the total work scales with the grid size.
          </div>
        </GuideSection>
      </div>

      {/* 8 ── Notable Patterns */}
      <div ref={patternsRef}>
        <GuideSection title="Notable Patterns" icon="auto_awesome">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              {
                type: "Still Life", example: "Block",
                desc: "A stable pattern that does not change from one generation to the next.",
                cells: [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],
                accent: "#e7c268", border: "#c8960c", tc: "#5a4400",
              },
              {
                type: "Oscillator", example: "Blinker",
                desc: "Returns to its original state after a fixed number of generations.",
                cells: [[0,0,0,0,0],[0,1,1,1,0],[0,0,0,0,0]],
                accent: "#f4a261", border: "#c87240", tc: "#6f3800",
              },
              {
                type: "Spaceship", example: "Glider",
                desc: "Moves across the grid over time, changing position with each cycle.",
                cells: [[0,0,1,0,0],[0,0,0,1,0],[0,1,1,1,0],[0,0,0,0,0],[0,0,0,0,0]],
                accent: "#f4a261", border: "#c87240", tc: "#6f3800",
              },
              {
                type: "Generator", example: "Gosper Glider Gun",
                desc: "A stationary pattern that repeatedly emits spaceships (gliders) over time.",
                cells: null,
                accent: "#c8b6ff", border: "#9c7fcc", tc: "#3d0066",
              },
            ].map(({ type, example, desc, cells, accent, border, tc }) => (
              <div key={type} style={{
                backgroundColor: "rgba(255,255,255,0.5)",
                border: `2px solid rgba(154,79,22,0.18)`,
                borderTop: `3px solid ${accent}`,
                borderRadius: 10, padding: "14px 16px",
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: tc, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{type}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#3a1c0e" }}>{example}</div>
                  </div>
                  {cells ? (
                    <PatternGrid cells={cells} accent={accent} />
                  ) : (
                    <div style={{
                      width: 54, height: 54,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      backgroundColor: "rgba(200,182,255,0.15)", border: "1.5px solid rgba(156,127,204,0.3)",
                      borderRadius: 8,
                    }}>
                      <span className="material-symbols-outlined" style={{ color: "#9c7fcc", fontSize: 28, fontVariationSettings: "'FILL' 1" }}>
                        blur_on
                      </span>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#534439", margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </GuideSection>
      </div>

      {/* 9 ── Implementation Notes */}
      <div ref={demoRef}>
        <GuideSection title="How This Demo Works" icon="terminal">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "grid_on",    text: <span>The grid stores a <b>2D array of alive/dead states</b> — one boolean per cell.</span> },
              { icon: "touch_app",  text: <span>Clicking cells <b>toggles their alive/dead state</b> directly on the grid before or during simulation.</span> },
              { icon: "category",   text: <span>Preset patterns (Glider, Pulsar, etc.) place <b>predefined alive cells</b> onto the grid instantly.</span> },
              { icon: "timer",      text: <span>A simulation timer <b>repeatedly calls the generation update function</b> at the chosen speed.</span> },
              { icon: "tune",       text: <span>Play, Pause, Step, Reset, and Speed controls operate on the <b>iteration loop</b>.</span> },
              { icon: "bar_chart",  text: <span>Generation count and other metrics are updated <b>after each generation step</b>.</span> },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                padding: "10px 14px",
                backgroundColor: "rgba(255,255,255,0.45)",
                border: "1.5px solid rgba(154,79,22,0.15)",
                borderRadius: 8,
              }}>
                <div style={{
                  flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
                  backgroundColor: "rgba(244,162,97,0.18)", border: "1.5px solid rgba(244,162,97,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined"
                    style={{ fontSize: 16, color: "#f4a261", fontVariationSettings: "'FILL' 1" }}>
                    {icon}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#534439", margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </GuideSection>
      </div>

      {/* 10 ── Takeaway */}
      <div style={{
        display: "flex", gap: 14, alignItems: "flex-start",
        background: "linear-gradient(135deg, rgba(231,194,104,0.35) 0%, rgba(244,162,97,0.22) 100%)",
        border: "2px solid rgba(200,150,12,0.45)",
        borderRadius: 12, padding: "16px 20px",
      }}>
        <span className="material-symbols-outlined"
          style={{ color: "#c8960c", fontSize: 24, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>
          lightbulb
        </span>
        <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "#3a1c0e", margin: 0 }}>
          <strong>Key Takeaway:</strong> Conway's Game of Life shows how simple local rules, repeated
          through iteration, can create complex and surprising global behaviour — from stable blocks
          to infinite glider streams.
        </p>
      </div>

    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Shared sub-components
// ════════════════════════════════════════════════════════════

function GuideSection({ title, icon, children }) {
  return (
    <div style={{
      border: "2px solid #9A4F16", borderRadius: 12,
      overflow: "hidden", boxShadow: "0 2px 8px rgba(42,20,8,0.07)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        backgroundColor: "#3a1c0e", padding: "9px 16px",
      }}>
        <span className="material-symbols-outlined"
          style={{ color: "#f4c87a", fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {title}
        </span>
      </div>
      <div style={{ backgroundColor: "#FFF1D8", padding: "16px 18px" }}>
        {children}
      </div>
    </div>
  );
}

function MiniTowerSVG() {
  return (
    <svg width="80" height="64" viewBox="0 0 80 64" style={{ flexShrink: 0 }}>
      <rect x="1"  y="57" width="78" height="6"  rx="3" fill="#8B4010"/>
      <rect x="10" y="8"  width="4"  height="49" rx="2" fill="#6a3008"/>
      <rect x="38" y="8"  width="4"  height="49" rx="2" fill="#6a3008"/>
      <rect x="66" y="8"  width="4"  height="49" rx="2" fill="#6a3008"/>
      <rect x="0"  y="49" width="24" height="8"  rx="4" fill="#e7c268" stroke="#c8960c" strokeWidth="1.5"/>
      <rect x="4"  y="41" width="16" height="8"  rx="4" fill="#f4a261" stroke="#c87240" strokeWidth="1.5"/>
      <rect x="7"  y="33" width="10" height="8"  rx="4" fill="#ffb4ab" stroke="#e87060" strokeWidth="1.5"/>
      <text x="12" y="7"  textAnchor="middle" fontSize="9" fontWeight="bold" fill="#8B4010" fontFamily="system-ui,sans-serif">A</text>
      <text x="40" y="7"  textAnchor="middle" fontSize="9" fontWeight="bold" fill="#8B4010" fontFamily="system-ui,sans-serif">B</text>
      <text x="68" y="7"  textAnchor="middle" fontSize="9" fontWeight="bold" fill="#8B4010" fontFamily="system-ui,sans-serif">C</text>
    </svg>
  );
}

function GliderSVG() {
  const pattern = [
    [0,0,0,0,0,0],
    [0,0,1,0,0,0],
    [0,0,0,1,0,0],
    [0,1,1,1,0,0],
    [0,0,0,0,0,0],
    [0,0,0,0,0,0],
  ];
  const S = 10, G = 1;
  const dim = 6 * S + 5 * G;
  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ flexShrink: 0 }}>
      {pattern.map((row, r) =>
        row.map((alive, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * (S + G)} y={r * (S + G)}
            width={S} height={S} rx={2}
            fill={alive ? "#f4a261" : "rgba(244,162,97,0.1)"}
            stroke={alive ? "#c87240" : "rgba(154,79,22,0.15)"}
            strokeWidth={1}
          />
        ))
      )}
    </svg>
  );
}

function NeighbourGrid() {
  return (
    <div style={{ display: "inline-grid", gridTemplateColumns: "repeat(3, 42px)", gap: 3, flexShrink: 0 }}>
      {Array.from({ length: 9 }, (_, i) => {
        const isCenter = i === 4;
        return (
          <div key={i} style={{
            width: 42, height: 42, borderRadius: 8,
            backgroundColor: isCenter ? "rgba(244,162,97,0.3)" : "rgba(244,162,97,0.12)",
            border: `2px solid ${isCenter ? "#c87240" : "#c87240"}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 1,
          }}>
            {isCenter ? (
              <span style={{ fontSize: 9, fontWeight: 900, color: "#8e4e14", textAlign: "center", lineHeight: 1.2 }}>Cell</span>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#c87240", fontVariationSettings: "'FILL' 1" }}>circle</span>
                <span style={{ fontSize: 8, fontWeight: 800, color: "#8e4e14" }}>N</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PatternGrid({ cells, accent }) {
  const S = 9, G = 1;
  const rows = cells.length, cols = cells[0].length;
  const W = cols * S + (cols - 1) * G;
  const H = rows * S + (rows - 1) * G;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0 }}>
      {cells.map((row, r) =>
        row.map((alive, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * (S + G)} y={r * (S + G)}
            width={S} height={S} rx={1.5}
            fill={alive ? accent : "rgba(244,162,97,0.06)"}
            stroke={alive ? "rgba(0,0,0,0.2)" : "rgba(154,79,22,0.1)"}
            strokeWidth={0.5}
          />
        ))
      )}
    </svg>
  );
}

function RodBadge({ children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 26, height: 26, borderRadius: "50%",
      backgroundColor: "#E8D0B0",
      border: "2px solid #9A4F16",
      color: "#8e4e14",
      fontWeight: 900, fontSize: 12, fontFamily: "monospace",
    }}>{children}</span>
  );
}
