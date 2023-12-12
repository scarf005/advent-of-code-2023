//// Helpers written before the day started:

import { input } from "$utils/mod.ts"

export function memoize<Args extends unknown[], Result>(
	func: (...args: Args) => Result,
): (...args: Args) => Result {
	const stored = new Map<string, Result>()

	return (...args) => {
		const k = JSON.stringify(args)
		if (stored.has(k)) {
			return stored.get(k)!
		}
		const result = func(...args)
		stored.set(k, result)
		return result
	}
}

export function sum(...nums: number[] | (readonly number[])[]): number {
	let tot = 0
	for (const x of nums) {
		if (typeof x === "number") {
			tot += x
		} else {
			for (const y of x) {
				tot += y
			}
		}
	}
	return tot
}

export function toInt(x: string): number {
	return parseInt(x, 10)
}


const inputContents  = await input(import.meta)

const lines = inputContents.split("\n")

//// Code written on the day of:

const countWays = memoize((line: string, runs: readonly number[]): number => {
	if (line.length === 0) {
		if (runs.length === 0) {
			return 1
		}
		return 0
	}
	if (runs.length === 0) {
		for (let i = 0; i < line.length; i++) {
			if (line[i] === "#") {
				return 0
			}
		}
		return 1
	}

	if (line.length < sum(runs) + runs.length - 1) {
		// The line is not long enough for all runs
		return 0
	}

	if (line[0] === ".") {
		return countWays(line.slice(1), runs)
	}
	if (line[0] === "#") {
		const [run, ...leftoverRuns] = runs
		for (let i = 0; i < run; i++) {
			if (line[i] === ".") {
				return 0
			}
		}
		if (line[run] === "#") {
			return 0
		}

		return countWays(line.slice(run + 1), leftoverRuns)
	}
	// Otherwise dunno first spot, pick
	return (
		countWays("#" + line.slice(1), runs) + countWays("." + line.slice(1), runs)
	)
})

let tot = 0
for (const line of lines) {
	const [str, numsS] = line.split(" ")
	const nums = numsS.split(",").map(toInt)

    // tot += countWays(str, nums)
	const strExpanded = [str, str, str, str, str].join("?")
	const numsExpanded = [...nums, ...nums, ...nums, ...nums, ...nums]

	tot += countWays(strExpanded, numsExpanded)
}

console.info({ tot })
