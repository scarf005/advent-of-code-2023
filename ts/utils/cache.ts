type Fn<Args extends unknown[], Ret> = (...args: Args) => Ret

/** cache the result of a function for JSON serializable arguments */
export const cached = <Args extends unknown[], Ret>(f: Fn<Args, Ret>): Fn<Args, Ret> => {
	const cache = new Map<string, Ret>()

	return (...args) => {
		const key = JSON.stringify(args)
		if (cache.has(key)) return cache.get(key)!
		const ret = f(...args)
		cache.set(key, ret)
		return ret
	}
}
