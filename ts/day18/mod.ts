import { typedRegEx } from "$typed_regex/mod.ts"
import outdent from "$outdent/mod.ts"
import { input, Pos, sum } from "$utils/mod.ts"
type Dir = "U" | "D" | "L" | "R"
const re = typedRegEx("(?<dir>U|D|L|R) (?<amount>\\d+) \\((?<color>.+)\\)")
const parse = (x: string) => {
	const { dir, amount, color } = re.captures(x)!

	return { dir: dir as Dir, n: +amount, color }
}
const re2 = typedRegEx(". \\d+ \\(#(?<len>.{5})(?<dir>.)\\)")
const parse2 = (x: string) => {
	const { len, dir } = re2.captures(x)!

	return { n: parseInt(len, 16), dir: (["R", "D", "L", "U"] as const)[+dir] }
}

const example = outdent`
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

const actual = await input(import.meta)

const text = actual
const parsed = text.split("\n").map(parse2)
// const width = 16287761
// const height = 15143199
// const xss: ("#" | ".")[][] = Array.from(
// 	{ length: height },
// 	() => Array.from({ length: width }, () => "."),
// )

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

// const print = () => console.log(xss.map((xs) => xs.join("")).join("\n"))

let len = 2
const points = parsed.reduce(
	(acc, { dir, n }) => {
		len += n
		acc.push(next(acc.at(-1)!, n, dir))
		return acc
	},
	[{ y: 0, x: 0 }],
)
points.shift()
console.log(points)

// def calculate_area(points):
//     N = len(points)
//     area = 0

//     for i in range(N):
//         j = (i + 1) % N  # Ensures that after the last point, it loops back to the first
//         area += points[i][1] * points[j][0] - points[i][0] * points[j][1]

//     return abs(area) / 2
const area = (xs: Pos[]) => {
	const N = xs.length
	let area = 0

	for (let i = 0; i < N; i++) {
		const j = (i + 1) % N
		area += xs[i].y * xs[j].x - xs[i].x * xs[j].y
	}

	return Math.abs(area) / 2
}
const expected = 952408144115
const answer = len / 2 + area(points)
console.log({ expected, answer }, expected - answer)
