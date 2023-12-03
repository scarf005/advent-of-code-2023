import { assertEquals } from "$std/assert/assert_equals.ts"
import { isSurrounding, type Num, type Sym } from "./parse.ts"
import { parallelOption } from "$utils/mod.ts"

const pos = (x: Num | Sym): string => `${x.type}{y:${x.y}, x:${x.x}}`

Deno.test("isSurrounding", parallelOption, async (t) => {
	const cases: { num: Num; sym: Sym; expected: boolean }[] = [
		{
			num: { type: "num", val: "617", x: 0, y: 4 },
			sym: { type: "sym", val: "*", x: 3, y: 4 },
			expected: true,
		},
	]
	const tests = cases.map(({ num, sym, expected }) =>
		t.step(
			`${pos(sym)}${expected ? "" : "doesn't"} surround ${pos(num)}`,
			() => assertEquals(isSurrounding(num, sym), expected),
		)
	)
	await Promise.all(tests)
})
