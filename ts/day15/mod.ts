import { input, sum } from "$utils/mod.ts"

const step = (n: number, c: string): number => ((n + c.charCodeAt(0)) * 17) % 256
const hash = (s: string): number => s.split("").reduce(step, 0)

const text = await input(import.meta).then((x) => x.split(","))
//
// const text = "rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7".split(",")

// 256 boxes
type Content = { label: string; focalLength: number }
const boxes: Content[][] = Array.from({ length: 256 }, () => [])

text
	.forEach((x) => {
		if (x.includes("=")) {
			const [label, value] = x.split("=")
			const id = hash(label)
			const focalLength = +value

			const existingIdx = boxes[id].findIndex((x) => x.label === label)
			if (existingIdx === -1) {
				boxes[id].push({ label, focalLength })
			} else {
				boxes[id][existingIdx].focalLength = focalLength
			}
			// console.log({ existingIdx })

			// console.log({ id, focalLength })
		} else {
			const [label] = x.split("-")
			const id = hash(label)

			// remove content with label
			boxes[id] = boxes[id].filter((x) => x.label !== label)

			// console.log({ id })
		}
	})

// To confirm that all of the lenses are installed correctly, add up the focusing power of all of the lenses. The focusing power of a single lens is the result of multiplying together:

//     One plus the box number of the lens in question.
//     The slot number of the lens within the box: 1 for the first lens, 2 for the second lens, and so on.
//     The focal length of the lens.

const scores = boxes
    .flatMap((box, i) => box.map((lens, j) => (i + 1) * (j + 1) * lens.focalLength))

console.log(scores.reduce(sum))

// console.log(text.map(hash).reduce(sum))
