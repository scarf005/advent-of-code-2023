import { parse } from "./parse.ts"
import type { Mapping, Range, RangeMap } from "./types.ts"

const inRange = ({ l, r }: Range, x: number) => l <= x && x <= r

/**
 * @example
 * ```ts
 * mapNum({ l: 1, r: 3, diff: 100 })(1) //=> 101
 * ```
 */
const mapNum = (x: RangeMap) => (y: number) => inRange(x, y) ? y + x.diff : y

const findMapNum = (x: number, m: Mapping): number => {
	const range = m.ranges.find((r) => inRange(r, x))

	return range ? mapNum(range)(x) : x
}

export const part1 = (x: string): number => {
	const { seeds, maps } = parse(x)

	const result = seeds.map((seed) => maps.reduce(findMapNum, seed))

	return Math.min(...result)
}
