import { sum } from "$utils/mod.ts"
import { input } from "$utils/mod.ts"
import outdent from "$outdent/mod.ts"
import { cmp, parse, type ParseHand } from "./parse.ts"
import * as p1 from "./part1.ts"
import * as p2 from "./part2.ts"

const example = outdent`
    32T3K 765
    T55J5 684
    KK677 28
    KTJJT 220
    QQQJA 483
`

const solve = (parseHand: ParseHand) => (x: string): number =>
	x
		.split("\n")
		.map(parse(parseHand))
		.toSorted((a, b) => cmp(a.hand, b.hand))
		.map(({ bid }, i) => bid * (i + 1))
		.reduce(sum)

export const part1 = solve(p1.parseHand)
export const part2 = solve(p2.parseHand)

if (import.meta.main) {
	console.log(part1(example))
	console.log(part2(example))

	const text = await input(import.meta)
	console.log(part1(text))
	console.log(part2(text))
}
