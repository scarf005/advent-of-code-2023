import { assertEquals } from "$std/assert/assert_equals.ts"
import { parseHand } from "./part1.ts"

const cases = [
	["AAAAA", 6],
	["AA8AA", 5],
	["23332", 4],
	["TTT98", 3],
	["23432", 2],
	["A23A4", 1],
	["23456", 0],
] as const

Deno.test("parseHand", () => {
	cases.forEach(([raw, score]) => assertEquals(parseHand(raw).strength, score))
})
