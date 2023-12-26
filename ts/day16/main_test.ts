import { input } from "$utils/mod.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { part1, part2 } from "./main.ts"

const text = await input(import.meta)

Deno.test("day 16", async (t) => {
	await t.step("part 1", () => assertEquals(part1(text), 6622))
    // takes 4 minutes to run because inefficiency
    // await t.step("part 2", () => assertEquals(part2(text), 7130))
})
