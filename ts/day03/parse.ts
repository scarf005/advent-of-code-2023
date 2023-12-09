const digitsRe = /(\d+|[^0-9.])/g

type Data = { val: string; x: number; y: number }
export type Num = { type: "num" } & Data
export type Sym = { type: "sym" } & Data
type Grid = (Num | Sym)[][]

const parseData = (v: RegExpMatchArray, y: number): Num | Sym => {
	const x = v.index!
	const val = v[0]
	const type = Number.isNaN(parseInt(val, 10)) ? "sym" : "num"

	return { val, x, y, type } as const
}

export const parse = (x: string): Grid =>
	x
		.split("\n")
		.map((line, y) => [...line.matchAll(digitsRe)].map((v) => parseData(v, y)))

export const isSym = (x: Num | Sym): x is Sym => x.type === "sym"
export const isVal = (x: Num | Sym): x is Num => x.type === "num"

export const isSurrounding = (num: Num, sym: Sym): boolean =>
	num.x - 1 <= sym.x && sym.x <= num.x + num.val.length

const getNeighbors = (grid: Grid, y: number): Num[] => {
	const range = y === 0 ? [0, 2] : y === grid.length ? [-1] : [y - 1, y + 2]

	return grid.slice(...range).flatMap((ys) => ys.filter(isVal))
}

export const surrounding = (grid: Grid, sym: Sym) =>
	getNeighbors(grid, sym.y).filter((val) => isSurrounding(val, sym))
