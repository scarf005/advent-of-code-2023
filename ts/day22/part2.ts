import outdent from "$outdent/mod.ts"
import { typedRegEx } from "$typed_regex/mod.ts"
import { mapValues } from "$std/collections/map_values.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { filterEntries } from "$std/collections/filter_entries.ts"
import { input, sum } from "$utils/mod.ts"
import { difference } from "$set_operations/set_operations.ts"
import { zip } from "$std/collections/zip.ts"
import { c } from "$copb/mod.ts"

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
const graph = new Map(blocks
	.map((b) =>
		[b.id, {
			above: new Set(supports(blocks, b).map((x) => x.id)),
			below: new Set(supportedBy(blocks, b).map((x) => x.id)),
		}] as const
	))

// const directs = graph.map(({ id, above }) => [...above].map((to) => `b${id} -> b${to}`).join("\n")).join("\n")
// const directs = graph.map(({ id, below }) => [...below].map((from) => `b${id} -> b${from}`).join("\n")).join("\n")
// const dot = `digraph G {
// rankdir="BT"

// ${directs}
// }`
// await Deno.writeTextFile("graph.dot", dot)

// const cache = new Map<string, number>()
/**
 * an node's number of chain reaction is
 */
/**
 * drop b1260
 * -> drop b648
 * -> drop b1135, b814 (b472 is supported)
 * -> (b1016 is supported), drop b668, b237 (b1135 and b814 is already dropped, b858 is supported by b472 we failed to drop)
 */

// dropping b300 should result in 7

const chainReaction = (init: string) => {
	const dropped = new Set<string>([init])
	const stack = [...graph.get(init)!.above]
	while (stack.length) {
		const id = stack.shift()!

		const it = graph.get(id)!
		const diff = difference(it.below, dropped)

        // console.log({ id, stack, dropped })
		// console.log(diff)

		// is supported by other means
		if (diff.size > 0) continue

		// `it` will drop, also add chain reaction
		dropped.add(id)
		const aboves = it.above
		// console.log({ id, aboves })
		stack.push(...aboves)
	}
	return dropped.size - 1 // exclude itself
}

let ans = 0
graph.forEach((_, id) => {
    const cr = chainReaction(id)
    console.log({ id, cr })
    ans += cr
})
console.log(ans)
// console.log(chainReaction("1013"))
