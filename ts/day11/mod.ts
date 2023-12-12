import outdent from "$outdent/mod.ts"
import { zip } from "$std/collections/zip.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { id, input, parallelOption, Pos, sum } from "$utils/mod.ts"

// 10x10
const example = outdent`
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....
`

const example2 = outdent`
................
......#.........
..........#.....
...#............
................
.........#......
....#...........
............#...
................
..........#.....
...#...#........
................
`

/**
 * `#`: Galaxy, `.`: space
 */
type Tile = "#" | "."

export type Grid<T> = readonly (readonly T[])[]

export const parse = (x: string): Grid<Tile> => x.split("\n").map((x) => x.split("")) as Grid<Tile>

export const parsePos = (xss: Grid<Tile>): Pos[] =>
	xss.flatMap((xs, y) =>
		xs.reduce((acc, c, x) => c === "#" ? [...acc, { x, y }] : acc, [] as Pos[])
	)

Deno.test("parsePos", () =>
	assertEquals(parsePos(parse(example)), [
		{ x: 3, y: 0 },
		{ x: 7, y: 1 },
		{ x: 0, y: 2 },
		{ x: 6, y: 4 },
		{ x: 1, y: 5 },
		{ x: 9, y: 6 },
		{ x: 7, y: 8 },
		{ x: 0, y: 9 },
		{ x: 4, y: 9 },
	]))

const emptyRows = (xss: Grid<Tile>): number[] =>
	xss.map((xs, y) => xs.every((x) => x === ".") ? y : undefined).filter(id).map(Number)

const emptyCols = (xss: Grid<Tile>): number[] =>
	// zip(...xss).map((xs, x) => xs.every((x) => x === ".") ? x : undefined).filter(id).map(Number)
	xss[0].map((_, x) => xss.every((xs) => xs[x] === ".") ? x : undefined).filter(id).map(Number)

Deno.test("emptyRows", () => assertEquals(emptyRows(parse(example)), [3, 7]))
Deno.test("emptyCols", () => assertEquals(emptyCols(parse(example)), [2, 5, 8]))

const crosses = (xs: number[]) => (y: number): number => xs.findLastIndex((x) => x < y) + 1

Deno.test("crosses", () => {
	const cx = crosses([2, 5, 8])
	const cases = [[0, 0], [1, 0], [3, 1], [4, 1], [6, 2], [7, 2], [9, 3]] as const

	cases.forEach(([y, expected]) => assertEquals(cx(y), expected))
})

const expand = (xss: Grid<Tile>, N = 2): Pos[] => {
	const rows = emptyRows(xss)
	const cols = emptyCols(xss)

	const cx = crosses(cols)
	const cy = crosses(rows)
	return parsePos(xss).map(({ y, x }) => ({ y: y + cy(y) * (N - 1), x: x + cx(x) * (N - 1) }))
}

export const combination = <T>(xs: readonly T[], n: number): readonly T[][] => {
	if (n === 0) return [[]]
	if (xs.length === 0) return []

	const [x, ...rest] = xs
	const withX = combination(rest, n - 1).map((ys) => [x, ...ys])
	const withoutX = combination(rest, n)

    return withX.concat(withoutX)
}

export const manhattanDist = (a: Pos, b: Pos): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
Deno.test("dist", parallelOption, async (t) => {
	const cases = [
		[{ x: 4, y: 0 }, { x: 9, y: 10 }, 15],
		[{ x: 1, y: 6 }, { x: 5, y: 11 }, 9],
	] as const
	const tests = cases.map(([a, b, expected]) =>
		t.step(
			`dist(${JSON.stringify(a)}, ${JSON.stringify(b)}) == ${expected}`,
			() => assertEquals(manhattanDist(a, b), expected),
		)
	)

	await Promise.all(tests)
})

Deno.test("combination", () => {
	assertEquals(combination([1, 2, 3], 2), [[1, 2], [1, 3], [2, 3]])
	assertEquals(combination([1, 2, 3], 3), [[1, 2, 3]])
	assertEquals(combination([1, 2, 3, 4], 2), [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]])

	const ps = combination(parsePos(parse(example)), 2)
	assertEquals(ps.length, 36)
})

Deno.test("expand", () => {
	const xss = parse(example)

	assertEquals(expand(xss), [
		{ x: 4, y: 0 },
		{ x: 9, y: 1 },
		{ x: 0, y: 2 },
		{ x: 8, y: 5 },
		{ x: 1, y: 6 },
		{ x: 12, y: 7 },
		{ x: 9, y: 10 },
		{ x: 0, y: 11 },
		{ x: 5, y: 11 },
	])
})

export const solve = (xss: Grid<Tile>) => (multiplier: number): number => {
    const points = expand(xss, multiplier)
	const begin = performance.now()
	const ps = combination(points, 2)
	console.log(performance.now() - begin, "ms")
	// console.log(ps)
	const dist = ps.map(([a, b]) => manhattanDist(a, b))
	return dist.reduce(sum)
}

Deno.test("solve", () => {
	const xss = parse(example2)
	const s = solve(xss)

	assertEquals(s(2), 374)
	assertEquals(s(10), 1030)
	assertEquals(s(100), 8410)
})

if (import.meta.main) {
	// const text = example
	const text = await input(import.meta)

	const xss = parse(text)

	console.log(solve(xss)(1000000))
}
