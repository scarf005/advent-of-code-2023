import { id } from "$utils/mod.ts"
import { countBy } from "$utils/count_by.ts"
import { Groups, handScore, HandType, ParseHand } from "./parse.ts"

const cardToScore = (x: string): number => {
	// deno-fmt-ignore
	switch (x) {
		case "A": return 14
		case "K": return 13
		case "Q": return 12
		case "T": return 10
		case "J": return 1 // Joker
		default: return +x
	}
}

const JOKER_SCORE = 1

export const parseType = (x: Groups): HandType => {
	const sorted = [...x.values()].sort()
	const jokers = x.get(JOKER_SCORE) ?? 0

	switch (x.size) {
		case 1:
			return "Five of a kind"
		case 2:
			// aaaaJ
			if (jokers > 0) return "Five of a kind"
			// aaaab
			return sorted[0] === 1 ? "Four of a kind" : "Full house"
		case 3: {
			// abJJJ or abbJJ
			if (jokers >= 2) return "Four of a kind"
			// abbbJ or aabbJ
			if (jokers === 1) return sorted[2] === 3 ? "Four of a kind" : "Full house"
			// abbcc or abccc
			return sorted[2] === 3 ? "Three of a kind" : "Two pair"
		}
		case 4:
			// abcJJ or abccJ
			return jokers > 0 ? "Three of a kind" : "One pair"
		case 5:
			// abcdJ
			return jokers > 0 ? "One pair" : "High card"
	}
	throw new Error("unreachable")
}

export const parseHand: ParseHand = (raw) => {
	const scores = raw.split("").map(cardToScore)
	const groups = countBy(scores, id)
	const strength = handScore(parseType(groups))

	return { raw, scores, groups, strength }
}
