import outdent from "$outdent/mod.ts"
import { input, Pos } from "$utils/mod.ts"
import { zip } from "$std/collections/zip.ts"
import {
	bgBrightCyan,
	bgBrightYellow,
	bgRgb24,
	bgWhite,
	bold,
	brightRed,
	brightYellow,
	dim,
	reset,
	rgb8,
	stripAnsiCode,
	underline,
	yellow,
} from "$std/fmt/colors.ts"

const example = outdent`
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....
`
// const text = await input(import.meta)
const text = example

const ass = example.split("\n").map((x) => x.split(""))

// clone given grid but only has ' ' or '#' in it
const bss = Array.from(
	{ length: ass.length },
	() => Array.from({ length: ass[0].length }, () => "."),
)
type VerticalSplitter = "|" | "\\" | "/"
type Dir = "up" | "down" | "left" | "right"
type State = { dir: Dir; pos: Pos }

// 1. find first index of `|` or `\` or `/`
// 2. paint all path with `#`
// 3. if it's `|`: spawn two new states with `up` and `down`
// 4. if it's `\`: spawn one new state with `down`
// 5. if it's `/`: spawn one new state with `up`
const isVerticalSplitter = (a: string) => (a === "|" || a === "\\" || a === "/")
const isHorizontalSplitter = (a: string) => (a === "-" || a === "\\" || a === "/")

const paintHorizontal = (y: number, begin: number, end: number) => {
	for (let i = begin; i < end; i++) {
		bss[y][i] = "#"
	}
}
const paintVertical = (x: number, begin: number, end: number) => {
	for (let i = begin; i < end; i++) {
		bss[i][x] = "#"
	}
}
const visited = ({ y, x }: Pos) => bss[y][x] !== "."

const verticalState = (kind: string, from: "left" | "right", pos: Pos): State[] => {
	switch (kind) {
		case "|":
			return [{ dir: "up", pos }, { dir: "down", pos }]
		case "/":
			return [{ dir: from === "left" ? "up" : "down", pos }]
		case "\\":
			return [{ dir: from === "left" ? "down" : "up", pos }]
	}
	throw new Error("Unreachable")
}

const horizontalState = (kind: string, from: "up" | "down", pos: Pos): State[] => {
	switch (kind) {
		case "-":
			return [{ dir: "left", pos }, { dir: "right", pos }]
		case "/":
			return [{ dir: from === "up" ? "left" : "right", pos }]
		case "\\":
			return [{ dir: from === "up" ? "right" : "left", pos }]
	}
	throw new Error("Unreachable")
}

const moveRight = ({ y, x }: Pos): State[] => {
	if (x === ass[y].length - 1) return []

	const zs = ass[y].slice(x + 1)

	const diff = zs.findIndex(isVerticalSplitter)
	if (diff === -1) {
		paintHorizontal(y, x, ass[y].length)
		return []
	}
	const at = x + diff + 1
	const pos = { y, x: at }
	if (visited(pos)) return []

	const next = verticalState(ass[y][at], "left", pos)
	paintHorizontal(y, x, at + 1)
	return next
}

const moveLeft = ({ y, x }: Pos): State[] => {
	if (x === 0) return []

	const zs = ass[y].slice(0, x)

	const at = zs.findLastIndex(isVerticalSplitter)
	if (at === -1) {
		paintHorizontal(y, 0, x + 1)
		return []
	}

	const pos = { y, x: at }
	if (visited(pos)) return []

	const next = verticalState(ass[y][at], "right", pos)
	paintHorizontal(y, at, x + 1)
	return next
}

const moveDown = ({ y, x }: Pos): State[] => {
	if (y === ass.length - 1) return []

	const zs = ass.slice(y + 1).map((as) => as[x])

	const diff = zs.findIndex(isHorizontalSplitter)

	if (diff === -1) {
		paintVertical(x, y, ass.length)
		return []
	}
	// console.log(ass.slice(y + 1).map((as) => as[x]).join(""))

	const at = y + diff + 1
	// console.log({ y, x, diff, at }, ass.slice(y + 1).map((as) => as[x]).join(""))

	const pos = { y: at, x }
	if (visited(pos)) return []

	const next = horizontalState(ass[at][x], "up", pos)
	paintVertical(x, y, at + 1)
	return next
}

const moveUp = ({ y, x }: Pos): State[] => {
	if (y === 0) return []

	const zs = ass.slice(0, y).map((as) => as[x])
	if (zs.every((_, y) => visited({ y, x }))) return []

	const at = zs.findLastIndex(isHorizontalSplitter)
	// console.log({ at, x, y }, ass.slice(0, y).map((as) => as[x]))
	if (at === -1) {
		paintVertical(x, 0, y)
		return []
	}

	const pos = { y: at, x }
	if (visited(pos)) return []

	const next = horizontalState(ass[at][x], "down", pos)
	paintVertical(x, at, y)
	return next
}

const move = ({ dir, pos }: State) => {
	switch (dir) {
		case "up":
			return moveUp(pos)
		case "down":
			return moveDown(pos)
		case "left":
			return moveLeft(pos)
		case "right":
			return moveRight(pos)
	}
}
// console.log(ass.map((as) => as.join("")).join("\n"), "\n")

const stack: State[] = [{ pos: { y: 0, x: 0 }, dir: "right" }]

let iteration = 0
const display = (pos?: Pos) => {
	iteration += 8
	const result = zip(ass, bss)
		.map(([as, bs], i) =>
			zip(as, bs).map(([a, b], j) => {
				const char = a === "." ? dim(a) : bold(a)
				const colored = b === "." ? char : bgRgb24(char, { r: 256 / i, g: 256 / j, b: 200 })
				return (pos?.y === i && pos?.x === j)
					? bgBrightYellow(brightRed(bold(stripAnsiCode(colored))))
					: stack.some(({ pos }) => pos.y === i && pos.x === j)
					? bgBrightCyan(brightYellow(bold(stripAnsiCode(colored))))
					: colored
			})
				.join("")
		)
		.join("\n")

	console.log(result)
}

let iter = 0
while (stack.length) {
	iter++
	const state = stack.pop()!
	console.log(`iter: ${iter}`)
	display(state.pos)
	console.log(state, "\n", stack.toReversed())
	console.log("\n")
	stack.push(...move(state))
}

display()
// console.log(move({ dir: "up", pos: { y: 6, x: 2 } }))
console.log(bss.map((bs) => bs.join("")).join("\n"))
console.log("energized:", bss.flat().filter((b) => b === "#").length)
