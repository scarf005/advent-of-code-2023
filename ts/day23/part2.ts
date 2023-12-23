import { display, ex, mkGet, mkInBounds, parse, posEq, Tile } from "./mod.ts"
import { Grid, wh } from "$utils/grid.ts"
import { HashSet } from "$rimbu/hashed/mod.ts"
import { EdgeValuedGraphHashed } from "$rimbu/graph/mod.ts"
import { bgBrightRed, bgRgb24, bold, rgb24 } from "$std/fmt/colors.ts"
import outdent from "$outdent/mod.ts"

class Pos {
	constructor(readonly y: number, readonly x: number) {}
	toString() {
		return `{y:${this.y},x:${this.x}}`
	}
	static from({ y, x }: Pos) {
		return new Pos(y, x)
	}
}

const displayVisited = (xss: Grid<Tile>, visited: HashSet<Pos>): string => {
	const yss = structuredClone(xss)

	let i = 0
	visited.forEach(({ y, x }) => {
		const c = 105 + Math.floor((i / visited.size) * 150)
		const isEdge = i === 0 || i === visited.size - 1
		yss[y][x] = bold(isEdge ? bgBrightRed("X") : rgb24("O", { r: c / 2, g: c, b: c * 1.5 }))

		i++
	})
	return display(yss)
}

const next = (p: Pos): Pos[] => {
	const up = Pos.from({ ...p, y: p.y - 1 })
	const down = Pos.from({ ...p, y: p.y + 1 })
	const left = Pos.from({ ...p, x: p.x - 1 })
	const right = Pos.from({ ...p, x: p.x + 1 })

	return [up, down, left, right]
}

/**
 * converts maze into undirected graph with start end end nodes
 */
const asGraph = (xss: Grid<Tile>) => {
	const graph = EdgeValuedGraphHashed.builder<Pos, number>()

	const { width, height } = wh(xss)
	const begin = Pos.from({ y: 0, x: 1 })
	const end = Pos.from({ y: height - 1, x: width - 2 })

	graph.addNodes([begin, end])

	const inBounds = mkInBounds(xss)
	const get = mkGet(xss)

	/** len excludes position of node */
	const dfs = (lastFork: Pos | null, cur: Pos, len: number, visited: HashSet<Pos>) => {
		if (posEq(cur, end)) {
			// console.log("reached end")
			graph.connect(cur, end, len)
			return
		}
		const nexts = next(cur).filter((x) => inBounds(x) && !visited.has(x) && get(x) !== "#")

		// if (!posEq(cur, begin)) {
		// 	graph.addNode(cur)
		// 	graph.connect(prev, cur, visited.size)
		// }
		if (nexts.length === 1) {
			// edge, continue visiting
			dfs(cur, nexts[0], len + 1, visited.add(cur))
		} else {
			// fork, begin new dfs
			// console.log({ cur, nexts, visited: [...visited] })

			console.log(displayVisited(xss, visited.add(cur)) + "\n")
			graph.addNode(cur)
			graph.connect(lastFork ?? begin, cur, visited.size)
			const nextVisited = visited.add(cur)
			for (const next of nexts) {
				dfs(cur, next, 0, nextVisited)
			}
		}
	}

	dfs(null, begin, 0, HashSet.empty<Pos>())
	return graph.build()
}

if (import.meta.main) {
	const xss = parse(ex)

	const graph = asGraph(xss)
	// console.log(graph.toString())
	const toNode = (p: Pos) => `y${p.y}x${p.x}`
	const nodes = graph
		.streamNodes()
		.map(({ y, x }) => `${toNode({ y, x })} [pos="${x},${y}!"]`).join({ sep: "\n" })
	const dot = graph.stream()
		.filter(([, r]) => r !== undefined)
		.map(([l, r, weight]) => `${toNode(l)} -- ${toNode(r!)} [label="${weight}"]`)
		.join({ sep: "\n" })

	const dotText = `strict graph G {
        ${nodes}

        ${dot}
    }`
	// console.log(dotText)
	await Deno.writeTextFile("graph.dot", dotText)
}
