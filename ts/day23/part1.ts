import { Grid } from "../utils/grid.ts"
import { Pos } from "$utils/mod.ts"
import { actual, displayVisited, mkGet, mkInBounds, parse, posEq, Tile } from "./mod.ts"

const next = (p: Pos, dir: Tile): Pos[] => {
	const up = { ...p, y: p.y - 1 }
	const down = { ...p, y: p.y + 1 }
	const left = { ...p, x: p.x - 1 }
	const right = { ...p, x: p.x + 1 }
	switch (dir) {
		case "^":
			return [up]
		case "v":
			return [down]
		case "<":
			return [left]
		case ">":
			return [right]
		case ".":
			return [up, down, left, right]
	}
	throw new Error("can't go through wall")
}

type Option = {
	xss: Grid<Tile>
	begin: Pos
	end: Pos
}

const findLongest = ({ xss, begin, end }: Option) => {
	const get = mkGet(xss)
	const inBounds = mkInBounds(xss)
	let longest = new Set<string>()

	const dfs = (cur: Pos, prev: Pos, visited: Set<string>) => {
		const key = `${cur.y},${cur.x}`

		if (visited.has(key)) {
			return
		}

		if (posEq(cur, end)) {
			console.log(displayVisited(xss, end, visited))
			console.log({ longest: longest.size, visited: visited.size })

			if (visited.size <= longest.size) {
				return
			}
			longest = structuredClone(visited)
			return
		}

		// console.log({ cur, curLen })

		visited.add(key)

		// explore all possible directions
		const nextPoss = next(cur, get(cur))
			.filter((x) => !posEq(x, prev) && inBounds(x) && get(x) !== "#")

		// console.log({ prev, cur, nextPoss })
		for (const nextPos of nextPoss) {
			dfs(nextPos, cur, structuredClone(visited))
		}
	}

	const result = dfs(begin, { y: -1, x: -1 }, new Set<string>())
	console.log(displayVisited(xss, end, longest))
	console.log(longest.size)
	return result
}

if (import.meta.main) {
	const xss = parse(actual)
	console.log(
		findLongest({ xss, begin: { y: 0, x: 1 }, end: { y: xss.length - 1, x: xss[0].length - 2 } }),
	)
	console.log({ y: xss.length - 1, x: xss[0].length - 2 })
}
