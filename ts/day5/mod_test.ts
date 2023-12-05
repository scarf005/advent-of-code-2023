import { assertEquals } from "$std/assert/assert_equals.ts"
import { input } from "$utils/mod.ts"
import { example } from "./example_input.ts"
import { part1 } from "./mod.ts"

Deno.test("part 1 (example)", () => assertEquals(part1(example), 35))

const text = await input(import.meta)
Deno.test("part 1", () => assertEquals(part1(text), 84470622))
