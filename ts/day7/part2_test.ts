import { HandType } from "./parse.ts"
import { assertEquals } from "$std/assert/assert_equals.ts"
import { parallelOption } from "$utils/mod.ts"
import { parseHand, parseType } from "./part2.ts"

type Case = [string, HandType]

const type = (x: string) => parseType(parseHand(x).groups)
const checkAll = (cases: Case[]) => async (t: Deno.TestContext) => {
	const checks = cases.map(([x, expected]) =>
		t.step(`${x} -> ${expected}`, () => assertEquals(type(x), expected))
	)
	await Promise.all(checks)
}

Deno.test("parseType", parallelOption, async (t) => {
	await t.step(
		"example",
		checkAll([
			["32T3K", "One pair"],
			["KK677", "Two pair"],
			["T55J5", "Four of a kind"],
			["KTJJT", "Four of a kind"],
			["QQQJA", "Four of a kind"],
		]),
	)
	await t.step(
		"4+ jokers",
		checkAll([
			["JJJJJ", "Five of a kind"],
			["2JJJJ", "Five of a kind"],
		]),
	)
	await t.step(
		"3 jokers",
		checkAll([
			["23JJJ", "Four of a kind"],
			["22JJJ", "Five of a kind"],
		]),
	)
	await t.step(
		"2 jokers",
		checkAll([
			["222JJ", "Five of a kind"],
			["223JJ", "Four of a kind"],
			["234JJ", "Three of a kind"],
		]),
	)
	await t.step(
		"1 jokers",
		checkAll([
			["2222J", "Five of a kind"],
			["2223J", "Four of a kind"],
			["2233J", "Full house"],
			["2345J", "One pair"],
		]),
	)
})
