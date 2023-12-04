import { sum } from "$utils/mod.ts"
import { parse, wins } from "./parse.ts"

/**
 * scores: [4, 2, 2, 1, 0, 0]
 *
 * accumulated cards, step-by-step:
 * ```
 * [1, 1, 1, 1,  1, 1]
 * [1, 2, 2, 2,  2, 1]
 * [1, 2, 4, 4,  2, 1]
 * [1, 2, 4, 8,  6, 1]
 * [1, 2, 4, 8, 14, 1]
 * ```
 *
 * total score: 1 + 2 + 4 + 8 + 14 + 1 = 30
 */
export const part2 = (text: string): number => {
	const scores = text.split("\n").map(parse).map(wins)
	const cards = new Array<number>(scores.length).fill(1)

	cards.forEach((stacks, i) =>
		Array
			.from({ length: scores[i] }, (_, j) => i + j + 1)
			.forEach((x) => cards[x] += stacks)
	)

	return cards.reduce(sum)
}
