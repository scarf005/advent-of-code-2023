import { typedRegEx } from "$typed_regex/mod.ts"
import outdent from "$outdent/mod.ts"
import { Pos } from "$utils/mod.ts"
import { shoelaceArea } from "../utils/shoelace.ts"
type Dir = "U" | "D" | "L" | "R"
type Data = { n: number; dir: Dir }

const re = typedRegEx("(?<dir>U|D|L|R) (?<amount>\\d+) \\((?<color>.+)\\)")

const parse1 = (x: string): Data => {
	const { dir, amount } = re.captures(x)!

	return { n: +amount, dir: dir as Dir }
}

const re2 = typedRegEx(". \\d+ \\(#(?<len>.{5})(?<dir>.)\\)")

const parse2 = (x: string): Data => {
	const { len, dir } = re2.captures(x)!

	return { n: parseInt(len, 16), dir: (["R", "D", "L", "U"] as const)[+dir] }
}

const next = ({ y, x }: Pos, n: number, dir: Dir) => {
	switch (dir) {
		case "U":
			return { y: y - n, x }
		case "D":
			return { y: y + n, x }
		case "L":
			return { y, x: x - n }
		case "R":
			return { y, x: x + n }
	}
}

const points = (xs: Data[]) => {
	let len = 2
	const ys = xs.reduce(
		(acc, { dir, n }) => {
			len += n
			acc.push(next(acc.at(-1)!, n, dir))
			return acc
		},
		[{ y: 0, x: 0 }],
	)
	return { ys, len }
}

const solve = (parse: (x: string) => Data) => (x: string) => {
	const xs = x.split("\n").map(parse)
	const { ys, len } = points(xs)
	console.log({ ys, area: shoelaceArea(ys) })
	return len / 2 + shoelaceArea(ys)
}
export const part1 = solve(parse1)
export const part2 = solve(parse2)

if (import.meta.main) {
	const ex = outdent`
        R 6 (#70c710)
        D 5 (#0dc571)
        L 2 (#5713f0)
        D 2 (#d2c081)
        R 2 (#59c680)
        D 2 (#411b91)
        L 5 (#8ceee2)
        U 2 (#caa173)
        L 1 (#1b58a2)
        U 2 (#caa171)
        R 2 (#7807d2)
        U 3 (#a77fa3)
        L 2 (#015232)
        U 2 (#7a21e3)
    `
	// const actual = await input(import.meta)
	const text = ex

	console.log(part1(text))
	console.log(part2(text))
}
