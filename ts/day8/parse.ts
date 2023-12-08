import { typedRegEx } from "$typed_regex/mod.ts"

export type Path = "R" | "L"
export const parsePath = (x: string): Path[] => x.split("") as Path[]

const re = typedRegEx("(?<here>\\w+) = \\((?<L>\\w+), (?<R>\\w+)\\)")
re.captures("BBB = (DDD, EEE)")

export type Route = Record<"here" | "L" | "R", string>
export type Routes = Map<string, Omit<Route, "here">>
export type Input = { path: Path[]; routes: Routes }

export const parseRoutes = (x: string): Route[] => x.split("\n").map((x) => re.captures(x)!)

export const parse = (x: string): Input => {
	const [rawPath, rawRoutes] = x.split("\n\n")
	const path = parsePath(rawPath)
	const routes = new Map(parseRoutes(rawRoutes).map(({ here, ...rest }) => [here, rest]))

	return { path, routes }
}
