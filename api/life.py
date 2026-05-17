"""Conway's Game of Life — Python implementation.

CLI usage:
    python life.py --rows 20 --cols 40 --generations 20 --pattern glider
    python life.py --rows 10 --cols 20 --generations 5  --pattern blinker
"""

import argparse
import random


# ──────────────────────────────────────────────────────
# GRID CREATION
# ──────────────────────────────────────────────────────

def create_empty_grid(rows: int, cols: int) -> list:
    """Return a rows × cols grid filled with 0s."""
    return [[0] * cols for _ in range(rows)]


def create_random_grid(rows: int, cols: int, density: float = 0.25) -> list:
    """Return a grid where each cell is alive with probability = density."""
    density = max(0.0, min(1.0, density))
    return [
        [1 if random.random() < density else 0 for _ in range(cols)]
        for _ in range(rows)
    ]


# ──────────────────────────────────────────────────────
# NEIGHBOR COUNTING
# ──────────────────────────────────────────────────────

def count_live_neighbors(grid: list, row: int, col: int, wrap: bool = False) -> int:
    """Count live neighbors around one cell (8-directional)."""
    rows = len(grid)
    cols = len(grid[0])
    count = 0

    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue  # skip the cell itself

            nr = row + dr
            nc = col + dc

            if wrap:
                nr %= rows
                nc %= cols
                count += grid[nr][nc]
            else:
                if 0 <= nr < rows and 0 <= nc < cols:
                    count += grid[nr][nc]

    return count


# ==============================
# ITERATION
# ==============================

def next_generation(grid: list, wrap: bool = False) -> dict:
    """Compute the next generation (B3/S23) and return the new grid with stats."""
    rows = len(grid)
    cols = len(grid[0])

    next_grid = create_empty_grid(rows, cols)
    births = 0
    deaths = 0
    survivors = 0

    for r in range(rows):
        for c in range(cols):
            neighbors = count_live_neighbors(grid, r, c, wrap)
            current = grid[r][c]

            if current == 1:
                if neighbors in (2, 3):
                    next_grid[r][c] = 1
                    survivors += 1
                else:
                    next_grid[r][c] = 0
                    deaths += 1
            else:
                if neighbors == 3:
                    next_grid[r][c] = 1
                    births += 1

    alive_count = sum(sum(row) for row in next_grid)

    return {
        "grid": next_grid,
        "aliveCells": alive_count,
        "births": births,
        "deaths": deaths,
        "survivors": survivors,
    }


# ──────────────────────────────────────────────────────
# PRESET PATTERNS
# ──────────────────────────────────────────────────────

