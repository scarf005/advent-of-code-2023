import { actual, display, ex, mkGet, mkInBounds, parse, posEq, Tile } from "./mod.ts"
import { Grid, wh } from "$utils/grid.ts"
import { HashSet } from "$rimbu/hashed/mod.ts"
import { EdgeValuedGraphHashed } from "$rimbu/graph/mod.ts"
import { bgBrightRed, bgBrightYellow, bold, brightBlue } from "$std/fmt/colors.ts"

class Pos {
	constructor(readonly y: number, readonly x: number) {}
	toString() {
		return `{y:${this.y},x:${this.x}}`
	}
	static from({ y, x }: Pos) {
		return new Pos(y, x)
	}
}

const displayVisited = (xss: Grid<Tile>, s: Pos, e: Pos, visited: HashSet<Pos>): string => {
	const yss = structuredClone(xss)

	visited.forEach(({ y, x }) => {
		yss[y][x] = bold(brightBlue("O"))
	})
	yss[s.y][s.x] = bgBrightYellow("S")
	yss[e.y][e.x] = bgBrightRed("X")
	return display(yss)
}

const next = (p: Pos): Pos[] => {
	const up = Pos.from({ ...p, y: p.y - 1 })
	const down = Pos.from({ ...p, y: p.y + 1 })
	const left = Pos.from({ ...p, x: p.x - 1 })
	const right = Pos.from({ ...p, x: p.x + 1 })

	return [up, down, left, right]
}

type Graph = EdgeValuedGraphHashed<Pos, number>

/**
 * converts maze into undirected graph with start end end nodes
 */
const asGraph = (xss: Grid<Tile>): Graph => {
	const graph = EdgeValuedGraphHashed.builder<Pos, number>()

	const { width, height } = wh(xss)

	const begin = Pos.from({ y: 0, x: 1 })
	const end = Pos.from({ y: height - 1, x: width - 2 })

	graph.addNodes([begin, end])

	const inBounds = mkInBounds(xss)
	const get = mkGet(xss)

	/** len excludes position of node */
	const dfs = (
		fork: Pos,
		from: Pos,
		globalForks: HashSet<Pos>,
	) => {
		let cur = from
		const path = HashSet.builder<Pos>()

		while (true) {
			if (posEq(cur, end)) {
				// console.log("found end", fork, cur)
				// console.log(path.size)
				graph.connect(fork, cur, path.size + 1)
				return
			}

			const nexts = next(cur).filter((x) =>
				inBounds(x) && !path.has(x) && !globalForks.has(x) && get(x) !== "#"
			)
			// console.log(nexts)
			if (nexts.length === 0) {
				// console.log("dead end", fork, cur)
				return
			} else if (nexts.length === 1) {
				// console.log({ cur, nexts, size: path.size })
				path.add(cur)
				cur = nexts[0]
			} else {
				// console.log(nexts, path.size, "fork")
				// console.log({ fork, cur })
				// const builtPath = path.build()
				const nextGlobal = globalForks.add(cur)
				// console.log([...path.build()])
				console.log(displayVisited(xss, from, cur, path.build()))
				console.log(globalForks.size)

				graph.connect(fork, cur, path.size)
				// console.log("nextGlobal", [...nextGlobal])
				for (const next of nexts) {
					// console.log(next)
					dfs(cur, next, nextGlobal)
				}
				return
			}
		}
	}

	dfs(begin, Pos.from({ y: 1, x: 1 }), HashSet.of<Pos>(begin))
	return graph.build()
}

// const findLongestPath = (graph: Graph, begin: Pos, end: Pos): number => {
// 	const dfs = (from: Pos, visited: HashSet<Pos>): number => {
// 	}
// }

if (import.meta.main) {
	const [flag] = Deno.args
	const xss = parse(flag ? actual : ex)
	const { width, height } = wh(xss)

	const graph = asGraph(xss)
	// console.log(graph.toString())
	const toNode = (p: Pos) => `y${p.y}x${p.x}`
	const nodes = graph
		.streamNodes()
		.map(({ y, x }) => `${toNode({ y, x })} [pos="${x},${y}!"]`).join({ sep: "\n" })

	const dot = graph.streamConnections()
		.filter(([, r]) => r !== undefined)
		.map(([l, r, weight]) => `${toNode(l)} -- ${toNode(r!)} [label="${weight}"]`)
		.join({ sep: "\n" })

	const dotText = `strict graph G {
        ${nodes}

        ${dot}
    }`

	console.log(graph.toString())
	// const yss = structuredClone(xss)
	// for (const { y, x } of graph.streamNodes()) {
	// 	yss[y][x] = bgBrightRed("X")
	// }
	// console.log(display(yss))

	await Deno.writeTextFile("graph.dot", dotText)
}
