import { actual, display, ex, mkGet, mkInBounds, parse, posEq, Tile } from "./mod.ts"
import { Grid, wh } from "$utils/grid.ts"
import { HashMap, HashSet } from "$rimbu/hashed/mod.ts"
import { EdgeValuedGraphHashed } from "$rimbu/graph/mod.ts"
import { bgBrightRed, bgBrightYellow, bold, brightBlue } from "$std/fmt/colors.ts"
import { Stream } from "$rimbu/stream/mod.ts"

class Pos {
	constructor(readonly y: number, readonly x: number) {}
	toString() {
		return `{y:${this.y},x:${this.x}}`
	}
	static from({ y, x }: Pos) {
		return new Pos(y, x)
	}
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
	const inBounds = mkInBounds(xss)
	const yss = structuredClone(xss)
	const begin = Pos.from({ y: 0, x: 1 })
	const end = Pos.from({ y: height - 1, x: width - 2 })

	yss[0][1] = "X"
	yss[height - 1][width - 2] = "X"
	graph.addNodes([begin, end])
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const p = Pos.from({ y, x })
			const dirs = next(p).filter((p) => inBounds(p) && xss[p.y][p.x] !== "#")
			const isFork = dirs.length > 2
			if (xss[y][x] === "." && isFork) {
				yss[y][x] = "X"
				graph.addNode(p)
			}
		}
	}

	for (const fork of graph.build().streamNodes()) {
		const dirs = next(fork)
			.filter((p) => inBounds(p) && !["O", "X", "#"].includes(yss[p.y][p.x]))

		for (const dir of dirs) {
			// console.log("start", { fork, dir })
			let cur = dir
			let len = 1
			while (true) {
				if (yss[cur.y][cur.x] === "X") {
					// console.log({ fork, cur, len })
					graph.connect(fork, cur, len)
					break
				}

				yss[cur.y][cur.x] = "O"
				len++

				const nexts = next(cur)
					.filter((p) => inBounds(p) && !["#", "O"].includes(yss[p.y][p.x]) && !posEq(p, fork))

				if (nexts.length === 1) {
					cur = nexts[0]
				} else {
					// console.log(nexts)
					// console.log("dead end")
					break
				}
			}
		}
	}
	console.log(
		display(yss)
			.replace(/X/g, bold(bgBrightRed("X")))
			.replace(/O/g, bold(brightBlue("O"))),
	)
	return graph.build()
}

const longestPath = (graph: Graph, start: Pos, end: Pos) => {
	let longest = 0
	let paths = HashSet.empty<Pos>()

	const dfs = (cur: Pos, len: number, visited: HashSet<Pos>) => {
		if (visited.has(cur)) return

		if (posEq(cur, end)) {
			if (len > longest) {
				longest = len
				paths = visited
			}
			return
		}

		const nextVisited = visited.add(cur)
		const nextPaths = graph.getConnectionStreamFrom(cur)

		for (const [_from, to, weight] of nextPaths) {
			dfs(to, len + weight, nextVisited)
		}
	}

	dfs(start, 0, HashSet.empty<Pos>())

	return { longest, paths }
}

if (import.meta.main) {
	const [flag] = Deno.args
	const xss = parse(flag ? actual : ex)
	const { width, height } = wh(xss)

	const graph = asGraph(xss)
	const toNode = (p: Pos) => `y${p.y}x${p.x}`
	const nodes = graph
		.streamNodes()
		.map(toNode).join({ sep: "\n" })

	const dot = graph.streamConnections()
		.filter(([, r]) => r !== undefined)
		.map(([l, r, weight]) => `${toNode(l)} -- ${toNode(r!)} [label="${weight}"]`)
		.join({ sep: "\n" })

	// console.log(graph.toString())

	const begin = Pos.from({ y: 0, x: 1 })
	const end = Pos.from({ y: height - 1, x: width - 2 })

	const { longest, paths } = longestPath(graph, begin, end)
	const dotText = `strict graph G {
        ${
		paths.stream().fold(nodes, (acc, x) =>
			acc.replace(toNode(x), `${toNode(x)} [style="filled", fillcolor="#ffd900bf00"]`))
	}

        ${
		paths.stream().fold(dot, (acc, x) =>
			acc.replace(
				new RegExp(`${toNode(x)} -- ${toNode(x)}`, "g"),
				`${toNode(x)} -- ${toNode(x)} [style="filled", fillcolor="#ffd900bf00"]`,
			))
	}
    }`

	await Deno.writeTextFile("graph.dot", dotText)
}
