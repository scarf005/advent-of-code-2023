import { Pos } from "$utils/mod.ts"

export const shoelaceArea = (xs: Pos[]) => {
	const N = xs.length
	let area = 0

	for (let i = 0; i < N; i++) {
		const j = (i + 1) % N
		area += xs[i].y * xs[j].x - xs[i].x * xs[j].y
	}

	return Math.abs(area) / 2
}
