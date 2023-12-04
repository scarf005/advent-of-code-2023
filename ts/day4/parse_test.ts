import { parallelOption } from "$utils/mod.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { parse } from "./parse.ts"
import cases from "./parse_cases.json" with { type: "json" }


Deno.test("parse", parallelOption, async (t) => {
	const tests = cases.map(({ given, expected }) =>
		t.step(given, () => assertEquals(parse(given), expected))
	)
	await Promise.all(tests)
})
