import { sum } from "$utils/mod.ts"
import { input } from "$utils/mod.ts"
import outdent from "$outdent/mod.ts"
import { cmp, parse } from "./parse.ts"
import { parseHand } from "./part1.ts"

const example = outdent`
    32T3K 765
    T55J5 684
    KK677 28
    KTJJT 220
    QQQJA 483
`

export const part1 = (x: string): number =>
	x
		.split("\n")
		.map(parse(parseHand))
		.toSorted((a, b) => cmp(a.hand, b.hand))
		.map(({ bid }, i) => bid * (i + 1))
		.reduce(sum)

const text = await input(import.meta)
console.log(part1(example))
console.log(part1(text))
