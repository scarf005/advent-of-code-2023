import { assertEquals } from "$std/assert/assert_equals.ts"
import answer from "../../.answer.json" with { type: "json" }
import { input } from "$utils/mod.ts"
import { part1, part2 } from "./mod.ts"

const text = await input(import.meta)

Deno.test({
	name: "part 1",
	fn: () => assertEquals(part1(text), answer.day1.part1),
})

Deno.test({
	name: "part 2",
	fn: () => assertEquals(part2(text), answer.day1.part2),
})
