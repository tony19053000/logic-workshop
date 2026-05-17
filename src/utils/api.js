/**
 * api.js — thin wrapper around the Python FastAPI backend.
 * Base URL comes from VITE_API_URL so it works locally and on Render.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");

/** GET /api/metadata/{disks} — returns totalMoves and optional warning. */
export async function fetchMetadata(disks) {
  const res = await fetch(`${API_BASE_URL}/api/metadata/${disks}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Metadata fetch failed (${res.status})`);
  }
  return res.json();
}

/** GET /api/move/{disks}/{moveNumber} — returns { disk, from, to }. */
export async function fetchMove(disks, moveNumber) {
  const res = await fetch(`${API_BASE_URL}/api/move/${disks}/${moveNumber}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Move fetch failed (${res.status})`);
  }
  return res.json();
}

/** GET /api/solve/{disks} — returns all moves at once (small counts only). */
export async function fetchAllMoves(disks) {
  const res = await fetch(`${API_BASE_URL}/api/solve/${disks}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Solve fetch failed (${res.status})`);
  }
  return res.json();
}

// ──────────────────────────────────────────────
// GAME OF LIFE
// ──────────────────────────────────────────────

/** GET /api/life/preset/{pattern} — returns a seeded grid. */
export async function fetchLifePreset(pattern, rows, cols, density) {
  let url = `${API_BASE_URL}/api/life/preset/${encodeURIComponent(pattern)}?rows=${rows}&cols=${cols}`;
  if (density !== undefined) url += `&density=${density}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Preset fetch failed (${res.status})`);
  }
  return res.json();
}

/** POST /api/life/step — advance by one generation. */
export async function fetchLifeStep(grid, wrap = false) {
  const res = await fetch(`${API_BASE_URL}/api/life/step`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grid, wrap }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Step failed (${res.status})`);
  }
  return res.json();
}
