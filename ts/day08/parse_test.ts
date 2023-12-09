import { assertEquals } from "$std/assert/assert_equals.ts"
import { example } from "./_example.ts"
import { parse } from "./parse.ts"

const expected = {
	path: ["R", "L"],
	routes: new Map([
		["AAA", { L: "BBB", R: "CCC" }],
		["BBB", { L: "DDD", R: "EEE" }],
		["CCC", { L: "ZZZ", R: "GGG" }],
		["DDD", { L: "DDD", R: "DDD" }],
		["EEE", { L: "EEE", R: "EEE" }],
		["GGG", { L: "GGG", R: "GGG" }],
		["ZZZ", { L: "ZZZ", R: "ZZZ" }],
	]),
}

Deno.test("parse", () => assertEquals(parse(example), expected))
