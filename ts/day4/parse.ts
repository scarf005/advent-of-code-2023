import { intersection } from "$set_operations/mod.ts"

export type Parsed = { left: number[]; right: number[] }

const digit = /(\d+)/g

const parseNums = (x: string): number[] => [...x.matchAll(digit)].map((x) => +x[0])
export const parse = (x: string): Parsed => {
	const [left, right] = x.split(": ")[1].split(" | ").map(parseNums)

	return { left, right }
}

export const wins = ({ left, right }: Parsed) => intersection(new Set(left), new Set(right)).size
