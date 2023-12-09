import { distinctBy } from "$std/collections/distinct_by.ts"
import { sum } from "$utils/mod.ts"
import { isSym, parse, surrounding } from "./parse.ts"

export const part1 = (text: string): number => {
	const grid = parse(text)
	const nums = grid
		.flatMap((xs) => xs.filter(isSym))
		.flatMap((sym) => surrounding(grid, sym))

	return distinctBy(nums, ({ x, y }) => `${y}-${x}`)
		.map(({ val }) => +val).reduce(sum)
}
