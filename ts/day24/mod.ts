import outdent from "$outdent/mod.ts"
import { typedRegEx } from "$typed_regex/mod.ts"
import { mapValues } from "$std/collections/map_values.ts"
import { input } from "$utils/mod.ts"

export const ex = outdent`
19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3
`
export const actual = await input(import.meta)

export const re = typedRegEx(
	"(?<px>\\d+),\\s+(?<py>\\d+),\\s+(?<pz>\\d+)\\s+@\\s+(?<vx>-?\\d+),\\s+(?<vy>-?\\d+),\\s+(?<vz>-?\\d+)",
)
export type Data = Record<"px" | "py" | "pz" | "vx" | "vy" | "vz", number>
export const parse = (x: string): Data[] =>
	x.split("\n").map((x) => re.captures(x)!).map((x) => mapValues(x, Number) as Data)
