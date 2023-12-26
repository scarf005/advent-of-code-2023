export const id = <T>(x: T): T => x

export type BinMath = (a: number, b: number) => number
export const sum: BinMath = (a, b) => a + b
export const mul: BinMath = (a, b) => a * b
export const gcd: BinMath = (x, y) => (y === 0 ? x : gcd(y, x % y))
export const lcm: BinMath = (x, y) => (x * y) / gcd(x, y)

export const day = (url: string) => url.match(/day(\d+)/)![1]

export const questionPath = (url: string) => new URL(`../../.cache/${day(url)}.txt`, url)

export const input = (meta: ImportMeta) =>
	Deno.readTextFile(questionPath(meta.url)).then((text) => text.trim())

export type V2<T > = { y: T; x: T }
export type Pos = V2<number>
export type Dim = { w: number; h: number }

export type Dir = "U" | "D" | "L" | "R"

/** Test that can be ran in parallel */
export const parallelOption = {
	sanitizeExit: false,
	sanitizeOps: false,
	sanitizeResources: false,
} as Pick<Deno.TestDefinition, "sanitizeExit" | "sanitizeOps" | "sanitizeResources">
