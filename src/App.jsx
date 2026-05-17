/**
 * App.jsx — root component, handles routing between home/hanoi/life.
 * Algorithm logic lives in the Python backend; React handles UI only.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import ControlPanel from "./components/hanoi/Controls";
import HanoiBoard from "./components/hanoi/Board";
import MoveHistory from "./components/hanoi/History";
import StatsPanel from "./components/hanoi/Stats";
import LifeDemo from "./components/life/Demo";
import LandingPage from "./components/shared/LandingPage";
import LoadingScreen from "./components/shared/LoadingScreen";
import HelpModal from "./components/shared/HelpModal";
import { fetchAllMoves, fetchMetadata, fetchMove } from "./utils/api";
import { playDiskThud } from "./utils/audio";
import bg1Image from "./assets/bg-hanoi.png";
import bg3Image from "./assets/bg-life.png";
import "./App.css";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function buildInitialTowers(n) {
  // All disks start on Tower A, largest at index 0 (bottom)
  return {
    A: Array.from({ length: n }, (_, i) => n - i), // [n, n-1, …, 1]
    B: [],
    C: [],
  };
}

function applyMove(towers, move) {
  const next = {
    A: [...towers.A],
    B: [...towers.B],
    C: [...towers.C],
  };
  const disk = next[move.from].pop();
  if (disk !== move.disk) {
    throw new Error(
      `State mismatch: expected disk ${move.disk} but got disk ${disk} from tower ${move.from}`
    );
  }
  if (next[move.to].length > 0 && next[move.to].at(-1) < disk) {
    throw new Error(
      `Invalid move: disk ${disk} cannot go on top of disk ${next[move.to].at(-1)}`
    );
  }
  next[move.to].push(disk);
  return next;
}

const PRELOAD_MOVE_LIMIT = 10000;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function App() {
  const [activeGame, setActiveGame] = useState("home");
  const [loadingGame, setLoadingGame] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  function selectGame(game) { setLoadingGame(game); }
  function onLoadingDone() { setActiveGame(loadingGame); setLoadingGame(null); }

  const [diskCount, setDiskCount] = useState(3);
  const [towers, setTowers] = useState(buildInitialTowers(3));
  const [status, setStatus] = useState("ready");
  const [currentMove, setCurrentMove] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [latestMove, setLatestMove] = useState("");
  const [moveHistory, setMoveHistory] = useState([]);
  const [speed, setSpeed] = useState(400);
  const [warning, setWarning] = useState(null);
  const [error, setError] = useState(null);

  // Reset board and pre-load total moves whenever diskCount changes
  useEffect(() => {
    if (isRunningRef.current) return;
    if (!diskCount || diskCount <= 0) return;
    const initTowers = buildInitialTowers(diskCount);
    towersRef.current = initTowers;
    setTowers(initTowers);
    setCurrentMove(0);
    currentMoveRef.current = 0;
    setTotalMoves(0);
    setLatestMove("");
    setMoveHistory([]);
    setStatus("ready");
    setWarning(null);
    setError(null);
    moveCacheRef.current = { diskCount: null, moves: [] };

    // Pre-fetch total moves so the count shows immediately
    fetchMetadata(diskCount)
      .then((meta) => {
        setTotalMoves(meta.totalMoves);
        if (meta.warning) setWarning(meta.warning);
      })
      .catch(() => {}); // silently ignore if backend not reachable
  }, [diskCount]);

  const isPausedRef = useRef(false);
  const isRunningRef = useRef(false);
  const currentMoveRef = useRef(0);
  const towersRef = useRef(buildInitialTowers(3));
  const speedRef = useRef(speed);
  const moveCacheRef = useRef({ diskCount: null, moves: [] });
  useEffect(() => { speedRef.current = speed; }, [speed]);

  async function preloadMoves(n, totalMoveCount) {
    if (totalMoveCount > PRELOAD_MOVE_LIMIT) {
      moveCacheRef.current = { diskCount: null, moves: [] };
      return false;
    }

    const data = await fetchAllMoves(n);
    moveCacheRef.current = {
      diskCount: n,
      moves: Array.isArray(data.moves) ? data.moves : [],
    };
    return true;
  }

  async function getMove(n, moveNum) {
    const cache = moveCacheRef.current;
    const cachedMove =
      cache.diskCount === n && cache.moves.length >= moveNum
        ? cache.moves[moveNum - 1]
        : null;

    if (cachedMove) return cachedMove;

    const data = await fetchMove(n, moveNum);
    return data.move;
  }

  // ──────────────────────────────────────────────
  // ANIMATION LOOP
  // ──────────────────────────────────────────────
  const runAnimation = useCallback(
    async (n, startMove, initialTowers, tm) => {
      isRunningRef.current = true;
      let currentTowers = initialTowers;
      let moveNum = startMove;

      while (moveNum <= tm && !isPausedRef.current) {
        try {
          const move = await getMove(n, moveNum);
          currentTowers = applyMove(currentTowers, move);
          towersRef.current = currentTowers;
          const moveText = `Move disk ${move.disk} from ${move.from} to ${move.to}`;
          playDiskThud(move.disk, n);
          setTowers({ ...currentTowers });
          setCurrentMove(moveNum);
          currentMoveRef.current = moveNum;
          setLatestMove(moveText);
          setMoveHistory((prev) => [...prev, moveText]);
        } catch (err) {
          setError(`Error at move ${moveNum}: ${err.message}`);
          setStatus("error");
          isRunningRef.current = false;
          return;
        }
        moveNum++;
        if (moveNum <= tm && !isPausedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, speedRef.current));
        }
      }

      isRunningRef.current = false;
      if (!isPausedRef.current) {
        setStatus("completed");
        setLatestMove("All disks moved to Tower C!");
      }
    },
    []
  );

  // ──────────────────────────────────────────────
  // Control Handlers
  // ──────────────────────────────────────────────

  async function handleStart() {
    if (!diskCount || diskCount <= 0) {
      setError("Please enter a valid number of disks.");
      return;
    }
    setError(null);
    try {
      const meta = await fetchMetadata(diskCount);
      setTotalMoves(meta.totalMoves);
      let preloadWarning = null;
      try {
        const didPreload = await preloadMoves(diskCount, meta.totalMoves);
        if (!didPreload) {
          preloadWarning =
            "Large disk count — using on-demand moves, so deployment latency may limit top speed.";
        }
      } catch {
        moveCacheRef.current = { diskCount: null, moves: [] };
        preloadWarning =
          "Could not preload moves — using on-demand moves, so deployment latency may limit top speed.";
      }
      setWarning(meta.warning || preloadWarning || (diskCount > 12 ? "Large disk count — animation may be slow." : null));
      const initTowers = buildInitialTowers(diskCount);
      towersRef.current = initTowers;
      setTowers(initTowers);
      setCurrentMove(0);
      currentMoveRef.current = 0;
      setMoveHistory([]);
      setLatestMove("");
      setStatus("running");
      isPausedRef.current = false;
      runAnimation(diskCount, 1, initTowers, meta.totalMoves);
    } catch (err) {
      setError(`Failed to start: ${err.message}`);
      setStatus("error");
    }
  }

  function handlePause() {
    isPausedRef.current = true;
    isRunningRef.current = false;
    setStatus("paused");
  }

  function handleResume() {
    if (status !== "paused") return;
    isPausedRef.current = false;
    setStatus("running");
    const nextMove = currentMoveRef.current + 1;
    runAnimation(diskCount, nextMove, towersRef.current, totalMoves);
  }

  function handleReset() {
    isPausedRef.current = true;
    isRunningRef.current = false;
    const initTowers = buildInitialTowers(diskCount || 3);
    towersRef.current = initTowers;
    currentMoveRef.current = 0;
    setTowers(initTowers);
    setCurrentMove(0);
    setTotalMoves(0);
    setLatestMove("");
    setMoveHistory([]);
    setStatus("ready");
    setError(null);
    setWarning(null);
    moveCacheRef.current = { diskCount: null, moves: [] };
  }

  async function handleStepForward() {
    if (status === "running") return;

    // Use a local variable so the check below uses the fresh value, not stale state
    let knownTotalMoves = totalMoves;

    if (status === "ready" || totalMoves === 0) {
      try {
        const meta = await fetchMetadata(diskCount);
        knownTotalMoves = meta.totalMoves;
        setTotalMoves(meta.totalMoves);
        setWarning(meta.warning || null);
        try {
          await preloadMoves(diskCount, meta.totalMoves);
        } catch {
          moveCacheRef.current = { diskCount: null, moves: [] };
        }
        const initTowers = buildInitialTowers(diskCount);
        towersRef.current = initTowers;
        setTowers(initTowers);
        setCurrentMove(0);
        currentMoveRef.current = 0;
        setMoveHistory([]);
        setLatestMove("");
        setStatus("paused");
      } catch (err) {
        setError(`Failed to initialise: ${err.message}`);
        return;
      }
    }
    const nextMove = currentMoveRef.current + 1;
    if (nextMove > knownTotalMoves) return;
    try {
      const move = await getMove(diskCount, nextMove);
      const updatedTowers = applyMove(towersRef.current, move);
      towersRef.current = updatedTowers;
      currentMoveRef.current = nextMove;
      const moveText = `Move disk ${move.disk} from ${move.from} to ${move.to}`;
      playDiskThud(move.disk, diskCount);
      setTowers({ ...updatedTowers });
      setCurrentMove(nextMove);
      setLatestMove(moveText);
      setMoveHistory((prev) => [...prev, moveText]);
      if (nextMove === totalMoves) {
        setStatus("completed");
        setLatestMove("All disks moved to Tower C!");
      } else {
        setStatus("paused");
      }
    } catch (err) {
      setError(`Step error: ${err.message}`);
    }
  }

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  if (loadingGame) {
    return <LoadingScreen game={loadingGame} onDone={onLoadingDone} />;
  }

  if (activeGame === "home") {
    return <div style={{ animation: "lw-game-enter 0.3s ease-out both" }}><LandingPage onSelectGame={selectGame} /></div>;
  }

  return (
    <div className="text-[#2e1413] h-screen overflow-hidden flex flex-col" style={{ position:"relative" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:`url(${activeGame === "life" ? bg3Image : bg1Image})`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.5, zIndex:0, pointerEvents:"none" }}/>

      {/* Above the background image */}
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", flex:1, height:"100%" }}>

      {/* ── Top Header ── */}
      <header className="fixed top-0 w-full h-16 bg-wood-dark border-b-4 border-[#4a2511] shadow-lg flex justify-between items-center px-6 z-50">
        <button
          onClick={() => { setActiveGame("home"); setLoadingGame(null); }}
          title="Home"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined text-[#f4a261] cursor-pointer hover:bg-black/20 p-2 rounded-full transition-colors" style={{fontSize:"30px", fontVariationSettings:"'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>home</span>
        </button>

        <span className="text-lg font-extrabold tracking-wide text-[#f4a261] uppercase">
          {activeGame === "hanoi" ? "Tower of Hanoi" : "Conway's Game of Life"}
        </span>

        <div className="flex items-center gap-2 text-[#f4a261]">
          <span title="Guide" className="material-symbols-outlined cursor-pointer hover:bg-black/20 p-2 rounded-full transition-colors" style={{fontSize:"30px", fontVariationSettings:"'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"}} onClick={() => setShowHelp(true)}>
            info
          </span>
        </div>
      </header>

      {showHelp && <HelpModal game={activeGame} onClose={() => setShowHelp(false)} />}

      {/* ── Body (sidebar + main) ── */}
      <div className="flex flex-1 pt-16">

        {/* ── Main Content ── */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto main-scroll" style={{ height: "calc(100vh - 4rem)" }}>

          {/* ── Tower of Hanoi ── */}
          {activeGame === "hanoi" && (
            <>
              {/* Error banner */}
              {error && (
                <div className="flex justify-between items-center bg-[#ffdad6] border-2 border-[#ba1a1a] text-[#93000a] rounded-xl px-4 py-3 mb-4 font-semibold">
                  <span>⚠ {error}</span>
                  <button onClick={() => setError(null)} className="ml-4 font-bold hover:opacity-70">✕</button>
                </div>
              )}

              <div className="max-w-[1600px] mx-auto" style={{ animation: "lw-game-enter 0.3s ease-out both" }}>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4" style={{ gridTemplateRows: 'auto 340px' }}>

                  {/* Controls */}
                  <div className="xl:col-span-4 xl:row-start-1">
                    <ControlPanel
                      diskCount={diskCount}
                      setDiskCount={setDiskCount}
                      status={status}
                      speed={speed}
                      setSpeed={setSpeed}
                      onStart={handleStart}
                      onPause={handlePause}
                      onResume={handleResume}
                      onReset={handleReset}
                      onStepForward={handleStepForward}
                      warning={warning}
                    />
                  </div>

                  {/* Board */}
                  <div className="xl:col-span-8 xl:row-start-1 flex flex-col" style={{ alignSelf: 'stretch' }}>
                    <HanoiBoard
                      towers={towers}
                      diskCount={diskCount}
                      latestMove={latestMove}
                    />
                  </div>

                  {/* Metrics */}
                  <div className="xl:col-span-4 xl:row-start-2 flex flex-col">
                    <StatsPanel
                      status={status}
                      diskCount={diskCount}
                      totalMoves={totalMoves}
                      currentMove={currentMove}
                      latestMove={latestMove}
                    />
                  </div>

                  {/* Move log */}
                  <div className="xl:col-span-8 xl:row-start-2 flex flex-col">
                    <MoveHistory moveHistory={moveHistory} />
                  </div>

                </div>
              </div>
            </>
          )}

          {/* ── Conway's Game of Life ── */}
          {activeGame === "life" && <div style={{ animation: "lw-game-enter 0.3s ease-out both" }}><LifeDemo /></div>}

        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full h-16 flex justify-around items-center bg-wood-dark border-t-4 border-[#4a2511] z-50 text-[10px] font-bold uppercase">
        <button
          className={`flex flex-col items-center px-3 active:translate-y-0.5 transition-transform ${activeGame === "hanoi" ? "text-[#f4a261] bg-black/20 rounded-lg py-1" : "text-[#d8c2b5]"}`}
          onClick={() => selectGame("hanoi")}
        >
          <span className="material-symbols-outlined mb-0.5">stacked_line_chart</span>
          Hanoi
        </button>
        <button
          className={`flex flex-col items-center px-3 active:translate-y-0.5 transition-transform ${activeGame === "life" ? "text-[#f4a261] bg-black/20 rounded-lg py-1" : "text-[#d8c2b5]"}`}
          onClick={() => selectGame("life")}
        >
          <span className="material-symbols-outlined mb-0.5">grid_on</span>
          Life
        </button>
        {activeGame === "hanoi" && (
          <>
            <button
              className="flex flex-col items-center text-[#d8c2b5] px-3 active:translate-y-0.5 transition-transform"
              onClick={handleStart}
              disabled={status === "running"}
            >
              <span className="material-symbols-outlined mb-0.5">play_arrow</span>
              Solve
            </button>
            <button
              className="flex flex-col items-center text-[#d8c2b5] px-3 active:translate-y-0.5 transition-transform"
              onClick={handlePause}
              disabled={status !== "running"}
            >
              <span className="material-symbols-outlined mb-0.5">pause</span>
              Pause
            </button>
            <button
              className="flex flex-col items-center text-[#d8c2b5] px-3 active:translate-y-0.5 transition-transform"
              onClick={handleReset}
            >
              <span className="material-symbols-outlined mb-0.5">restart_alt</span>
              Reset
            </button>
          </>
        )}
      </nav>
      </div> {/* end content z-index wrapper */}
    </div>
  );
}
