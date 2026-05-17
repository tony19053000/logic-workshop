"""Tower of Hanoi — recursive solver (Python).

CLI usage:
    python hanoi.py 3
"""

import sys


# ==============================
# RECURSION
# ==============================
def solve_hanoi_recursive(n: int, source: str, auxiliary: str, destination: str, moves: list) -> None:
    """Recursively generate all moves and append them to the moves list."""
    if n == 0:
        return

    # Move top n-1 disks to auxiliary
    solve_hanoi_recursive(n - 1, source, destination, auxiliary, moves)

    # Move the largest disk to destination
    moves.append({
        "disk": n,
        "from": source,
        "to": destination,
    })

    # Move n-1 disks from auxiliary to destination
    solve_hanoi_recursive(n - 1, auxiliary, source, destination, moves)


# ==============================
# RECURSION (K-th move)
# Returns one move by index — no full list generated.
# Avoids memory issues for large n (e.g. n=30 → >1 billion moves).
# ==============================
def get_kth_hanoi_move_recursive(
    n: int, k: int, source: str, auxiliary: str, destination: str
) -> dict:
    """Return the k-th move (1-indexed) using recursion — no full list built."""
    if n == 0:
        raise ValueError("k is out of range")

    half = 2 ** (n - 1)

    if k < half:
        # k falls in the first sub-problem
        return get_kth_hanoi_move_recursive(n - 1, k, source, destination, auxiliary)

    elif k == half:
        # k is the anchor move for disk n
        return {"disk": n, "from": source, "to": destination}

    else:
        # k falls in the second sub-problem
        return get_kth_hanoi_move_recursive(
            n - 1, k - half, auxiliary, source, destination
        )


def total_moves(n: int) -> int:
    """Return the total number of moves required: 2^n - 1."""
    return (2 ** n) - 1


# ==============================
# CLI
# Run:  python hanoi.py <number_of_disks>
# ==============================
def cli_demo(n: int) -> None:
    """Print all Tower of Hanoi moves to stdout."""
    moves: list = []
    solve_hanoi_recursive(n, "A", "B", "C", moves)

    print(f"Tower of Hanoi solution for {n} disk{'s' if n != 1 else ''}:")
    for move in moves:
        print(f"  Move disk {move['disk']} from {move['from']} to {move['to']}")
    print(f"\nTotal moves: {len(moves)}  (expected: 2^{n} - 1 = {total_moves(n)})")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python hanoi.py <number_of_disks>")
        print("Example: python hanoi.py 3")
        sys.exit(1)

    try:
        disk_count = int(sys.argv[1])
        if disk_count <= 0:
            raise ValueError("Number of disks must be a positive integer.")
    except ValueError as exc:
        print(f"Error: {exc}")
        sys.exit(1)

    cli_demo(disk_count)
