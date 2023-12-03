import * as dotenv from "$std/dotenv/mod.ts"
import { basename } from "$std/path/basename.ts"
import { Command } from "$cliffy/command/command.ts"
import { asynciter } from "$asynciter/mod.ts"
import { difference } from "$set_operations/mod.ts"

const cookieKey = "AOC_SESSION"
const getCookie = async () => {
	const env = Deno.env.get(cookieKey) ?? (await dotenv.load())[cookieKey]

	if (typeof env !== "string") {
		throw new Error(`Environment variable ${cookieKey} is not a string!`)
	} else if (env.length === 0) {
		throw new Error(`Environment variable ${cookieKey} is empty!`)
	}

	return env
}

type AuthedFetch = (input: RequestInfo | URL) => Promise<Response>
type MkAuthedFetch = (session: string) => AuthedFetch

/** Generate fetch with session cookie */
const authedFetch: MkAuthedFetch = (session) => (input) =>
	fetch(input, { headers: new Headers({ cookie: `session=${session}` }) })

/**
 * Fetches AOC input
 */
const getInput = (fetch: AuthedFetch) => (year: number) => async (day: number) =>
	(await fetch(`https://adventofcode.com/${year}/day/${day}/input`)).text()

/**
 * if it's before 12-01, return previous year
 */
const getDefaultYear = () => {
	const now = new Date()
	const isDecember = now.getMonth() === 11
	return now.getFullYear() - (isDecember ? 0 : 1)
}

const assertValidAOCYear = (year: number, currentYear: number) => {
	if (year < 2015) {
		throw new Error(`AOC started in 2015, ${year} is too early`)
	}
	if (year > currentYear) {
		throw new Error(`AOC ${year} hasn't started yet`)
	}
}

/** How many days of inputs are there for a given year */
const countInputs = (year: number) => {
	const now = new Date()
	const currentYear = now.getFullYear()
	const currentMonth = now.getMonth()
	const currentDay = now.getDate()

	assertValidAOCYear(year, currentYear)

	const countOngoing = currentMonth === 11 ? Math.min(currentDay, 25) : 0
	const length = year === currentYear ? countOngoing : 25

	return new Set(Array.from({ length }, (_, i) => i + 1))
}

/**
 * Read list of file names from given path of format `<day>.txt`
 */
export const readCachedInputs = (path: string) =>
	asynciter(Deno.readDir(path))
		.filter((file) => file.isFile && file.name.endsWith(".txt"))
		.map(({ name }) => parseInt(basename(name), 10))
		.collect()
		.then((xs) => new Set(xs))

const main = () =>
	new Command()
		.name("fetch.ts")
		.description("Fetch Advent of Code inputs.")
		.option("-y, --year <year:number>", "year to fetch", { default: getDefaultYear() })
		.option("-E, --cookie <cookie:string>", "session cookie, defaults to AOC_SESSION env variable")
		.option("--cache <path:string>", "path to cache inputs", { default: "./.cache" })
		.action(async ({ year, cache, cookie = getCookie() }) => {
			const uncachedInputs = difference(countInputs(year), await readCachedInputs(cache))
			const size = uncachedInputs.size

			if (size === 0) {
				return console.log(`All inputs for ${year} are cached`)
			}

			console.log(`Fetching ${size} inputs for ${year}...`)

			const query = getInput(authedFetch(await cookie))(year)
			await asynciter([...uncachedInputs])
				.concurrentUnorderedMap(async (day) => ({ day, input: await query(day) }))
				.concurrentUnorderedMap(({ day, input }) =>
					Deno.writeTextFile(`${cache}/${day}.txt`, input)
				)
				.collect()
		})

if (import.meta.main) {
	await main().parse(Deno.args)
}
