/** Inclusive range of numbers */

export type Range = { l: number; r: number }
export type RangeMap = Range & { diff: number }

export type Mapping = {
	from: string
	to: string
	ranges: RangeMap[]
}

export type Parsed = {
	seeds: number[]
	maps: Mapping[]
}
