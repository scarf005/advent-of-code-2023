import { zip } from "$std/collections/zip.ts"

export type HandType =
	| "Five of a kind" // 1 kind
	| "Four of a kind" // 2 kind
	| "Full house" // 2 kind
	| "Three of a kind" // 3 kind
	| "Two pair" // 3 kind
	| "One pair" // 4 kind
	| "High card" // 5 kind

export type Groups = Map<number, number>

export type Hand = {
	raw: string
	scores: number[]
	groups: Groups
	strength: number
}

export type Play = {
	hand: Hand
	bid: number
}

export const handScore = (x: HandType): number => {
	// deno-fmt-ignore
	switch (x) {
        case "Five of a kind": return 6
        case "Four of a kind": return 5
        case "Full house": return 4
        case "Three of a kind": return 3
        case "Two pair": return 2
        case "One pair": return 1
        case "High card": return 0
    }
}

export const cmp = (a: Hand, b: Hand): number => {
	const strength = a.strength - b.strength

	if (strength !== 0) return strength

	for (const [l, r] of zip(a.scores, b.scores)) {
		if (l !== r) return l - r
	}

	return 0
}

export type ParseHand = (raw: string) => Hand

export const parse = (parseHand: ParseHand) => (x: string): Play => {
	const [hand, bid] = x.split(" ")
	return { hand: parseHand(hand), bid: +bid }
}
