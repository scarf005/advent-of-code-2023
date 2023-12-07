// deno-lint-ignore no-explicit-any
export const countBy = <K extends keyof any, V>(xs: V[], f: (x: V) => K): Map<K, number> => {
	const counts = new Map<K, number>()
	for (const x of xs) {
		const key = f(x)
		const count = counts.get(key) ?? 0
		counts.set(key, count + 1)
	}
	return counts
}
