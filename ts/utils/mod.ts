export const id = <T>(x: T): T => x

export type BinMath = (a: number, b: number) => number
export const sum: BinMath = (a, b) => a + b
export const mul: BinMath = (a, b) => a * b
export const gcd: BinMath = (x, y) => (y === 0 ? x : gcd(y, x % y))
export const lcm: BinMath = (x, y) => (x * y) / gcd(x, y)

export const day = (url: string) => parseInt(url.match(/day(\d+)/)![1], 10)

export const questionPath = (url: string) => new URL(`../../.cache/${day(url)}.txt`, url)

export const input = (meta: ImportMeta) =>
	Deno.readTextFile(questionPath(meta.url)).then((text) => text.trim())

/** Test that can be ran in parallel */
export const parallelOption = {
	sanitizeExit: false,
	sanitizeOps: false,
	sanitizeResources: false,
} as Pick<Deno.TestDefinition, "sanitizeExit" | "sanitizeOps" | "sanitizeResources">
