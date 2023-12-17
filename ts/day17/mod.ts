import outdent from "$outdent/mod.ts"
import { id, input, Pos } from "$utils/mod.ts"
import {
	bgBrightBlack,
	bgBrightRed,
	bgCyan,
	bgGreen,
	bgMagenta,
	bgRed,
	bgWhite,
	bgYellow,
	black,
	brightBlack,
	dim,
	red,
	yellow,
} from "$std/fmt/colors.ts"
import { Grid } from "../day11/mod.ts"

const parse = (s: string) => s.split("\n").map((sx) => sx.split("").map((x) => +x))
const display = (xss: Grid<number>) =>
	xss.map((xs) => xs.map((x) => (x === 0 ? "." : x)).join("")).join("\n")

const big = outdent`
2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533
`
const small = outdent`
2413432311
3215453535
`
//  2413432311
//  3215453535
//  2>>34^>>>
//  32v>>>35v

// const actual = await input(import.meta)
const text = small

const xss = parse(text)
// heat loss score map
const INIT = 0
const LOSS = 10000000
type Dir = "up" | "down" | "left" | "right"
type MapKey = { dir: Dir; steps: number }
type State = Map<string, number>
const yss: State[][] = Array.from(
	{ length: xss.length },
	() =>
		Array.from(
			{ length: xss[0].length },
			() =>
				// new Map([
				// 	[JSON.stringify({ dir: "right", steps: INIT }), LOSS],
				// 	[JSON.stringify({ dir: "left", steps: INIT }), LOSS],
				// 	[JSON.stringify({ dir: "up", steps: INIT }), LOSS],
				// 	[JSON.stringify({ dir: "down", steps: INIT }), LOSS],
				// ]),
				new Map([]),
		),
)

const inBounds = ({ y, x }: Pos) => 0 <= y && y < xss.length && 0 <= x && x < xss[0].length

// yss[0][0] = new Map([[{ dir: "begin", steps: 0 }, 0]])
yss[0][0] = new Map([])
yss[yss.length - 1][yss[0].length - 1] = new Map([])
yss[0][1].set(JSON.stringify({ dir: "right", steps: 1 }), xss[0][1])
yss[1][0].set(JSON.stringify({ dir: "down", steps: 1 }), xss[1][0])
const posAdd = ({ y: y1, x: x1 }: Pos) => ({ y: y2, x: x2 }: Pos) => ({ y: y1 + y2, x: x1 + x2 })
const dirToPos = {
	up: { y: -1, x: 0 },
	down: { y: 1, x: 0 },
	left: { y: 0, x: -1 },
	right: { y: 0, x: 1 },
} as const

const candidates = (d: Dir): Dir[] => {
	switch (d) {
		case "up":
			return ["up", "left", "right"]
		case "down":
			return ["down", "left", "right"]
		case "left":
			return ["left", "up", "down"]
		case "right":
			return ["right", "up", "down"]
	}
}

yss.forEach((ys, j) => {
	ys.forEach((states, i) => {
		for (const [raw, loss] of states.entries()) {
			const state = JSON.parse(raw) as MapKey

			// if (i >= 5) {
			console.log(JSON.stringify({ j, i, state, lossHere: xss[j][i], loss }))
			// }

			const zs = candidates(state.dir)
				.filter((dir) => state.steps === 3 ? dir !== state.dir : true)
				.map((dir) => ({ dir, pos: posAdd(dirToPos[dir])({ y: j, x: i }) }))
				.filter((z) => inBounds(z.pos))

			for (const { dir, pos: { y, x } } of zs) {
				const nextStep = dir === state.dir ? state.steps + 1 : 1
				const nextState = { dir, steps: nextStep }

				console.log("\t", { ...nextState, y, x })
				const nextLoss = xss[y][x]
				const newLoss = yss[y][x].get(JSON.stringify(nextState)) ?? LOSS
				yss[y][x].set(
					JSON.stringify(nextState),
					Math.min(loss + nextLoss, newLoss),
				)
			}
		}
	})
})

console.log(
	yss.map(
		(ys, j) =>
			ys
				.map((y, i) => {
					const zs = [...y.entries()]
					const min = Math.min(...y.values())
					const z = zs.find((z) => z[1] === min)!
					if (!z) return "......"
					const { steps, dir } = JSON.parse(z[0]) as MapKey

					const d = dir === "up" ? "↑" : dir === "down" ? "↓" : dir === "left" ? "←" : "→"
					const stepColor = steps === 0
						? brightBlack
						: steps === 1
						? bgGreen
						: steps === 2
						? bgYellow
						: bgBrightRed
					const lossHere = xss[j][i]

					// return `${min}`.padStart(4)
					return stepColor(d + ` ${steps}|${min}`.padEnd(5))
					// return `${lossHere}${state.steps}`
					// return { min, z }
				})
				// .map((x) => x === LOSS ? " . " : `${x}`.padStart(3))
				// .map((x, i) => `${bgCyan(`${xss[j][i]}`)}${bgMagenta(x)}`)
				.join(" "),
	).join("\n"),
)
console.log(yss.at(-1)!.at(-1)!)
