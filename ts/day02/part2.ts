import { mul, sum } from "$utils/mod.ts"
import { Game, max, parse } from "./color.ts"

export const power = (game: Game): number => {
	const minPossibleSet = game.rounds.reduce(max)

	return Object.values(minPossibleSet).reduce(mul)
}

export const part2 = (x: string): number =>
	x
		.split("\n").map(parse)
		.map(power).reduce(sum)
