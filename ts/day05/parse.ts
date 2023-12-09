import { parseNums } from "$utils/parse.ts"
import { typedRegEx } from "$typed_regex/mod.ts"
import type { Mapping, Parsed, RangeMap } from "./types.ts"

const title = typedRegEx("(?<from>\\w+)-to-(?<to>\\w+)")

export const parseRangeMap = ([dest, src, len]: number[]): RangeMap => ({
	l: src,
	r: src + len - 1,
	diff: dest - src,
})

export const parseMap = (x: string): Mapping => {
	const [head, ...entry] = x.split("\n")
	const ranges = entry.map(parseNums).map(parseRangeMap)

	ranges.sort((a, b) => a.l - b.l)

	return { ...title.captures(head)!, ranges }
}

export const parse = (x: string): Parsed => {
	const [seeds, ...rest] = x.split("\n\n")

	return { seeds: parseNums(seeds), maps: rest.map(parseMap) }
}
