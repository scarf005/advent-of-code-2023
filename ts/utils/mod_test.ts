import { assertEquals } from "$std/assert/assert_equals.ts"
import { day, gcd, parallelOption } from "./mod.ts"

Deno.test("gets correct day", () => {
	const input = "file:///home/scarf/repo/aoc-2023/ts/day1/part2.ts"

	assertEquals(day(input), 1)
})

Deno.test("gcd", parallelOption, async (t) => {
	const cases = [
		{ given: [6, 9], expected: 3 },
		{ given: [9, 6], expected: 3 },
		{ given: [6, 6], expected: 6 },
		{ given: [6, 0], expected: 6 },
		{ given: [0, 6], expected: 6 },
		{ given: [0, 0], expected: 0 },
	] as const

	const checks = cases.map(({ given: [x, y], expected }) =>
		t.step(`gcd(${x}, ${y})`, () => assertEquals(gcd(x, y), expected))
	)

	await Promise.all(checks)
})

// Deno.test(  "lcm", parallelOption, async (t) => {
