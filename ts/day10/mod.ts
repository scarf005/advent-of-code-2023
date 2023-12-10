import { input } from "$utils/mod.ts"
import outdent from "$outdent/mod.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { c, o } from "$copb/mod.ts"
import { zip } from "$std/collections/zip.ts"
import { rgb24 } from "$std/fmt/colors.ts"

type Base = "S" | " "
type Tile = Base | Pipe | VisitedPipe
type Pipe = "│" | "└" | "┘" | "┐" | "┌" | "─"
type VisitedPipe = "┃" | "┗" | "┛" | "┓" | "┏" | "━"
type Loop = Base | VisitedPipe
type Lengths = " " | number

// 2d array of immutable elements
type Grid<T> = readonly (readonly T[])[]

const isVisited = (c: Tile): c is "S" | VisitedPipe =>
	["S", "┃", "┗", "┛", "┓", "┏", "━"].includes(c)

const visitMap = {
	"│": "┃",
	"└": "┗",
	"┘": "┛",
	"┐": "┓",
	"┌": "┏",
	"─": "━",
} as const

// | is a vertical pipe connecting north and south.
// - is a horizontal pipe connecting east and west.
// L is a 90-degree bend connecting north and east.
// J is a 90-degree bend connecting north and west.
// 7 is a 90-degree bend connecting south and west.
// F is a 90-degree bend connecting south and east.
// . is ground; there is no pipe in this tile.
const visualize = (x: string): string =>
	x
		.replaceAll("|", "│")
		.replaceAll("L", "└")
		.replaceAll("J", "┘")
		.replaceAll("7", "┐")
		.replaceAll("F", "┌")
		.replaceAll("-", "─")
		.replaceAll(".", " ")

const parse = (x: string): Grid<Tile> => {
	const xss = visualize(x).split("\n")
	const width = xss[0].length + 2
	const pad = () => Array(width).fill(" ")

	// pad empty first and last line to sidestep border checks
	const yss = [
		pad(),
		...xss.map((x) => [" ", ...x.split(""), " "]),
		pad(),
	] as Tile[][]

	assertEquals(yss.length, x.split("\n").length + 2)
	assertEquals(yss[0].length, width)
	assertEquals(yss[1].length, width)

	return yss
}

type Pos = { y: number; x: number }

const findStart = (xss: Grid<string>): Pos => {
	const y = xss.findIndex((xs) => xs.includes("S"))
	if (y === -1) throw new Error("no start found")
	const x = xss[y].findIndex((x) => x === "S")
	if (x === -1) throw new Error("no start found")

	return { y, x }
}

const example = outdent`
..F7.
.FJ|.
SJ.L7
|F--J
LJ...
`
const display = (xss: Grid<string>) => xss.map((xs) => xs.join("")).join("\n")

// color is determined by distance from center
// @param d dimension
// @param s center of grid
const mkColor = (d: Pos, s: Pos) => (c: string, { x, y }: Pos, len: number): string =>
	rgb24(c, {
		r: 255 * Math.sin(x / d.x),
		g: 255 * Math.sin(y / d.y),
		b: 255 * Math.sin(len),
	})

type DisplayOption = {
	xss: Grid<string>
	yss: Grid<Lengths>
	center: Pos
	longest: number
}
const displayResult = ({ xss, yss, center, longest }: DisplayOption) => {
	const w = xss[0].length
	const h = xss.length
	// const color = mkColor({ x: xss[0].length, y: xss.length }, center)

	return zip(xss, yss)
		.map(([xs, ys], j) =>
			zip(xs, ys)
				.map(([x, y], i) =>
					typeof y === "number"
						? rgb24(x, {
							r: 255 * (y / (longest / 100)),
							g: 255 * (y / (longest / 10)),
							b: 255 * (y / longest) ,
						})
						: " "
					// typeof y === "number" ? y : x
					// color(x, { y: j, x: i }, typeof y === "number" ? y : 0)
				).join("")
		).join("\n")
}

const mkAt = (xss: Grid<string>) => (p: Pos): string => xss[p.y][p.x]

