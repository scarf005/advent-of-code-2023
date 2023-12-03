import { assertEquals } from "$std/assert/assert_equals.ts"
import { part1 } from "./part1.ts"
import outdent from "$outdent/mod.ts"

Deno.test("example", () => {
	const input = outdent`
        467..114..
        ...*......
        ..35..633.
        ......#...
        617*......
        .....+.58.
        ..592.....
        ......755.
        ...$.*....
        .664.598..
    `
	assertEquals(part1(input), 4361)
})
