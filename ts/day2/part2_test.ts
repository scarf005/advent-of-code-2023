import { zip } from "$std/collections/zip.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import outdent from "$outdent/mod.ts"

import { Game } from "./color.ts"
import { part2, power } from "./part2.ts"

import parseCases from "./parse_cases.json" with { type: "json" }
import { parallelOption } from "$utils/mod.ts"

const expected = [48, 12, 1560, 630, 36]
const given = parseCases.map((c) => c.expected as Game)
const cases = zip(given, expected)

Deno.test("power", parallelOption, async (t) => {
	const tests = cases.map(([given, expected]) =>
		t.step(`Game ${given.id} -> ${expected}`, () => assertEquals(power(given), expected))
	)
	await Promise.all(tests)
})

Deno.test("example", () => {
	const input = outdent`
        Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
        Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
        Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
        Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
        Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
    `
	assertEquals(part2(input), 2286)
})
