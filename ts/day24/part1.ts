import type { Pos } from "$utils/mod.ts"
import { combinations } from "https://deno.land/x/combinatorics@1.1.2/mod.ts"
import { countIf } from "$utils/count_by.ts"
import { actual, Data, parse } from "./mod.ts"

type Equation = { slope: number; yIntercept: number; xConstraint: ">=" | "<="; by: number }

const toEquation = ({ px, vx, py, vy }: Data): Equation => {
	const slope = vy / vx
	const xConstraint = vx >= 0 ? ">=" : "<="

	return { slope, yIntercept: py - slope * px, xConstraint, by: px }
}

type SolveResult =
	| { type: "parallels" }
	| { type: "intersects"; pos: Pos }
	| { type: "outOfXYBounds"; pos: Pos }
	| { type: "outOfTimeBounds"; pos: Pos }

export type V2<T = number> = { x: T; y: T }

type Range = { min: number; max: number }
const mkInBounds = ({ y, x }: V2<Range>) => (pos: Pos): boolean =>
	y.min <= pos.y && pos.y <= y.max && x.min <= pos.x && pos.x <= x.max

type Option = {
	inBounds: (pos: V2) => boolean
}

const mkIntersection = ({ inBounds }: Option) => (a: Equation, b: Equation): SolveResult => {
	// check if it's parallel first
	if (a.slope === b.slope) return { type: "parallels" }

	// find the intersection point
	const x = (b.yIntercept - a.yIntercept) / (a.slope - b.slope)
	const y = a.slope * x + a.yIntercept
	const pos = { x, y }

	// check if it's in bounds
	if (!inBounds(pos)) return { type: "outOfXYBounds", pos }

	// check if it's in time bounds
	if (
		a.xConstraint === ">=" && x < a.by ||
		a.xConstraint === "<=" && x > a.by ||
		b.xConstraint === ">=" && x < b.by ||
		b.xConstraint === "<=" && x > b.by
	) return { type: "outOfTimeBounds", pos }

	return { type: "intersects", pos }
}

if (import.meta.main) {
	const min = 200000000000000
	const max = 400000000000000

	const parsed = parse(actual)

	const inBounds = mkInBounds({ y: { min, max }, x: { min, max } })
	const intersection = mkIntersection({ inBounds })

	const result = [...combinations(parsed.map(toEquation), 2)]
		.map(([a, b]) => intersection(a, b))
		.reduce(countIf((x) => x.type === "intersects"), 0)

	console.log(result)
}
