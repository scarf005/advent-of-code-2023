import { sum } from "$utils/mod.ts"
import { type Num, parse, surrounding, type Sym } from "./parse.ts"

const isGear = (x: Num | Sym): x is Sym => x.type === "sym" && x.val === "*"
const isValidGear = (xs: Num[]): xs is [Num, Num] => xs.length === 2
const gearRatio = ([a, b]: [Num, Num]): number => +a.val * +b.val

export const part2 = (text: string): number => {
	const grid = parse(text)
	const result = grid
		.flatMap((xs) => xs.filter(isGear))
		.map((sym) => surrounding(grid, sym))
		.filter(isValidGear)
		.map(gearRatio)
		.reduce(sum)

	return result
}
