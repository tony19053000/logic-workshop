"""FastAPI backend for Logic Workshop.

Serves both algorithms via REST:
  - hanoi.py  : recursive Tower of Hanoi
  - life.py   : iterative Conway's Game of Life
"""

import os
from typing import List, Optional
import sys
sys.path.append(os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from hanoi import (
    solve_hanoi_recursive,
    get_kth_hanoi_move_recursive,
    total_moves,
)
from life import (
    get_preset_pattern,
    next_generation,
    grid_summary,
    create_random_grid,
)

app = FastAPI(
    title="Logic Workshop Python API",
    description="Tower of Hanoi (recursion) and Conway's Game of Life (iteration) served by FastAPI",
    version="2.0.0",
)

# ──────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────
_allowed_origins = ["http://localhost:5173", "http://localhost:4173"]

_frontend_origin = os.getenv("FRONTEND_ORIGIN")
if _frontend_origin:
    _allowed_origins.append(_frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────
_LARGE_DISK_WARNING = (
    "Tower of Hanoi requires 2^n - 1 moves. "
    "Large disk counts may take a long time to animate."
)
_LARGE_THRESHOLD = 12


def _validate_disks(disks: int) -> None:
    if disks <= 0:
        raise HTTPException(
            status_code=400,
            detail="Number of disks must be a positive integer.",
        )


# ──────────────────────────────────────────────
# TOWER OF HANOI — ROUTES
# ──────────────────────────────────────────────

@app.get("/")
def root():
    """Health-check endpoint."""
    return {"message": "Tower of Hanoi Python API is running"}


@app.get("/api/metadata/{disks}")
def get_metadata(disks: int):
    """Return total move count for the given disk number."""
    _validate_disks(disks)

    tm = total_moves(disks)
    warning = _LARGE_DISK_WARNING if disks > _LARGE_THRESHOLD else None

    return {
        "disks": disks,
        "totalMoves": tm,
        "totalMovesString": str(tm),  # string so JS BigInt can handle large values
        "warning": warning,
    }


@app.get("/api/move/{disks}/{move_number}")
def get_single_move(disks: int, move_number: int):
    """Return one move by index using the recursive k-th move function."""
    _validate_disks(disks)

    tm = total_moves(disks)

    if move_number < 1 or move_number > tm:
        raise HTTPException(
            status_code=400,
            detail=(
                f"move_number must be between 1 and {tm} "
                f"for {disks} disks."
            ),
        )

    move = get_kth_hanoi_move_recursive(disks, move_number, "A", "B", "C")

    return {
        "disks": disks,
        "moveNumber": move_number,
        "totalMovesString": str(tm),
        "move": move,
    }


@app.get("/api/solve/{disks}")
def solve(disks: int):
    """Return all moves at once. Use /api/move/ for large disk counts."""
    _validate_disks(disks)

    MAX_FULL_SOLVE = 20  # 2^20 - 1 = 1,048,575 moves
    if disks > MAX_FULL_SOLVE:
        tm = total_moves(disks)
        raise HTTPException(
            status_code=400,
            detail=(
                f"For {disks} disks the solution requires {tm} moves. "
                f"Use /api/move/{{disks}}/{{move_number}} to fetch moves one at a time."
            ),
        )

    moves: list = []
    solve_hanoi_recursive(disks, "A", "B", "C", moves)
    tm = len(moves)

    return {
        "disks": disks,
        "totalMoves": tm,
        "totalMovesString": str(tm),
        "moves": moves,
    }


# ──────────────────────────────────────────────
# CONWAY'S GAME OF LIFE — MODELS
# ──────────────────────────────────────────────

class LifeStepRequest(BaseModel):
    grid: List[List[int]]
    wrap: bool = False


class LifeSimulateRequest(BaseModel):
    grid: List[List[int]]
    generations: int = 10
    wrap: bool = False


# ──────────────────────────────────────────────
# CONWAY'S GAME OF LIFE — VALIDATION
# ──────────────────────────────────────────────

def _validate_life_grid(grid: List[List[int]]) -> None:
    """Check grid is non-empty, rectangular, and contains only 0 or 1."""
    if not grid or not grid[0]:
        raise HTTPException(status_code=400, detail="Grid must not be empty.")
    col_len = len(grid[0])
    for i, row in enumerate(grid):
        if len(row) != col_len:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Grid must be rectangular. "
                    f"Row {i} has length {len(row)}, expected {col_len}."
                ),
            )
        for j, val in enumerate(row):
            if val not in (0, 1):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid cell value {val!r} at ({i}, {j}). Only 0 or 1 are allowed.",
                )


# ──────────────────────────────────────────────
# CONWAY'S GAME OF LIFE — ROUTES
# ──────────────────────────────────────────────

@app.get("/api/life")
def life_root():
    """Health-check endpoint for the Game of Life API."""
    return {
        "message": "Conway's Game of Life Python API is running",
        "rules": "B3/S23",
    }


@app.get("/api/life/metadata")
def life_metadata():
    """Return available pattern names."""
    return {
        "name": "Conway's Game of Life",
        "rules": "B3/S23",
        "patterns": [
            "empty",
            "random",
            "blinker",
            "toad",
            "beacon",
            "glider",
            "lightweight_spaceship",
            "pulsar",
        ],
    }


@app.get("/api/life/preset/{pattern_name}")
def life_preset(
    pattern_name: str,
    rows: int = Query(default=25, ge=1, le=200),
    cols: int = Query(default=40, ge=1, le=200),
    density: float = Query(default=0.25, ge=0.0, le=1.0),
):
    """Return a grid seeded with the named preset pattern."""
    grid = get_preset_pattern(pattern_name, rows, cols, density)
    summary = grid_summary(grid)
    return {
        "pattern": pattern_name,
        "rows": rows,
        "cols": cols,
        "grid": grid,
        "summary": summary,
    }


@app.post("/api/life/step")
def life_step(request: LifeStepRequest):
    """Advance the grid by one generation."""
    _validate_life_grid(request.grid)
    result = next_generation(request.grid, request.wrap)
    return result


@app.post("/api/life/simulate")
def life_simulate(request: LifeSimulateRequest):
    """Advance the grid by N generations in one shot. Capped at 500."""
    MAX_GENERATIONS = 500
    if request.generations > MAX_GENERATIONS:
        raise HTTPException(
            status_code=400,
            detail=f"generations must not exceed {MAX_GENERATIONS}.",
        )
    _validate_life_grid(request.grid)
    grid = [row[:] for row in request.grid]
    for _ in range(request.generations):
        result = next_generation(grid, request.wrap)
        grid = result["grid"]
    summary = grid_summary(grid)
    return {
        "grid": grid,
        "generations": request.generations,
        "summary": summary,
    }
