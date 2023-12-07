import { id } from "$utils/mod.ts"
import { countBy } from "$utils/count_by.ts"
import { Groups, handScore, HandType, ParseHand } from "./parse.ts"

const cardToScore = (x: string): number => {
	// deno-fmt-ignore
	switch (x) {
		case "A": return 14
		case "K": return 13
		case "Q": return 12
		case "J": return 11
		case "T": return 10
		default: return +x
	}
}
export const parseType = (x: Groups): HandType => {
	const sorted = [...x.values()].sort()

	// deno-fmt-ignore
	switch (x.size) {
		case 1: return "Five of a kind"
		case 2: return sorted[0] === 1 ? "Four of a kind" : "Full house"
		case 3: return sorted[2] === 3 ? "Three of a kind" : "Two pair"
		case 4: return "One pair"
		case 5: return "High card"
	}
	throw new Error("unreachable")
}
export const parseHand: ParseHand = (raw) => {
	const scores = raw.split("").map(cardToScore)
	const groups = countBy(scores, id)
	const strength = handScore(parseType(groups))

	return { raw, scores, groups, strength }
}
