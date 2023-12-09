import { sum } from "$utils/mod.ts"
import { parse, wins } from "./parse.ts"

const score = (x: number): number => x === 0 ? 0 : (2 ** (x - 1))

export const part1 = (text: string): number =>
	text.split("\n").map(parse).map(wins).map(score).reduce(sum)
