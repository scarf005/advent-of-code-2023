import { assertEquals } from "$std/assert/assert_equals.ts"
import { input, sum } from "$utils/mod.ts"
import { cached } from "$utils/cache.ts"

type Groups = readonly number[]
type Spring = [line: string, groups: readonly number[]]

export const parse = (x: string): Spring => {
	const [line, group] = x.split(" ")

	return [line, group.split(",").map(Number)] as const
}

const ways = cached((line: string, groups: Groups): number => {
	if (line.length === 0) return groups.length === 0 ? 1 : 0
	if (groups.length === 0) return line.includes("#") ? 0 : 1
	if (line.length < groups.reduce(sum) + groups.length - 1) return 0

	if (line[0] === ".") return ways(line.slice(1), groups)
	if (line[0] === "#") {
		const [group, ...rest] = groups

		if (line.slice(1, group).includes(".")) return 0
		if (line[group] === "#") return 0

		return ways(line.slice(group + 1), rest)
	}

	return ways("#" + line.slice(1), groups) + ways("." + line.slice(1), groups)
})

Deno.test("ways", () => {
	assertEquals(ways("???.###", [1, 1, 3]), 1)
	assertEquals(ways(".??..??...?##.", [1, 1, 3]), 4)
	assertEquals(ways("?#?#?#?#?#?#?#?", [1, 3, 1, 6]), 1)
	assertEquals(ways("????.#...#...", [4, 1, 1]), 1)
	assertEquals(ways("????.######..#####.", [1, 6, 5]), 4)
	assertEquals(ways("?###????????", [3, 2, 1]), 10)
})

const nfold = (n: number) => <T>(x: T): T[] => Array.from({ length: n }, () => x)
const fiveFold = nfold(5)

const unfold = (line: string, groups: Groups): Spring => [
	fiveFold(line).join("?"),
	fiveFold(groups).flat(),
]

Deno.test("unfold", () => {
	assertEquals(unfold(".#", [1]), [".#?.#?.#?.#?.#", [1, 1, 1, 1, 1]])
	assertEquals(unfold("???.###", [1, 1, 3]), [
		"???.###????.###????.###????.###????.###",
		[1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3],
	])
})

const part1 = (xs: Spring[]): number => xs.map(([a, b]) => ways(a, b)).reduce(sum)
const part2 = (xs: Spring[]): number => xs.map(([a, b]) => ways(...unfold(a, b))).reduce(sum)

if (import.meta.main) {
	const text = await input(import.meta)
	const xs = text.split("\n").map(parse)

	console.log(part1(xs))
	console.log(part2(xs))
}
