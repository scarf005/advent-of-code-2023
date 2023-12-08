import { input, lcm } from "$utils/mod.ts"
import { example, exampleConcurrent } from "./_example.ts"
import { Input, parse } from "./parse.ts"

export const trail =
	({ path, routes }: Input) => (stop: (x: string) => boolean) => (here: string): number => {
		let i = 0
		while (!stop(here)) {
			const route = routes.get(here)!
			here = route[path[i % path.length]]
			i += 1
			// console.log({ i, here })
		}
		return i
	}

export const part1 = (x: string): number => {
	const parsed = parse(x)
	const stop = (x: string) => x === "ZZZ"

	return trail(parsed)(stop)("AAA")
}

export const part2 = (x: string): number => {
	const parsed = parse(x)
	const keys = [...parsed.routes.keys()].filter((x) => x.endsWith("A"))
	const stop = (x: string) => x.endsWith("Z")

	const trails = keys.map(trail(parsed)(stop))

    const answer = trails.reduce(lcm)

	// console.log({ trails, answer })
    return answer
}

if (import.meta.main) {
	console.log(part1(example))
	console.log(part2(exampleConcurrent))

	const text = await input(import.meta)
	console.log(part1(text))
	console.log(part2(text))
}
