from dataclasses import dataclass
from pathlib import Path
import re

actual = Path(".cache/24.txt").read_text()
ex = """\
19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3"""

regex = re.compile(
    r"(?P<px>\d+),\s+(?P<py>\d+),\s+(?P<pz>\d+)\s+@\s+(?P<vx>-?\d+),\s+(?P<vy>-?\d+),\s+(?P<vz>-?\d+)"
)


@dataclass
class Data:
    x: int
    y: int
    z: int
    vx: int
    vy: int
    vz: int


def parse(line: str) -> Data:
    match regex.match(line):
        case None:
            raise ValueError(f"Could not parse {line}")
        case match:
            return Data(
                x=int(match.group("px")),
                y=int(match.group("py")),
                z=int(match.group("pz")),
                vx=int(match.group("vx")),
                vy=int(match.group("vy")),
                vz=int(match.group("vz")),
            )


text = actual
xs = [parse(x) for x in text.splitlines()]

"""
t >= 0
x + t * vx = sx + t * svx
y + t * vy = sy + t * svy
z + t * vz = sz + t * svz

->

sx + t * svx - x - t * vx = 0
sy + t * svy - y - t * vy = 0
sz + t * svz - z - t * vz = 0
"""

from z3 import Int, Solver, BitVec


def IB(name: str):
    return BitVec(name, 64)


x, y, z = IB("x"), IB("y"), IB("z")
vx, vy, vz = IB("vx"), IB("vy"), IB("vz")

solver = Solver()
for i, h in enumerate(xs):
    t = IB(f"t{i}")

    solver.add(t >= 0)
    solver.add(x + vx * t == h.x + h.vx * t)
    solver.add(y + vy * t == h.y + h.vy * t)
    solver.add(z + vz * t == h.z + h.vz * t)

res = solver.check()
print(res)


m = solver.model()
x, y, z = m.eval(x), m.eval(y), m.eval(z)
x, y, z = x.as_long(), y.as_long(), z.as_long()

print(x + y + z)
