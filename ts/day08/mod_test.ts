import { assertEquals } from "$std/assert/assert_equals.ts"
import { part1 } from "./mod.ts"
import { example, exampleCycle } from "./_example.ts"
import { input } from "$utils/mod.ts"

const text = await input(import.meta)

Deno.test("part 1", () => {
	assertEquals(part1(example), 2)
	assertEquals(part1(exampleCycle), 6)
	assertEquals(part1(text), 13301)
})
