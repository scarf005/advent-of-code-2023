import outdent from "$outdent/mod.ts"
import { zip } from "$std/collections/zip.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { Grid } from "../utils/grid.ts"
import { input, sum } from "$utils/mod.ts"

type Tiles = "O" | "." | "#"
type Input = Grid<Tiles>
const example = await input(import.meta)
// const example = outdent`
// O....#....
// O.OO#....#
// .....##...
// OO.#O....O
// .O.....O#.
// O.#..O.#.#
// ..O..#O..O
// .......O..
// #....###..
// #OO..#....
// `
const expected = outdent`
OOOO.#.O..
OO..#....#
OO..O##..O
O..#.OO...
........#.
..#....#.#
..O..#.O.O
..O.......
#....###..
#....#....
`
const parse = (x: string): Input => zip(...x.split("\n").map((x) => x.split(""))) as Input
const moveRow = (xs: readonly Tiles[]) => {
	// list of index of '#'
	const ys = xs.map((x, i) => [x, i] as const)
	const supports = ys.filter(([x]) => x === "#").map(([, i]) => i)
	const rocks = ys.filter(([x]) => x === "O").map(([, i]) => i)
	const grouped = Object.groupBy(rocks, (x) => supports.findLast((y) => y < x) ?? -1)

	return grouped
}

const ts = (x: string) => x.split("") as readonly Tiles[]

// Deno.test("moveRow", () => {
// 	assertEquals(moveRow(ts("OO.O.O..##")), ts("OOOO....##"))
// 	assertEquals(moveRow(ts("....O#.O#.")), ts("O....#.O#."))
// })

/**
 * (since it's rotated)
 * 1. move all rocks to left, considering #
 * 2. get score of each row
 */
const parsedExample = parse(example)

console.log(parsedExample.map((x) => x.join("")).join("\n"))
console.log()
// console.log("....O#.O#.", moveRow(ts("....O#.O#.")))
// console.log(".#.O.#O...", moveRow(ts(".#.O.#O...")))
// console.log("#.#..O#.##", moveRow(ts("#.#..O#.##")))

console.log(parsedExample.map(moveRow))

const height = parsedExample[0].length
console.log(height)
console.log(
	(parsedExample.map(moveRow)).map((record) =>
		Object.entries(record).map(
			([begin, rocks]) => {
				const front = height - +begin - 1
				const end = front - (rocks.length - 1)
				// console.log(front)
				return (front + end) * rocks.length / 2
			},
			// ([begin, rocks]) => [height - +begin, rocks.length],
		)
	)
		.flat().reduce(sum),
)
// 10 + 9 + 8 + 7 = 34
// ((10 - 0) + (10 - 0 - (4 - 1))) * 4 / 2
//  (height - begin) + ((height - begin) - (rocks.length - 1)) * rocks.length / 2
