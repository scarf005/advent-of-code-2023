import outdent from "$outdent/mod.ts"
import { input } from "$utils/mod.ts"
import { EdgeGraphHashed } from "$rimbu/graph/mod.ts"
import { Stream } from "$rimbu/stream/mod.ts"
import { ArrayNonEmpty } from "$rimbu/common/types.ts"
import { mincut } from "npm:@graph-algorithm/minimum-cut"

export const ex = outdent`
jqt: rhn xhk nvd
rsh: frs pzl lsr
xhk: hfx
cmg: qnr nvd lhk bvb
rhn: xhk bvb hfx
bvb: xhk hfx
pzl: lsr hfx nvd
qnr: nvd
ntq: jqt hfx bvb xhk
nvd: lhk
lsr: lhk
rzs: qnr cmg lsr rsh
frs: qnr lhk lsr
`
export const actual = await input(import.meta)

const parseLine = (x: string) => {
	const [k, v] = x.split(": ")

	return v.split(" ").map((x) => [k, x] as const)
}

const map = new Map<string, number>()

const hash = (x: string) => {
	if (map.has(x)) return map.get(x)!
	const n = map.size
	map.set(x, n)
	return n
}
const unhash = (x: number) => {
	for (const [k, v] of map) {
		if (v === x) return k
	}
	throw new Error(`No key for ${x}`)
}

const parse = (x: string) => x.split("\n").flatMap(parseLine) as ArrayNonEmpty<[string, string]>

const toGraph = (xs: ArrayNonEmpty<[string, string]>) => EdgeGraphHashed.of(...xs)
const renderGraph = (xs: ArrayNonEmpty<[string, string]>): string =>
	outdent`
        strict graph G {
        ${xs.map(([a, b]) => `"${a}" -- "${b}"`).join("\n")}
        }
    `

const findSize = (graph: EdgeGraphHashed.NonEmpty<string>) => {
	const stack = graph.streamNodes().take(1).toArray()
	const visited = new Set(stack)
	while (stack.length) {
		const node = stack.pop()!
		for (const neighbour of graph.getConnectionsFrom(node)) {
			if (!visited.has(neighbour)) {
				visited.add(neighbour)
				stack.push(neighbour)
			}
		}
	}
	return visited.size
}

if (import.meta.main) {
	const parsed = parse(actual)
	const graph = toGraph(parsed)
	const cuts = [...mincut(parsed.map(([a, b]) => [hash(a), hash(b)]))]
		.map(([a, b]) => [unhash(a), unhash(b)] as const)

	console.log(cuts)
	const cutGraph = graph.disconnectAll(cuts)
    const one = findSize(cutGraph.assumeNonEmpty())
    const other = cutGraph.nodeSize - one
    console.log(one, other, one * other)
	// console.log(cutGraph.toString())
	// await Deno.writeTextFile("ts/day25/example.dot", renderGraph([...cutGraph]))
}
