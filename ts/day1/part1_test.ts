import { assertEquals } from "$std/assert/assert_equals.ts"
import outdent from "$outdent/mod.ts"
import { parse, part1 } from "../day1/part1.ts"
import { parallelOption } from "$utils/mod.ts"

const cases = [
	{ given: "1abc2", expected: 12 },
	{ given: "pqr3stu8vwx", expected: 38 },
	{ given: "a1b2c3d4e5f", expected: 15 },
	{ given: "treb7uchet", expected: 77 },
]

Deno.test("calibrate", parallelOption, async (t) => {
	const tests = cases.map(({ given, expected }) =>
		t.step(`${given} -> ${expected}`, () => assertEquals(parse(given), expected))
	)
	await Promise.all(tests)
})

Deno.test("example", () => {
	const input = outdent`
        1abc2
        pqr3stu8vwx
        a1b2c3d4e5f
        treb7uchet
    `
	assertEquals(part1(input), 142)
})
