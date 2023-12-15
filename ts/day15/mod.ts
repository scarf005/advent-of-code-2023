import { input, sum } from "$utils/mod.ts"

const step = (n: number, c: string): number => ((n + c.charCodeAt(0)) * 17) % 256
const hash = (s: string): number => s.split("").reduce(step, 0)

const text = await input(import.meta)
.then(x => x.split(","))

// const text = "rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7".split(",")

console.log(text.map(hash).reduce(sum))
