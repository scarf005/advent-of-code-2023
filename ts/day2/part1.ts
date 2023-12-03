import { sum } from "$utils/mod.ts"
import { Colors, Game, geq, max, parse } from "./color.ts"

export const exampleSet: Colors = { red: 12, green: 13, blue: 14 }

const isGamePossible = (game: Game): boolean => geq(exampleSet, game.rounds.reduce(max))

export const part1 = (x: string): number =>
	x
		.split("\n").map(parse).filter(isGamePossible)
		.map(({ id }) => id).reduce(sum)
