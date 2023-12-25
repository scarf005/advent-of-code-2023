import { assertEquals } from "$std/assert/assert_equals.ts"
import { input } from "$utils/mod.ts"
import { part1, part2 } from "./main.ts"

const text = await input(import.meta)

Deno.test("part 1", () => assertEquals(part1(text), 67891))
Deno.test("part 2", () => assertEquals(part2(text), 94116351948493))
