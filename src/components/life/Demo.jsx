/**
 * LifeDemo.jsx — Game of Life simulator.
 * Game logic runs in Python; React handles UI and API calls.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import LifeBoard    from "./Board";
import LifeControls from "./Controls";
import LifeStats    from "./Stats";
import LifeLog      from "./Log";
import { fetchLifePreset, fetchLifeStep } from "../../utils/api";

const MAX_LOG = 100;

export default function LifeDemo() {
  // ── Grid state ────────────────────────────────────────────────
  const [grid,       setGrid]       = useState([]);
  const [generation, setGeneration] = useState(0);
  const [status,     setStatus]     = useState("ready");

  // ── Layout / config state ─────────────────────────────────────
  const [rows,    setRows]    = useState(25);
  const [cols,    setCols]    = useState(55);
  const [speed,   setSpeed]   = useState(150);   // ms per step
  const [pattern, setPattern] = useState("glider");
  const [wrap,    setWrap]    = useState(true);

  // ── Live stats & history ──────────────────────────────────────
  const [stats, setStats] = useState({ alive: 0, births: 0, deaths: 0, survivors: 0 });
  const [log,   setLog]   = useState([]);
  const [error, setError] = useState(null);

  // ── Refs keep the animation loop from reading stale state ────────
  const isRunningRef  = useRef(false);
  const isPausedRef   = useRef(false);
  const gridRef       = useRef([]);
  const generationRef = useRef(0);
  const speedRef      = useRef(150);
  const wrapRef       = useRef(true);
  const customSnapshotRef = useRef(null);

  // Keep refs in sync with state that changes between renders
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { wrapRef.current  = wrap;  }, [wrap]);

  // ── Preset loader ─────────────────────────────────────────────
  async function loadPreset(patternName, r, c) {
    try {
      const data = await fetchLifePreset(patternName, r, c);
      gridRef.current       = data.grid;
      generationRef.current = 0;
      setGrid(data.grid);
      setGeneration(0);
      setStats({ alive: data.summary.aliveCells, births: 0, deaths: 0, survivors: 0 });
      setLog([]);
      setStatus("ready");
      setError(null);
    } catch (err) {
      setError(`Failed to load preset: ${err.message}`);
    }
  }

  useEffect(() => {
    loadPreset("glider", 25, 55);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Append a generation entry to the log ─────────────────────
  function addLogEntry(gen, data) {
    const entry =
      `Generation ${gen}: Alive ${data.aliveCells} | ` +
      `Births ${data.births} | Deaths ${data.deaths} | Survivors ${data.survivors}`;
    setLog((prev) => {
      const next = [...prev, entry];
      return next.length > MAX_LOG ? next.slice(-MAX_LOG) : next;
    });
  }

  // ==============================
  // SIMULATION LOOP
  // Repeatedly fetches the next generation from Python
  // and updates the grid until paused or stopped.
  // ==============================
  const runSimulation = useCallback(async () => {
    isRunningRef.current = true;

    while (isRunningRef.current && !isPausedRef.current) {
      try {
        const data = await fetchLifeStep(gridRef.current, wrapRef.current);

        gridRef.current        = data.grid;
        generationRef.current += 1;
        const gen = generationRef.current;

        setGrid(data.grid.map((row) => [...row]));
        setGeneration(gen);
        setStats({
          alive:     data.aliveCells,
          births:    data.births,
          deaths:    data.deaths,
          survivors: data.survivors,
        });
        addLogEntry(gen, data);
      } catch (err) {
        setError(`Simulation error: ${err.message}`);
        isRunningRef.current = false;
        setStatus("paused");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, speedRef.current));
    }

    isRunningRef.current = false;
  }, []); // uses refs only — no reactive deps needed

  // ── Control handlers ──────────────────────────────────────────

  function handlePlay() {
    if (isRunningRef.current) return;
    if (!gridRef.current || gridRef.current.length === 0) return;
    isPausedRef.current = false;
    setStatus("running");
    setError(null);
    runSimulation();
  }

  function handlePause() {
    isPausedRef.current  = true;
    isRunningRef.current = false;
    setStatus("paused");
  }

  function handleResume() {
    if (status !== "paused") return;
    isPausedRef.current = false;
    setStatus("running");
    runSimulation();
  }

  async function handleStep() {
    if (isRunningRef.current) return;
    if (!gridRef.current || gridRef.current.length === 0) return;
    setError(null);
    try {
      const data = await fetchLifeStep(gridRef.current, wrapRef.current);
      gridRef.current        = data.grid;
      generationRef.current += 1;
      const gen = generationRef.current;
      setGrid(data.grid.map((row) => [...row]));
      setGeneration(gen);
      setStats({
        alive:     data.aliveCells,
        births:    data.births,
        deaths:    data.deaths,
        survivors: data.survivors,
      });
      addLogEntry(gen, data);
      setStatus("paused");
    } catch (err) {
      setError(`Step error: ${err.message}`);
    }
  }

  function handleReset() {
    isPausedRef.current  = true;
    isRunningRef.current = false;
    if (pattern === "custom" && customSnapshotRef.current) {
      const snap = customSnapshotRef.current.map((row) => [...row]);
      gridRef.current       = snap;
      generationRef.current = 0;
      const alive = snap.reduce((s, row) => s + row.reduce((a, v) => a + v, 0), 0);
      setGrid(snap);
      setGeneration(0);
      setStats({ alive, births: 0, deaths: 0, survivors: 0 });
      setLog([]);
      setStatus("ready");
      setError(null);
    } else {
      loadPreset(pattern, rows, cols);
    }
  }

  function handleClear() {
    isPausedRef.current  = true;
    isRunningRef.current = false;
    const empty = Array.from({ length: rows }, () => Array(cols).fill(0));
    gridRef.current       = empty;
    generationRef.current = 0;
    setGrid(empty);
    setGeneration(0);
    setPattern("custom");
    setStats({ alive: 0, births: 0, deaths: 0, survivors: 0 });
    setLog([]);
    setStatus("ready");
    setError(null);
  }

  async function handleRandomize() {
    isPausedRef.current  = true;
    isRunningRef.current = false;
    setStatus("ready");
    try {
      const data = await fetchLifePreset("random", rows, cols);
      gridRef.current       = data.grid;
      generationRef.current = 0;
      setGrid(data.grid);
      setGeneration(0);
      setPattern("random");
      setStats({ alive: data.summary.aliveCells, births: 0, deaths: 0, survivors: 0 });
      setLog([]);
      setError(null);
    } catch (err) {
      setError(`Randomize failed: ${err.message}`);
    }
  }

  async function handlePatternChange(newPattern) {
    isPausedRef.current  = true;
    isRunningRef.current = false;
    setPattern(newPattern);
    if (newPattern === "custom") {
      const empty = Array.from({ length: rows }, () => Array(cols).fill(0));
      gridRef.current       = empty;
      generationRef.current = 0;
      setGrid(empty);
      setGeneration(0);
      setStats({ alive: 0, births: 0, deaths: 0, survivors: 0 });
      setLog([]);
      setStatus("ready");
      setError(null);
    } else {
      await loadPreset(newPattern, rows, cols);
    }
  }

  async function handleApplySize(newRows, newCols) {
    isPausedRef.current  = true;
    isRunningRef.current = false;
    setRows(newRows);
    setCols(newCols);
    await loadPreset(pattern, newRows, newCols);
  }

  function handleCellClick(r, c) {
    if (isRunningRef.current) return;
    const newGrid = gridRef.current.map((row) => [...row]);
    newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
    gridRef.current = newGrid;
    const alive = newGrid.reduce((sum, row) => sum + row.reduce((s, v) => s + v, 0), 0);
    setGrid(newGrid.map((row) => [...row]));
    setStats((s) => ({ ...s, alive }));
    if (pattern !== "random") {
      setPattern("custom");
      customSnapshotRef.current = newGrid.map((row) => [...row]);
    }
  }

  function handleWrapChange(newWrap) {
    setWrap(newWrap);
    wrapRef.current = newWrap;
  }

  function handleSpeedChange(newSpeed) {
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="max-w-[1600px] mx-auto">

      {/* Error banner */}
      {error && (
        <div className="flex justify-between items-center bg-[#ffdad6] border-2 border-[#ba1a1a] text-[#93000a] rounded-xl px-4 py-3 mb-4 font-semibold">
          <span>⚠ {error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 font-bold hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      <div
        className="grid grid-cols-1 xl:grid-cols-12 gap-4"
        style={{ gridTemplateRows: "auto auto" }}
      >

        {/* Row 1 Left — Controls */}
        <div className="xl:col-span-4 xl:row-start-1">
          <LifeControls
            status={status}
            rows={rows}
            cols={cols}
            speed={speed}
            pattern={pattern}
            wrap={wrap}
            onPlay={handlePlay}
            onPause={handlePause}
            onResume={handleResume}
            onStep={handleStep}
            onReset={handleReset}
            onClear={handleClear}
            onRandomize={handleRandomize}
            onPatternChange={handlePatternChange}
            onApplySize={handleApplySize}
            onSpeedChange={handleSpeedChange}
            onWrapChange={handleWrapChange}
          />
        </div>

        {/* Row 1 Right — Board */}
        <div className="xl:col-span-8 xl:row-start-1 flex flex-col" style={{ alignSelf: "stretch" }}>
          <LifeBoard
            grid={grid}
            onCellClick={handleCellClick}
            isRunning={status === "running"}
          />
        </div>

        {/* Row 2 Left — Stats */}
        <div className="xl:col-span-4 xl:row-start-2 flex flex-col" style={{ height: "400px" }}>
          <LifeStats
            status={status}
            generation={generation}
            rows={rows}
            cols={cols}
            stats={stats}
            pattern={pattern}
            wrap={wrap}
          />
        </div>

        {/* Row 2 Right — Log */}
        <div className="xl:col-span-8 xl:row-start-2 flex flex-col" style={{ height: "400px" }}>
          <LifeLog log={log} />
        </div>

      </div>
    </div>
  );
}
