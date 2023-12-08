import { assertEquals } from "$std/assert/assert_equals.ts"
import { parse } from "./parse.ts"
import { example } from "./example_input.ts"
import expected from "./example_parsed.json" with { type: "json" }

Deno.test("parse", () => assertEquals(parse(example), expected))
