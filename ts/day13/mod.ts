import outdent from "$outdent/mod.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { input, parallelOption, sum } from "$utils/mod.ts"
import { zip } from "$std/collections/zip.ts"

type Tiles = readonly string[]

const example1 = outdent`
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.
`

const example2 = outdent`
#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`

const example3 = outdent`
#.......##.
.#.###....#
###...#....
..#........
###.##...#.
.#..##..###
####.#.##.#
...#.#.###.
..##.#.###.
.#...#.##.#
#.##..#####
#.##..#####
.#...#.##.#
..##.#.###.
...#.#.###.
`

const rotate = (xs: Tiles): Tiles =>
	Array.from({ length: xs[0].length }, (_, i) => xs.map((x) => x[i]).join(""))

const sharedLen = (totalIdx: number, leftIdx: number): number => {
	const right = leftIdx + 1
	return Math.min(leftIdx + 1, totalIdx - right)
}

Deno.test("sharedLen", parallelOption, async (t) => {
	const cases = [[0, 1], [3, 3], [5, 1]] as const
	const result = cases.map(([left, expected]) =>
		t.step(`sharedLen(7, ${left}) -> ${expected}`, () => assertEquals(sharedLen(7, left), expected))
	)
	await Promise.all(result)
})

type Rows = { up: Tiles; down: Tiles }
const mirrorRowAt = (xs: Tiles) => (row: number): Rows => {
	const diff = sharedLen(xs.length, row)

	const upBegin = row - diff + 1
	const upEnd = upBegin + diff
	const downBegin = row + 1
	const downEnd = downBegin + diff

	const up = xs.slice(upBegin, upEnd)
	const down = xs.slice(downBegin, downEnd)

	return { up, down }
}

Deno.test("mirrorRowAt", parallelOption, async (t) => {
	const xs = example1.split("\n")
	const mirror = mirrorRowAt(xs)

	const cases = [
		{ row: 0, up: xs.slice(0, 1), down: xs.slice(1, 2) },
		{ row: 1, up: xs.slice(0, 2), down: xs.slice(2, 4) },
		{ row: 2, up: xs.slice(0, 3), down: xs.slice(3, 6) },
		{ row: 3, up: xs.slice(1, 4), down: xs.slice(4, 7) },
		{ row: 4, up: xs.slice(3, 5), down: xs.slice(5, 7) },
	]
	const tests = cases.map(({ row, up, down }) =>
		t.step(`row ${row}`, () => assertEquals(mirror(row), { up, down }))
	)
	await Promise.all(tests)
})

const textDiff = (a: string, b: string): number => a.split("").filter((x, i) => x !== b[i]).length

const mirrorDiffs = ({ up, down }: Rows): number => {
	const diff = zip(up, down.toReversed()).map(([a, b]) => textDiff(a, b)).reduce(sum)
	return diff
}

Deno.test("mirrorDiffs", () => {
	assertEquals(
		mirrorDiffs({
			up: ["#.##..##.", "..#.##.#.", "##......#"],
			down: ["##......#", "..#.##.#.", "..##..##."],
		}),
		1,
	)
})

const isMirroring = (rows: Rows): boolean => mirrorDiffs(rows) === 0
const isFixing = (rows: Rows): boolean => mirrorDiffs(rows) === 1

const mirrorsAt = (isMirror: (rows: Rows) => boolean) => (xs: Tiles): number => {
	const at = mirrorRowAt(xs)
	const result = xs
		.slice(0, xs.length - 1)
		.findIndex((_, i) => isMirror(at(i)))

	return result
}

const scoreOf = (isMirror: (rows: Rows) => boolean) => (xs: Tiles) => {
	const at = mirrorsAt(isMirror)
	const col = at(rotate(xs))
	const row = at(xs)

	return (row + 1) * 100 + (col + 1)
}

Deno.test("mirroringRowAt", parallelOption, () => {
	const mirroringRowAt = mirrorsAt(isMirroring)

	assertEquals(mirroringRowAt(example2.split("\n")), 3)
	assertEquals(mirroringRowAt(example3.split("\n")), 10)
	assertEquals(
		mirroringRowAt(outdent`
        .#..#.#..
        #.#...#..
        #.....#..
        ....#####
        #.####.#.
        #.####.#.
        ....#####
        #.....#..
        #.#...#..
    `.split("\n")),
		4,
	)
})
Deno.test("mirroringColAt", parallelOption, () => {
	const mirroringColAt = (xs: Tiles) => mirrorsAt(isMirroring)(rotate(xs))

	assertEquals(mirroringColAt(example1.split("\n")), 4)
})

Deno.test("part2", () => {
	assertEquals(mirrorsAt(isFixing)(example1.split("\n")), 2)
	assertEquals(scoreOf(isFixing)(example1.split("\n")), 300)
})

const part1 = (xss: Tiles[]): number => xss.map(scoreOf(isMirroring)).reduce(sum)
const part2 = (xss: Tiles[]): number => xss.map(scoreOf(isFixing)).reduce(sum)

const parse = (x: string): Tiles[] => x.split("\n\n").map((x) => x.split("\n"))

if (import.meta.main) {
	const text = await input(import.meta)
	const xxs = parse(text)

	console.log(part1(xxs))
	console.log(part2(xxs))
}

// console.log(part1([example1.split("\n"), example2.split("\n")]))