const up = (p: Pos): Pos => ({ y: p.y - 1, x: p.x })
const down = (p: Pos): Pos => ({ y: p.y + 1, x: p.x })
const left = (p: Pos): Pos => ({ y: p.y, x: p.x - 1 })
const right = (p: Pos): Pos => ({ y: p.y, x: p.x + 1 })
const toVisit = (c: Tile): c is Pipe => ![" ", "#", "S", "┃", "┗", "┛", "┓", "┏", "━"].includes(c)

const movementMap = {
	"│": [up, down],
	"└": [up, right],
	"┘": [left, up],
	"┐": [left, down],
	"┌": [right, down],
	"─": [left, right],
} as const

/**
 * paint loop made by `S` with `#`
 *
 * TODO: paint distance instead?
 */
const paintLoop = (xss: Grid<Tile>): Grid<Loop> => {
	const yss: Loop[][] = structuredClone(xss)
	const s = findStart(yss)
	const stack: Pos[] = [up, down, left, right].map((f) => f(s))

	const visit = (p: Pos, c: Pipe) => stack.push(...movementMap[c].map((f) => f(p)))
	const paint = (p: Pos, c: Pipe) => yss[p.y][p.x] = visitMap[c]

	while (stack.length > 0) {
		const p = stack.pop()!
		const c = yss[p.y][p.x]

		if (!toVisit(c)) continue

		paint(p, c)
		visit(p, c)
	}
	return yss
}

const clean = (xss: Grid<Loop>): Grid<Loop> =>
	xss.map((xs) => xs.map((c) => isVisited(c as Tile) ? c : " "))

const startsLeft = (s: string) => ["┏", "┗", "━"].includes(s)
const startsRight = (s: string) => ["┓", "┛", "━"].includes(s)
const startsUp = (s: string) => ["┏", "┓", "┃"].includes(s)
const startsDown = (s: string) => ["┗", "┛", "┃"].includes(s)

const connected = (xss: Grid<string>, s: Pos) => {
	const at = mkAt(xss)

	const stack: Pos[] = []
	if (startsLeft(at(left(s)))) stack.push(left(s))
	if (startsRight(at(right(s)))) stack.push(right(s))
	if (startsUp(at(up(s)))) stack.push(up(s))
	if (startsDown(at(down(s)))) stack.push(down(s))
	return stack as [Pos, Pos]
}

const mkGetNext = (xss: Grid<string>) => (s: Pos): Pos | undefined => {
	const at = mkAt(xss)

	if (startsLeft(at(left(s)))) return left(s)
	if (startsRight(at(right(s)))) return right(s)
	if (startsUp(at(up(s)))) return up(s)
	if (startsDown(at(down(s)))) return down(s)
}

// use BFS to mark map length
const findLongestTrail = (xss: Grid<Loop>): Grid<Lengths> => {
	const yss = structuredClone(xss)
	const s = findStart(yss as Grid<Loop>)
	const getNext = mkGetNext(yss as Grid<Loop>)

	// const stack: [Pos, Pos][] = [connected(yss, s)]
	let cursor: [Pos, Pos] | undefined = connected(yss, s)
	yss[s.y][s.x] = 0

	let str = 0
	const next = ([l, r]: [Pos, Pos]): [Pos, Pos] | undefined => {
		str += 1
		yss[l.y][l.x] = str
		yss[r.y][r.x] = str

		const [nl, nr] = [getNext(l), getNext(r)]
		if (nl === undefined || nr === undefined) {
			return undefined
		}
		return [nl, nr]
	}

	while (cursor) {
		cursor = next(cursor)
	}
	// const [a, b] = loopEnds(yss)
	// console.log({ a, b })
	// const next = (prev: Pos, cur: Pos): Pos => {
	//     const
	// }
	return yss
}

if (import.meta.main) {
	// const text = await input(import.meta)
	const text = example

	const part1 = c(o(clean)(paintLoop)(parse))

	const result = part1(text)
	// console.log(display(result))

	const trail = findLongestTrail(result)
	const center = findStart(result)
	const longest = trail.flatMap((xs) => xs.filter((x): x is number => typeof x === "number"))
		.reduce((a, b) => Math.max(a, b))

	console.log(displayResult({ xss: result, yss: trail, center, longest }))
	console.log(longest)
	// const yss = xss.map((xs) => xs.map((c) => isVisited(c) ? c : " "))

	// console.log(display.includes("S"))
}
