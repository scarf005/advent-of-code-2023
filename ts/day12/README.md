read and  <https://gist.github.com/Nathan-Fenner/781285b77244f06cf3248a04869e7161>

```ts
const ways = (line: string, groups: readonly number[]): number => {
	console.log({ line, groups })

	if (line.length === 0) {
		if (groups.length === 0) {
			console.log("finished visiting all groups, for some reason we return 1")
			return 1
		}
		console.log("we exhasted all exisitng line, but still have groups to place, thus we failed this path")
		return 0
	}
	if (groups.length === 0) {
		if (line.includes("#")) {
			console.log("we exhasted all groups, but still have line to place, thus we failed this path")
			return 0
		}
		console.log("we exhasted all groups, and we exhasted all line, thus we return 1")
		return 1
	}
	if (line.length < groups.reduce(sum) + groups.length - 1) {
		console.log("it's not possible to place all groups on given line, thus we failed this path")
		return 0
	}

	if (line[0] === ".") {
		console.log("empty tile, advancing to next tile")
		return ways(line.slice(1), groups)
	}
	if (line[0] === "#") {
		const [group, ...rest] = groups
		if (line.slice(1, group).includes(".")) {
			console.log("candidate has . in the middle, thus cannot be placed")
			return 0
		}

		if (line[group] === "#") {
			console.log("after placing, there's extra # next to it thus it's not the size we want")
			return 0
		}

		console.log(`placed ${group} #, placing the rest`)
		return ways(line.slice(group + 1), rest)
	}

	console.log("we don't know the rest, try both approach")
	return ways("#" + line.slice(1), groups) + ways("." + line.slice(1), groups)
}
```
