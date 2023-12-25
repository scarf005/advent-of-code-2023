import { assertEquals } from "$std/assert/assert_equals.ts"
import { input, parallelOption } from "$utils/mod.ts"
import { ex2, ex3, ex4, ex5 } from "./_example.ts"
import { parseGrid, part1, part2 } from "./main.ts"

Deno.test("day 10", async (t) => {
	const text = await input(import.meta)
	const grid = parseGrid(text)

	await t.step("part 1", () => assertEquals(part1(grid), 6613))
	await t.step("part 2", () => assertEquals(part2(grid), 511))
})

Deno.test("part 1", () => assertEquals(part1(parseGrid(ex2)), 8))
Deno.test("part 2", parallelOption, async (t) => {
	const cases = [
		{ name: "ex3", given: ex3, expected: 4 },
		{ name: "ex4", given: ex4, expected: 8 },
		{ name: "ex5", given: ex5, expected: 10 },
	]
	const tests = cases.map(({ name, given, expected }) =>
		t.step(`${name} -> ${expected}`, () => assertEquals(part2(parseGrid(given)), expected))
	)
	await Promise.all(tests)
})
