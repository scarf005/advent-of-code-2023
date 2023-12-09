import { assertEquals } from "$std/assert/assert_equals.ts"
import { part2 } from "./part2.ts"
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
	assertEquals(part2(input), 467835)
})
