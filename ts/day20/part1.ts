import outdent from "$outdent/mod.ts"
import { input, mul } from "$utils/mod.ts"
import { typedRegEx } from "$typed_regex/mod.ts"
import { partition } from "$std/collections/partition.ts"

const ex1 = outdent`
broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a
`

const ex2 = outdent`
broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output
`

const broadcasterRe = typedRegEx("broadcaster -> (?<to>.*)")
const moduleRe = typedRegEx("(?<kind>[&%])(?<id>\\w+) -> (?<send>.*)")

type Circuit = { msgs: Message[]; mods: Module[]; stat: [number, number] }

type Pulse = 0 | 1
type FlipFlop = { id: string; type: "%"; state: Pulse; to: string[] }
type Conjuction = { id: string; type: "&"; state: Record<string, Pulse>; to: string[] }
type Module = FlipFlop | Conjuction

type Message = { id: string; send: Pulse; to: string[] }
type StepResult = { mod: Module; send?: Message }

const parseBroadcaster = (x: string): Message => {
	const { to } = broadcasterRe.captures(x)!

	return { id: "broadcaster", send: 0, to: to.split(",").map((x) => x.trim()) }
}

const parseModule = (x: string): Omit<Module, "state"> => {
	const { kind, id, send } = moduleRe.captures(x)!
	const to = send.split(",").map((x) => x.trim())

	// deno-fmt-ignore
	switch (kind) {
		case "%": return { id, type: "%", to }
		case "&": return { id, type: "&", to }
	}
	throw new Error(`unreachable ${x}`)
}

const parse = (x: string): Circuit => {
	const xs = x.split("\n")
	const [broadcast, rest] = partition(xs, (x) => x.startsWith("broadcaster"))

	const msgs = [parseBroadcaster(broadcast[0])]
	const ys = rest.map(parseModule)
	const mods = ys.map((x) => {
		if (x.type === "%") return { ...x, state: 0 } as FlipFlop

		const froms = ys.filter((y) => y.to.includes(x.id)).map((y) => y.id)
		const state = Object.fromEntries(froms.map((id) => [id, 0]))

		return { ...x, state } as Conjuction
	})

	return { msgs, mods, stat: [0, 0] }
}

const stepFlipflop = (mod: FlipFlop, { send }: Message): StepResult => {
	const { id, state, to } = mod

	if (send === 1) return { mod }

	const next = 1 - state as Pulse
	return { mod: { ...mod, state: next }, send: { id, send: next, to } }
}

const stepConjunction = (mod: Conjuction, { id, send }: Message): StepResult => {
	const state = { ...mod.state, [id]: send }
	const next = 1 - Number([...Object.values(state)].every((x) => x === 1)) as Pulse

	return { mod: { ...mod, state }, send: { id: mod.id, send: next, to: mod.to } }
}

const step = (mod: Module, msg: Message): StepResult => {
	switch (mod.type) {
		case "%":
			return stepFlipflop(mod, msg)
		case "&":
			return stepConjunction(mod, msg)
	}
}

const runSteps = (msg: Message, mods: Module[], stat: [number, number]): Circuit => {
	const ran = mods
		.map((mod) => {
			const isMatch = msg.to.includes(mod.id)
			if (!isMatch) return { mod }

			return step(mod, msg)
		})
	const nextMods = ran.map((x) => x.mod)
	const nextMessages = ran.flatMap((x) => x.send ?? [])
	const highs = nextMessages.reduce((acc, x) => acc + x.send * x.to.length, 0)
	const lows = nextMessages.reduce((acc, x) => acc + x.to.length, 0) - highs
	// console.log({ highs, lows })
	const nextStat = [stat[0] + lows, stat[1] + highs] as [number, number]

	return { msgs: nextMessages, mods: nextMods, stat: nextStat }
}

const renderMessage = ({ id, send, to }: Message): string =>
	`${id} -${send ? "high" : "low"}-> ${to.join(",")}`

const runCircuit = ({ msgs, mods, stat }: Circuit): Circuit => {
	// button + broadcast
	stat[0] += 1 + msgs[0].to.length
	// console.log(stat)
	const msgsCopy = structuredClone(msgs)

	while (msgsCopy.length) {
		const msg = msgsCopy.shift()!
		const next = runSteps(msg, mods, stat)

		// console.log("[[STEP]] {")
		// console.log(next.msgs.map(renderMessage).join("\n"))
		// console.log(next.mods, next.stat)
		// console.log("}\n")
		msgsCopy.push(...next.msgs)
		mods = next.mods
		stat = next.stat
	}
	return { msgs, mods, stat }
}

const runCircuitsN = (circuit: Circuit, n: number): Circuit => {
	for (let i = 0; i < n; i++) {
		// console.log(`[[CIRCUIT ${i}]]`)
		circuit = runCircuit(circuit)
	}
	return circuit
}

if (import.meta.main) {
	const actual = await input(import.meta)

	const text = actual
	const circuit = parse(text)

	const result = runCircuitsN(circuit, 1000)
	console.log(result)
	console.log(result.stat.reduce(mul))
}
