import { sum } from "$utils/mod.ts"

const digit = String.raw`(one|two|three|four|five|six|seven|eight|nine|\d)`

export const first = new RegExp(digit)
export const last = new RegExp(`.*${digit}`)

const digitMap = new Map(Object.entries({
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9,
}))

const parseDigit = (x: string): number => digitMap.get(x) ?? parseInt(x, 10)

export const parse = (x: string): number => {
	const [left, right] = [x.match(first)![1], x.match(last)![1]].map(parseDigit)

	return +`${left}${right}`
}
export const part2 = (input: string): number => input.split("\n").map(parse).reduce(sum)
