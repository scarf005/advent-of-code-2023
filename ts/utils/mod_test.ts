import { assertEquals } from "$std/assert/assert_equals.ts"
import { day } from "./mod.ts"

Deno.test("gets correct day", () => {
	const input = "file:///home/scarf/repo/aoc-2023/ts/day1/part2.ts"

	assertEquals(day(input), 1)
})
