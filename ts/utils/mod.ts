export const id = <T>(x: T): T => x
export const sum = (a: number, b: number): number => a + b
export const mul = (a: number, b: number): number => a * b

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