def get_preset_pattern(name: str, rows: int, cols: int, density: float = 0.25) -> list:
    """Return a grid seeded with the named preset pattern, centered."""
    grid = create_empty_grid(rows, cols)
    cr, cc = rows // 2, cols // 2

    def place(cells):
        """Place cells given as (row_offset, col_offset) from center."""
        for dr, dc in cells:
            r, c = cr + dr, cc + dc
            if 0 <= r < rows and 0 <= c < cols:
                grid[r][c] = 1

    name = name.lower().strip()

    if name == "empty":
        pass

    elif name == "random":
        return create_random_grid(rows, cols, density)

    elif name == "blinker":
        # Period-2 oscillator
        place([(0, -1), (0, 0), (0, 1)])

    elif name == "toad":
        # Period-2 oscillator
        place([
            (0,  0), (0,  1), (0,  2),
            (1, -1), (1,  0), (1,  1),
        ])

    elif name == "beacon":
        # Period-2 oscillator
        place([
            (-1, -1), (-1, 0),
            ( 0, -1),
            ( 1,  2),
            ( 2,  1), ( 2, 2),
        ])

    elif name == "glider":
        # Period-4 spaceship, moves diagonally
        place([
            (-1,  0),
            ( 0,  1),
            ( 1, -1), (1, 0), (1, 1),
        ])

    elif name == "lightweight_spaceship":
        # Period-4 spaceship, moves horizontally
        place([
            (-1, -1), (-1,  2),
            ( 0, -2),
            ( 1, -2), ( 1,  2),
            ( 2, -2), ( 2, -1), (2, 0), (2, 1),
        ])

    elif name == "pulsar":
        # Period-3 oscillator, needs at least 17×17
        place([
            (-6, -4), (-6, -3), (-6, -2), (-6,  2), (-6,  3), (-6,  4),
            (-4, -6), (-4, -1), (-4,  1), (-4,  6),
            (-3, -6), (-3, -1), (-3,  1), (-3,  6),
            (-2, -6), (-2, -1), (-2,  1), (-2,  6),
            (-1, -4), (-1, -3), (-1, -2), (-1,  2), (-1,  3), (-1,  4),
            ( 1, -4), ( 1, -3), ( 1, -2), ( 1,  2), ( 1,  3), ( 1,  4),
            ( 2, -6), ( 2, -1), ( 2,  1), ( 2,  6),
            ( 3, -6), ( 3, -1), ( 3,  1), ( 3,  6),
            ( 4, -6), ( 4, -1), ( 4,  1), ( 4,  6),
            ( 6, -4), ( 6, -3), ( 6, -2), ( 6,  2), ( 6,  3), ( 6,  4),
        ])

    elif name == "gosper_glider_gun":
        # Infinite glider gun — placed near left edge
        r0 = rows // 2 - 4
        c0 = 1
        cells = [
            (0, 24),
            (1, 22), (1, 24),
            (2, 12), (2, 13), (2, 20), (2, 21), (2, 34), (2, 35),
            (3, 11), (3, 15), (3, 20), (3, 21), (3, 34), (3, 35),
            (4,  0), (4,  1), (4, 10), (4, 16), (4, 20), (4, 21),
            (5,  0), (5,  1), (5, 10), (5, 14), (5, 16), (5, 17), (5, 22), (5, 24),
            (6, 10), (6, 16), (6, 24),
            (7, 11), (7, 15),
            (8, 12), (8, 13),
        ]
        for dr, dc in cells:
            r, c = r0 + dr, c0 + dc
            if 0 <= r < rows and 0 <= c < cols:
                grid[r][c] = 1

    elif name == "r_pentomino":
        # 5-cell seed, runs ~1103 generations before stabilising
        place([
            (-1,  0), (-1,  1),
            ( 0, -1), ( 0,  0),
            ( 1,  0),
        ])

    elif name == "acorn":
        # 7-cell seed, takes ~5206 generations to stabilise
        place([
            (-1, -2),
            ( 0,  0),
            ( 1, -3), ( 1, -2), ( 1,  1), ( 1,  2), ( 1,  3),
        ])

    elif name == "diehard":
        # 7-cell seed, vanishes after exactly 130 generations
        place([
            (-1,  2),
            ( 0, -4), ( 0, -3),
            ( 1, -3), ( 1,  1), ( 1,  2), ( 1,  3),
        ])

    else:
        return create_random_grid(rows, cols, density)

    return grid


# ──────────────────────────────────────────────────────
# GRID SUMMARY
# ──────────────────────────────────────────────────────

def grid_summary(grid: list) -> dict:
    """Return basic statistics about the current grid state."""
    rows = len(grid)
    cols = len(grid[0]) if rows > 0 else 0
    total = rows * cols
    alive = sum(sum(row) for row in grid)
    return {
        "rows": rows,
        "cols": cols,
        "aliveCells": alive,
        "deadCells": total - alive,
        "totalCells": total,
    }


# ──────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────

def print_grid(grid: list) -> None:
    """Print the grid using █ for alive and . for dead."""
    for row in grid:
        print("".join("█" if cell else "." for cell in row))


def cli_main() -> None:
    """Run Conway's Game of Life in the terminal."""
    parser = argparse.ArgumentParser(
        description="Conway's Game of Life — Python CLI demo"
    )
    parser.add_argument("--rows",        type=int,   default=20,       help="Grid rows (default 20)")
    parser.add_argument("--cols",        type=int,   default=40,       help="Grid columns (default 40)")
    parser.add_argument("--generations", type=int,   default=10,       help="Number of generations (default 10)")
    parser.add_argument("--pattern",     type=str,   default="glider", help="Starting pattern name")
    parser.add_argument("--wrap",        action="store_true",           help="Wrap edges (torus topology)")
    parser.add_argument("--density",     type=float, default=0.25,     help="Alive density for random pattern")
    args = parser.parse_args()

    grid = get_preset_pattern(args.pattern, args.rows, args.cols, args.density)

    header = (
        f"Conway's Game of Life  |  Pattern: {args.pattern}"
        f"  |  Grid: {args.rows}x{args.cols}  |  Wrap: {args.wrap}"
    )
    sep = "-" * min(len(header), args.cols * 2)

    print(header)
    print(sep)

    for gen in range(args.generations + 1):
        summary = grid_summary(grid)
        print(f"\n-- Generation {gen:>3}  |  Alive: {summary['aliveCells']:>4} --")
        print_grid(grid)

        if gen < args.generations:
            result = next_generation(grid, args.wrap)
            grid = result["grid"]

    print(f"\n{sep}")
    print("Simulation complete.")


if __name__ == "__main__":
    cli_main()
