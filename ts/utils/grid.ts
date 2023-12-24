export type Grid<T> = readonly (readonly T[])[]
export const wh = <T>(xss: Grid<T>) => ({ width: xss[0].length, height: xss.length })
