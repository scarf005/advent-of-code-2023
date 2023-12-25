import { Pos } from "$utils/mod.ts"

/**
 * Calculates the area of a polygon using the shoelace formula.
 *
 * the input must be clockwise or counterclockwise.
 */
export const shoelaceArea = (xs: Pos[]) => {
	const N = xs.length
	let area = 0

	for (let i = 0; i < N; i++) {
		const j = (i + 1) % N
		area += xs[i].y * xs[j].x - xs[i].x * xs[j].y
	}

	return Math.abs(area) / 2
}
