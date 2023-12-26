import { input } from "$utils/mod.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { part1 } from "./main.ts"

const text = await input(import.meta)

Deno.test("day 16", async (t) => {
	await t.step("part 1", () => assertEquals(part1(text), 6622))
})
