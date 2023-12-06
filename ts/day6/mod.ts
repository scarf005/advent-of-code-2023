import { typedRegEx } from "$typed_regex/mod.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"

export type Race = { time: number; distance: number }

/**
 * @param time total timespan
 * @param accTime time spent accelerating
 */
export const travel = (time: number) => (accTime: number): number => (time - accTime) * accTime

Deno.test("travel", () => {
	const race = travel(7)

	assertEquals(race(0), 0)
	assertEquals(race(1), 6)
	assertEquals(race(2), 10)
	assertEquals(race(3), 12)
	assertEquals(race(4), 12)
	assertEquals(race(5), 10)
	assertEquals(race(6), 6)
	assertEquals(race(7), 0)
})
// Math.ceil(7 / 2) = 4, 4 - 2 = 2, 2 * 2 = 4
// Math.ceil(30 / 2) = 15, 15 - 11 = 4, 4 * 2 = 8
// 1~10, {11 ~ 19} 20~30

export const wins = ({ time, distance }: Race) => {
	// not accelerating at all and accelerating the whole time always loses
	const cases = Array.from({ length: time - 1 }, (_, i) => i + 1)
	const tv = travel(time)
	const shortest = cases.find((t) => tv(t) > distance)!
    const longest = cases.reverse().find((t) => tv(t) > distance)!
    const totalWins = longest - shortest + 1

	// console.log({ cases, shortest, longest, totalWins })
    return totalWins
}

// const races = [
// 	{ time: 7, distance: 9 },
// 	{ time: 15, distance: 40 },
// 	{ time: 30, distance: 200 },
// ]

const races = [
	{ time: 49, distance: 263 },
	{ time: 97, distance: 1532 },
	{ time: 94, distance: 1378 },
    { time: 94, distance: 1851 },
]

const result = races.map(wins).reduce((a, b) => a * b, 1)
console.log(result)

// find the first travel distance that exceeds distance requirement

// const parser = (x: string)

// const time = [7, 15, 30]
// const distance = [9, 40, 200]
