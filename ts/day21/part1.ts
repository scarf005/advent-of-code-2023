import outdent from "$outdent/mod.ts"
import { input } from "$utils/mod.ts"

const ex1 = outdent`
...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........
`
const actual = await input(import.meta)

const text = actual

const grid = text.replace("S", "O").split("\n").map((x) => x.split("")) as Grid
type Tile = "." | "#" | "O"
type Grid = Tile[][]

const print = (xss: Grid) => console.log(xss.map((x) => x.join("")).join("\n"))

const step = (xss: Grid): Grid => {
	const yss = xss.map((row) => row.map((x) => x) as Tile[])
	for (let y = 0; y < xss.length; y++) {
		const row = xss[y]
		for (let x = 0; x < row.length; x++) {
			const tile = row[x]
			if (tile === "O") {
				yss[y][x] = "."
				if (xss[y - 1]?.[x] === ".") yss[y - 1][x] = "O"
				if (xss[y + 1]?.[x] === ".") yss[y + 1][x] = "O"
				if (row[x - 1] === ".") yss[y][x - 1] = "O"
				if (row[x + 1] === ".") yss[y][x + 1] = "O"
			}
		}
	}
	return yss
}
// print(grid)
// console.log()
// print(step(grid))
// console.log()

const steps = (xss: Grid) => (n: number): Grid => {
	for (let i = 0; i < n; i++) {
		xss = step(xss)
	}
	return xss
}

const res = steps(grid)(64)

print(res)
const count = res.flat().reduce((acc, x) => acc + (x === "O" ? 1 : 0), 0)
console.log({ count })

/*
...........
.....###.#.
.###.##..#.
..#.#2..#..
....#1#....
.##212####.
.##.2#...#.
.......##..
.##.#.####.
.##..##.##.
...........

*/
