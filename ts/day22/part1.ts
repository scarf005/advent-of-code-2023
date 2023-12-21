import outdent from "$outdent/mod.ts"
import { typedRegEx } from "$typed_regex/mod.ts"
import { mapValues } from "$std/collections/map_values.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { filterEntries } from "$std/collections/filter_entries.ts"
import { input } from "$utils/mod.ts"

const ex = outdent`
1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9
`

const re = typedRegEx("(?<x1>\\d+),(?<y1>\\d+),(?<z1>\\d+)~(?<x2>\\d+),(?<y2>\\d+),(?<z2>\\d+)")

const parse = (x: string) =>
	x
		.split("\n")
		.map((x, id) => ({ id: `${id}`, ...mapValues(re.captures(x)!, (v) => +v) }) as Block)
		.sort((a, b) => a.z1 - b.z1)

type Block = { id: string } & Record<"x1" | "y1" | "z1" | "x2" | "y2" | "z2", number>

const fall1 = ({ z1, z2, ...rest }: Block): Block => ({ z1: z1 - 1, z2: z2 - 1, ...rest })
const up1 = ({ z1, z2, ...rest }: Block): Block => ({ z1: z1 + 1, z2: z2 + 1, ...rest })

// asserts that x and y plane overlaps
const overlaps = (a: Block, b: Block) => {
	return a.x1 <= b.x2 && a.x2 >= b.x1 && a.y1 <= b.y2 && a.y2 >= b.y1
}

Deno.test("overlaps", () => {
	const blocks = parse(ex)
	fallAll(blocks)
	const [a, b, c, d, e, f, g] = blocks

	// Brick A is the only brick supporting bricks B and C.
	assertEquals(overlaps(a, fall1(b)), true)
	assertEquals(overlaps(a, fall1(c)), true)
	assertEquals(overlaps(a, fall1(d)), false)
	// Brick B is one of two bricks supporting brick D and brick E.
	assertEquals(overlaps(b, fall1(d)), true)
	assertEquals(overlaps(b, fall1(e)), true)
	assertEquals(overlaps(b, fall1(f)), false)
	// Brick C is the other brick supporting brick D and brick E.
	assertEquals(overlaps(c, fall1(d)), true)
	assertEquals(overlaps(c, fall1(e)), true)
	// Brick D supports brick F.
	assertEquals(overlaps(d, fall1(f)), true)
	// Brick E also supports brick F.
	assertEquals(overlaps(e, fall1(f)), true)
	// Brick F supports brick G.
	assertEquals(overlaps(f, fall1(g)), true)
	// Brick G isn't supporting any bricks.
	// assertEquals(overlaps(g, a), false)
})

const supportedBy = (bs: Block[], target: Block): Block[] => {
	const fell = fall1(target)
	const belows = bs.filter((b) => b.z2 == fell.z1)
	const supports = belows.filter((b) => overlaps(b, fell))
	return supports
}

const supports = (bs: Block[], target: Block): Block[] => {
	const up = up1(target)
	const aboves = bs.filter((b) => b.z1 == up.z2)
	const supported = aboves.filter((b) => overlaps(b, up))
	return supported
}

const isSupported = (bs: Block[], target: Block): boolean => {
	if (target.z1 === 1) return true

	return supportedBy(bs, target).length > 0
}

const fallAll = (bs: Block[]): Block[] => {
	while (true) {
		let falls = 0
		for (const b of bs) {
			// console.log(bs)
			if (!isSupported(bs, b)) {
				falls++
				b.z1--
				b.z2--
			}
		}
		if (falls === 0) break
	}
	return bs
}
const actual = await input(import.meta)
const text = actual
const blocks = parse(text)
// console.log(parsed)
fallAll(blocks)

const group = Object.fromEntries(blocks
	.map((b) =>
		[b.id, {
			above: supports(blocks, b).map((x) => x.id),
			below: supportedBy(blocks, b).map((x) => x.id),
		}] as const
	))

const oks = filterEntries(group, ([id, { above, below }]) => {
	if (above.length === 0) return true

	const sup = above.map((above) => group[above].below)
    const okToNotSupport = sup.every(x => x.length > 1)
	// console.log({ id, sup })
    return okToNotSupport
	// return false
})
console.log(group)
console.log(Object.keys(oks).length)
// .filter(({ below, above}, i) => {
//  if first and no above
// if last and no below
//
//     return above === 0
// }),

// console.log(isSupported(parsed)(parsed[2]))
