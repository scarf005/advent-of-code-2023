import { intersection } from "$set_operations/mod.ts"
import { parseNums } from "$utils/parse.ts"

export type Parsed = { left: number[]; right: number[] }

export const parse = (x: string): Parsed => {
	const [left, right] = x.split(": ")[1].split(" | ").map(parseNums)

	return { left, right }
}

export const wins = ({ left, right }: Parsed) => intersection(new Set(left), new Set(right)).size
