import outdent from "$outdent/mod.ts"
import { Dim, Dir, id, input, Pos } from "$utils/mod.ts"
import { ArrayNonEmpty } from "$rimbu/common/types.ts"
import { HashMap } from "$rimbu/hashed/mod.ts"
import { bgBrightYellow, dim as dimmed, gray, rgb24 } from "$std/fmt/colors.ts"
import { match } from "npm:ts-pattern"
import { Stream } from "$rimbu/stream/mod.ts"

export const ex = outdent`
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
type VisitedDir = Record<Dir, boolean>
type Mirror = { type: "|" | "/" | "-" | "\\" } & VisitedDir
type Mirrors = HashMap<Pos, Mirror>
type Ray = { pos: Pos; dir: Dir }

const parse = (x: string): Mirrors => {
	const xs = x.split("\n").flatMap((row, y) =>
		row.split("").flatMap((type, x) =>
			type === "."
				? []
				: [[{ y, x }, { type, U: false, D: false, L: false, R: false } as Mirror] as const]
		)
	)

	return HashMap.of<Pos, Mirror>(...xs as ArrayNonEmpty<[Pos, Mirror]>)
}

const isHorizontal = (dir: Dir): boolean => dir === "L" || dir === "R"

const nextRay = (ray: Ray, mirror: Mirror): Ray[] => {
	switch (ray.dir) {
		case "U": {
			return match(mirror)
				.with({ U: true }, () => [])
				.with({ type: "-" }, () => [{ ...ray, dir: "L" }, { ...ray, dir: "R" }])
				.with({ type: "/" }, () => [{ ...ray, dir: "R" }])
				.with({ type: "\\" }, () => [{ ...ray, dir: "L" }])
				.otherwise(() => []) as Ray[]
		}
		case "D":
			return match(mirror)
				.with({ D: true }, () => [])
				.with({ type: "-" }, () => [{ ...ray, dir: "L" }, { ...ray, dir: "R" }])
				.with({ type: "/" }, () => [{ ...ray, dir: "L" }])
				.with({ type: "\\" }, () => [{ ...ray, dir: "R" }])
				.otherwise(() => []) as Ray[]
		case "L":
			return match(mirror)
				.with({ L: true }, () => [])
				.with({ type: "|" }, () => [{ ...ray, dir: "U" }, { ...ray, dir: "D" }])
				.with({ type: "/" }, () => [{ ...ray, dir: "D" }])
				.with({ type: "\\" }, () => [{ ...ray, dir: "U" }])
				.otherwise(() => []) as Ray[]
		case "R":
			return match(mirror)
				.with({ R: true }, () => [])
				.with({ type: "|" }, () => [{ ...ray, dir: "U" }, { ...ray, dir: "D" }])
				.with({ type: "/" }, () => [{ ...ray, dir: "U" }])
				.with({ type: "\\" }, () => [{ ...ray, dir: "D" }])
				.otherwise(() => []) as Ray[]
	}
}

type Visit = [Pos, Pos, Dir]
type Entry = readonly [Pos, Mirror]
type Cmp = (a: Entry, b: Entry) => number
const cmpX: Cmp = ([a], [b]) => a.x - b.x
const cmpY: Cmp = ([a], [b]) => a.y - b.y

const mkNext =
	({ w, h }: Dim, visits: Visit[]) =>
	(mirrors: Mirrors, { pos: { y, x }, dir }: Ray): [Mirrors, Ray[]] => {
		if (
			(dir === "U" && y === 0) ||
			(dir === "D" && y === h - 1) ||
			(dir === "L" && x === 0) ||
			(dir === "R" && x === w - 1)
		) {
			visits.push([{ y, x }, { y, x }, dir])
			return [mirrors, []]
		}

		const hs = mirrors.stream().filterPure(([m, { type }]) => m.y === y && type !== "-")
		const vs = mirrors.stream().filterPure(([m, { type }]) => m.x === x && type !== "|")

		const result = match(dir)
			.with("R", () => hs.filter(([m]) => x < m.x).minBy(cmpX))
			.with("L", () => hs.filter(([m]) => x > m.x).maxBy(cmpX))
			.with("U", () => vs.filter(([m]) => y > m.y).maxBy(cmpY))
			.with("D", () => vs.filter(([m]) => y < m.y).minBy(cmpY))
			.exhaustive()

		if (result === undefined) {
			const end = match(dir)
				.with("U", () => ({ y: 0, x }))
				.with("D", () => ({ y: h - 1, x }))
				.with("L", () => ({ y, x: 0 }))
				.with("R", () => ({ y, x: w - 1 }))
				.exhaustive()
			visits.push([{ y, x }, end, dir])
			return [mirrors, []]
		}
		const [at, mirror] = result

		const visited = mirrors.set(at, { ...mirror, [dir]: true })
		visits.push([{ y, x }, at, dir])
		return [visited, nextRay({ pos: at, dir }, mirror)]
	}

const arrows = {
	U: "^",
	D: "V",
	L: "<",
	R: ">",
}

const verticalLine = (a: Pos, b: Pos): Pos[] =>
	Array.from({ length: Math.abs(a.y - b.y) + 1 }, (_, i) => ({
		y: Math.min(a.y, b.y) + i,
		x: a.x,
	}))

const horizontalLine = (a: Pos, b: Pos): Pos[] =>
	Array.from({ length: Math.abs(a.x - b.x) + 1 }, (_, i) => ({
		y: a.y,
		x: Math.min(a.x, b.x) + i,
	}))

const display = ({ w, h }: Dim, mirrors: Mirrors, visits: Visit[]): string => {
	const xss = Array.from({ length: h }, () => Array.from({ length: w }, () => gray(".")))

	mirrors.forEach(([pos, mirror]) => {
		const visited = mirror.U || mirror.D || mirror.L || mirror.R
		const color = visited ? bgBrightYellow : dimmed
		xss[pos.y][pos.x] = color(mirror.type)
	})
	visits.forEach(([p, c, d], i) => {
		const per = i / visits.length
		const arrow = rgb24(arrows[d], { r: 155 + 100 * per, g: 50 + 150 * per, b: 120 * per })
		const lines = isHorizontal(d) ? horizontalLine : verticalLine

		lines(p, c)
			.filter(({ y, x }) => 0 <= y && y < h && 0 <= x && x < w)
			.forEach((p) => xss[p.y][p.x] = arrow)
	})

	return xss.map((xs) => xs.join("")).join("\n")
}

const run = (mirrors: Mirrors, dim: Dim, init: Ray) => {
	const visits: Visit[] = []
	const next = mkNext(dim, visits)
	const queue = [init]

	while (queue.length) {
		const ray = queue.shift()!
		const [nextMirrors, nextRays] = next(mirrors, ray)

		queue.push(...nextRays)
		mirrors = nextMirrors
	}
	return { mirrors, visits }
}

const energized = ({ w, h }: Dim, visits: Visit[]): number => {
	const dumbGrid = Array.from({ length: h }, () => Array.from({ length: w }, () => "."))
	visits.forEach(([a, b]) => {
		const lines = a.y === b.y ? horizontalLine : verticalLine
		lines(a, b)
			.filter(({ y, x }) => 0 <= y && y < h && 0 <= x && x < w)
			.forEach(({ y, x }) => (dumbGrid[y][x] = "#"))
	})
	const energized = dumbGrid.flat().reduce((acc, x) => acc + (x === "#" ? 1 : 0), 0)
	return energized
}

const part1impl = (x: string) => {
	const ts = x.split("\n")
	const dim = { w: ts[0].length, h: ts.length }
	const { mirrors, visits } = run(parse(x), dim, { pos: { y: 0, x: -1 }, dir: "R" })

	return { render: () => display(dim, mirrors, visits), energy: energized(dim, visits) }
}

export const part2 = (x: string) => {
	const ts = x.split("\n")
	const { w, h } = { w: ts[0].length, h: ts.length }

	const up = horizontalLine({ y: -1, x: 0 }, { y: -1, x: w - 1 })
	const down = horizontalLine({ y: h, x: 0 }, { y: h, x: w - 1 })
	const left = verticalLine({ y: 0, x: -1 }, { y: h - 1, x: -1 })
	const right = verticalLine({ y: 0, x: w }, { y: h - 1, x: w })
	const mirrors = parse(x)

	const energy = Stream
		.of<[Dir, Pos[]]>(["D", up], ["U", down], ["R", left], ["L", right])
		.flatMap(([dir, xs]) => xs.map((x) => [dir, x] as const))
		.map(([dir, pos]) => run(mirrors, { w, h }, { pos, dir }))
		.map(({ mirrors, visits }) => {
			const energy = energized({ w, h }, visits)

			console.log(display({ w, h }, mirrors, visits))
			console.log(energy)
			return energy
		})
		.max()!

	return energy
}

export const part1 = (x: string): number => part1impl(x).energy

if (import.meta.main) {
	const actual = await input(import.meta)

	const text = Deno.args.length ? actual : ex

	const { render, energy } = part1impl(text)
	console.log(render())
	console.log(energy)

	console.log(part2(text))
}
