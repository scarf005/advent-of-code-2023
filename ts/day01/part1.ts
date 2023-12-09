import { sum } from "$utils/mod.ts"

const digit = /(\d)/g

/**
 * On each line, the calibration value can be found by
 * combining the first digit and the last digit (in that order) to form a single two-digit number.
 */
export const parse = (x: string): number => {
	const xs = x.match(digit)!

	return +`${xs.at(0)!}${xs.at(-1)!}`
}

export const part1 = (input: string): number => input.split("\n").map(parse).reduce(sum)
