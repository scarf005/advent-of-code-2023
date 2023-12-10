import { runningReduce } from "https://deno.land/std@0.208.0/collections/mod.ts"
// import { example, exampleConcurrent } from "./_example.ts"
import { Input, parse } from "./parse.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { input, sum } from "$utils/mod.ts"
import { parseNums } from "$utils/parse.ts"
import { example } from "./_example.ts"

const lastDiff = (xs: number[]) => xs.at(-1)! - xs.at(-2)!

const predict = (xs: number[]): number => {
	const xlast = xs.at(-1)!
	const ys = xs.slice(1).map((item, i) => item - xs[i])

	return xlast + (ys.every(y => y === 0) ? lastDiff(xs) : predict(ys))
}


const cases = [
	{ given: [10, 13, 16, 21, 30, 45], expected: 68 },
	{ given: [1, 3, 6, 10, 15, 21], expected: 28 },
	{ given: [0, 3, 6, 9, 12, 15], expected: 18 },
]
cases.forEach(({ given, expected }) =>
	Deno.test(`predict ${given} -> ${expected}`, () => assertEquals(predict(given), expected))
)

export const part1 = (x: string) =>
	x
		.split("\n")
        .map(parseNums)
        .map(predict)
        // .reduce(sum)
		// .map((xs) => `[${xs}] -> ${predict2(xs)}`)
		// .join("\n")
// .reduce(sum)

if (import.meta.main) {
	console.log(part1(example))
	// console.log(part2(exampleConcurrent))

	const text = await input(import.meta)
	console.log(part1(text))
	// console.log(part2(text))
}
