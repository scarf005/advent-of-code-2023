import { typedRegEx } from "$typed_regex/mod.ts"

export type Colors = Record<"red" | "green" | "blue", number>
export type Game = { id: number; rounds: Colors[] }

const gameRegex = typedRegEx("^Game (?<id>\\d+): (?<rest>.*)$")
const colorRegex = typedRegEx("(?<count>\\d+) (?<color>\\w+)")

export const emptySet: Colors = { red: 0, green: 0, blue: 0 }

const parseRound = (x: string): Colors => {
	const parsed = x
		.split(", ")
		.map((x) => colorRegex.captures(x)!)
		.map(({ count, color }) => [color, parseInt(count, 10)])

	return { ...emptySet, ...Object.fromEntries(parsed) }
}

export const parse = (x: string): Game => {
	const { id, rest } = gameRegex.captures(x)!
	const rounds = rest.split("; ").map(parseRound)

	return { id: parseInt(id, 10), rounds }
}

/** `a` >= `b` */
export const geq = (a: Colors, b: Colors): boolean =>
	a.red >= b.red && a.green >= b.green && a.blue >= b.blue

/** Merge two colors by taking the maximum of each RGB. */
export const max = (a: Colors, b: Colors): Colors => ({
	red: Math.max(a.red, b.red),
	green: Math.max(a.green, b.green),
	blue: Math.max(a.blue, b.blue),
})
