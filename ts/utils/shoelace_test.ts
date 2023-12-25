import { assertEquals } from "$std/assert/assert_equals.ts"
import { shoelaceArea } from "./shoelace.ts"

const xs = [
	{ y: 0, x: 0 },
	{ y: 0, x: 6 },
	{ y: 5, x: 6 },
	{ y: 5, x: 4 },
	{ y: 7, x: 4 },
	{ y: 7, x: 6 },
	{ y: 9, x: 6 },
	{ y: 9, x: 1 },
	{ y: 7, x: 1 },
	{ y: 7, x: 0 },
	{ y: 5, x: 0 },
	{ y: 5, x: 2 },
	{ y: 2, x: 2 },
	{ y: 2, x: 0 },
	{ y: 0, x: 0 },
]

Deno.test("shoelaceArea", () => assertEquals(shoelaceArea(xs), 42))
