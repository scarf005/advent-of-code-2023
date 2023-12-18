import { typedRegEx } from "$typed_regex/mod.ts"
import outdent from "$outdent/mod.ts"
import { input, Pos, sum } from "$utils/mod.ts"
type Dir = "U" | "D" | "L" | "R"
const re = typedRegEx("(?<dir>U|D|L|R) (?<amount>\\d+) \\((?<color>.+)\\)")

const parse = (x: string) => {
	const { dir, amount, color } = re.captures(x)!

	return { dir: dir as Dir, n: +amount, color }
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
const parsed = text.split("\n").map(parse)
const width = 510
const height = 380
const xss: ("#" | ".")[][] = Array.from(
	{ length: height },
	() => Array.from({ length: width }, () => "."),
)

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

const print = () => console.log(xss.map((xs) => xs.join("")).join("\n"))

let here: Pos = { y: 240, x: 120 }
let minX = 0
let maxX = 0
let minY = 0
let maxY = 0
for (const { dir, n, color } of parsed) {
	const nextPos = next(here, n, dir)
	// paint '.' to '#' from here to nextPos'

	switch (dir) {
		case "U":
			{
				for (let y = here.y; y > nextPos.y; y--) {
					xss[y][here.x] = "#"
				}
			}
			break
		case "D":
			{
				for (let y = here.y; y < nextPos.y; y++) {
					xss[y][here.x] = "#"
				}
			}
			break
		case "L":
			{
				for (let x = here.x; x > nextPos.x; x--) {
					xss[here.y][x] = "#"
				}
			}
			break
		case "R": {
			for (let x = here.x; x < nextPos.x; x++) {
				xss[here.y][x] = "#"
			}
		}
	}

	// console.log({ dir, n, here, nextPos })
	// const end = posAdd(begin, dir, n)
	// console.log({ dir, n, color, here, nextPos })
	maxX = Math.max(maxX, nextPos.x)
	maxY = Math.max(maxY, nextPos.y)
	minX = Math.min(minX, nextPos.x)
	minY = Math.min(minY, nextPos.y)
	here = nextPos
}

print()

// floodfill
const floodfill = () => {
	const stack: Pos[] = [{ y: 200, x: 200 }]
	// [{ y: Math.floor(size / 2), x: Math.floor(size / 2) }]
	while (stack.length) {
		const { y, x } = stack.pop()!
		xss[y][x] = "#"

		// if has up, push stack up
		if (y > 0 && xss[y - 1][x] === ".") {
			stack.push({ y: y - 1, x })
		}
		if (y < height - 1 && xss[y + 1][x] === ".") {
			stack.push({ y: y + 1, x })
		}
		if (x > 0 && xss[y][x - 1] === ".") {
			stack.push({ y, x: x - 1 })
		}
		if (x < width - 1 && xss[y][x + 1] === ".") {
			stack.push({ y, x: x + 1 })
		}
	}
}
floodfill()
print()

const filled = xss.map((xs) => xs.filter((x) => x === "#").length).reduce(sum)
console.log({ filled })
console.log({ minX, maxX, minY, maxY })
