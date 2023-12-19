import { typedRegEx } from "$typed_regex/mod.ts"
import outdent from "$outdent/mod.ts"
import { input } from "$utils/mod.ts"

const example = outdent`
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}
`

const actual = await input(import.meta)
const text = actual

type Kind = "x" | "m" | "a" | "s"
type Part = Record<Kind, number>
type Workflow = { workflows: Record<"in" | string, Rule[]>; parts: Part[] }

type To = string | "R" | "A"
type Rule =
	| { type: ">" | "<"; by: number; from: Kind; to: To }
	| { type: "*"; to: To }

const ruleRe = typedRegEx("(?<from>\\w+)(?<type>[<>])(?<by>\\d+):(?<to>.*)")

const parseRule = (x: string): Rule => {
	if (!x.includes(":")) return { type: "*", to: x as To }

	const { from, to, type, by } = ruleRe.captures(x)!

	return { type: type as ">" | "<", by: +by, from: from as Kind, to: to as To }
}

const workflowRe = typedRegEx("(?<name>\\w+){(?<xs>.*)}")

const parseWorkflow = (x: string): [string, Rule[]] => {
	const { name, xs } = workflowRe.captures(x)!
	const ys = xs.split(",").map(parseRule)

	return [name, ys] as const
}

const partsRe = typedRegEx("{x=(?<x>\\d+),m=(?<m>\\d+),a=(?<a>\\d+),s=(?<s>\\d+)}")

const parseParts = (y: string): Part => {
	const { x, m, a, s } = partsRe.captures(y)!

	return { x: +x, m: +m, a: +a, s: +s }
}

const parse = (x: string): Workflow => {
	const [rawWorkflows, rawParts] = x.split("\n\n")

	const workflows = Object.fromEntries(rawWorkflows.split("\n").map(parseWorkflow))
	const parts = rawParts.split("\n").map(parseParts)

	return { workflows, parts }
}

const runRule = (rule: Rule, part: Part): To | "continue" => {
	// if rule doesn't match with part, return "continue"
	if (rule.type === "*") return rule.to
	if (rule.from in part === false) return "continue"

	switch (rule.type) {
		case ">":
			return part[rule.from] > rule.by ? rule.to : "continue"
		case "<":
			return part[rule.from] < rule.by ? rule.to : "continue"
		default:
			throw new Error(`Unknown input ${Deno.inspect(rule)} ${Deno.inspect(part)}`)
	}
}

const runRules = (rules: Rule[], part: Part): To => {
	let to: To | "continue" = "continue"

	for (const rule of rules) {
		to = runRule(rule, part)
		if (to !== "continue") break
	}

	return to
}

const isPartAccepted = (workflow: Workflow, part: Part): boolean => {
	let to: To = "in"

	while (to !== "R" && to !== "A") {
		const rules = workflow.workflows[to]
		to = runRules(rules, part)
	}

	if (to === "A") return true
	if (to === "R") return false
	throw new Error(`Unknown input ${Deno.inspect(to)}`)
}

const runWorkflow = (workflow: Workflow) =>
	workflow.parts
		.filter((part) => isPartAccepted(workflow, part))
		.reduce((acc, { x, m, a, s }) => acc + (x + m + a + s), 0)

const workflow = parse(text)

console.log(runWorkflow(workflow))
