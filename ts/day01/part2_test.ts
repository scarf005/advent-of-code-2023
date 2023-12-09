import { assertEquals } from "$std/assert/assert_equals.ts"
import outdent from "$outdent/mod.ts"
import { parse, part2 } from "./part2.ts"
import { parallelOption } from "$utils/mod.ts"

const cases = [
	{ given: "two1nine", expected: 29 },
	{ given: "eightwothree", expected: 83 },
	{ given: "abcone2threexyz", expected: 13 },
	{ given: "xtwone3four", expected: 24 },
	{ given: "4nineeightseven2", expected: 42 },
	{ given: "zoneight234", expected: 14 },
	{ given: "7pqrstsixteen", expected: 76 },

	// Last digit is eight
	{ given: "1oneight", expected: 18 },
]

Deno.test("calibrate", parallelOption, async (t) => {
	const tests = cases.map(({ given, expected }) =>
		t.step(`${given} -> ${expected}`, () => assertEquals(parse(given), expected))
	)
	await Promise.all(tests)
})

Deno.test("example", () => {
	const input = outdent`
        two1nine
        eightwothree
        abcone2threexyz
        xtwone3four
        4nineeightseven2
        zoneight234
        7pqrstsixteen
    `
	assertEquals(part2(input), 281)
})
