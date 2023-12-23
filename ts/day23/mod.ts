import outdent from "$outdent/mod.ts"
import { Grid } from "../day11/mod.ts"
import { input, Pos } from "$utils/mod.ts"
import { bgRgb24, bold, rgb24 } from "$std/fmt/colors.ts"

export const ex = outdent`
#.#####################
#.......#########...###
#######.#########.#.###
###.....#.>.>.###.#.###
###v#####.#v#.###.#.###
###.>...#.#.#.....#...#
###v###.#.#.#########.#
###...#.#.#.......#...#
#####.#.#.#######.#.###
#.....#.#.#.......#...#
#.#####.#.#.#########v#
#.#...#...#...###...>.#
#.#.#v#######v###.###v#
#...#.>.#...>.>.#.###.#
#####v#.#.###v#.#.###.#
#.....#...#...#.#.#...#
#.#########.###.#.#.###
#...###...#...#...#.###
###.###.#.###v#####v###
#...#...#.#.>.>.#.>.###
#.###.###.#.###.#.#v###
#.....###...###...#...#
#####################.#
`
export type Tile = "#" | "." | "v" | "^" | "<" | ">"
export const parse = (x: string): Grid<Tile> => x.split("\n").map((x) => x.split("") as Tile[])
export const display = (grid: Grid<string>) => grid.map((x) => x.join("")).join("\n")
export const actual = await input(import.meta)

export const mkInBounds = (xss: Grid<Tile>) => {
	const width = xss[0].length
	const height = xss.length

	return (p: Pos) => p.x >= 0 && p.x < width && p.y >= 0 && p.y < height
}

export const mkGet = (xss: Grid<Tile>) => (p: Pos) => xss[p.y][p.x]

export const displayVisited = (xss: Grid<Tile>, cur: Pos, visited: Set<string>): string => {
	const yss = structuredClone(xss)

	let i = 0
	visited.forEach((v) => {
		const [y, x] = v.split(",").map((x) => +x)
		const c = 105 + Math.floor((i / visited.size) * 150)
		yss[y][x] = bold(rgb24("O", { r: c / 2, g: c, b: c * 1.5 }))
		i++
	})
	yss[cur.y][cur.x] = bold(bgRgb24("X", { r: 255, g: 0, b: 0 }))
	return display(yss)
}
export const posEq = (a: Pos, b: Pos) => a.x === b.x && a.y === b.y
